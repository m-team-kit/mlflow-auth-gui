import { introspect, mlflowUserGet } from '@/lib/serverApi';
import { UserinfoResponse, UserInfoResponse } from '@/lib/apiTypes';
import { MLFlowUserResponse } from '@/lib/mlflowTypes';

export class NetworkError extends Error {
  response: Response;
  json: ErrorResponse | null;

  constructor(response: Response, json: ErrorResponse | null = null) {
    super(response.statusText);
    this.response = response;
    this.json = json;
  }
}

export const jsonIfOk = async (response: Response) => {
  if (response.ok) {
    return response.json();
  } else {
    throw new NetworkError(
      response,
      response.headers.get('Content-Type') === 'application/json' ? await response.json() : null,
    );
  }
};

export const ifOk = async (response: Response) => {
  if (response.ok) {
    return response;
  } else {
    const errorJson = response.headers.get('Content-Type') === 'application/json' 
      ? await response.json() 
      : null;
    throw new NetworkError(response, errorJson);
  }
};

type ErrorResponse = {
  message: string;
};

export const error = (status: number, message: string): Response =>
  Response.json(
    {
      message,
    } satisfies ErrorResponse,
    {
      status: status,
    },
  );

type Context<T> = T extends Record<string, any> ? T : never;

const requiredEntitlement = process.env['REQUIRED_ENTITLEMENT']?.split(',') ?? [
  'urn:mace:egi.eu:group:vo.ai4eosc.eu:role=member#aai.egi.eu',
];

const requiredRealmRoles = process.env['REQUIRED_REALM_ROLES']?.split(',') ?? [
  'vo.ai4eosc.eu',
  'platform-access:vo.ai4eosc.eu',
];

// Detect which validation method to use based on env vars
const detectProviderType = (): 'realm_roles' | 'entitlement' | 'none' => {
  const hasRealmRolesEnv = !!process.env['REQUIRED_REALM_ROLES'];
  const hasEntitlementEnv = !!process.env['REQUIRED_ENTITLEMENT'];

  if (hasRealmRolesEnv && hasEntitlementEnv) {
    console.error('Misconfiguration: Both REQUIRED_REALM_ROLES and REQUIRED_ENTITLEMENT are set. Only one must be defined!');
    return 'none';
  }

  if (hasRealmRolesEnv) return 'realm_roles';
  if (hasEntitlementEnv) return 'entitlement';
  return 'none';
};

const validateUserAccess = (userInfo: UserinfoResponse): boolean => {
  const providerType = detectProviderType();

  if (providerType === 'realm_roles') {
    const userRoles = userInfo.realm_access?.roles || [];
    return requiredRealmRoles.every(role => userRoles.includes(role));
  }

  if (providerType === 'entitlement') {
    const entitlements = userInfo.eduperson_entitlement || [];
    return requiredEntitlement.some(ent => entitlements.includes(ent));
  }

  console.warn('No REQUIRED_REALM_ROLES or REQUIRED_ENTITLEMENT set in environment or misconfiguration detected.');
  return false;
};


type Handler<Req extends Request = Request, T = object> = (request: Req, context: T & object) => Promise<Response>;

export type UserContext = {
  user: UserinfoResponse;
};

export const validAuthDecorator = <Req extends Request>(
  target: Handler<Req, UserContext>
): Handler<Req> =>
  async function wrapped(request: Req, context?: any): Promise<Response> {
    const token = request.headers.get('Authorization');
    if (token == null || !token.startsWith('Bearer')) {
      return error(401, 'No or wrongly formatted authentication');
    }

    const userInfoR = await introspect(token);
    if (!userInfoR.ok) {
      return error(401, 'Invalid access token');
    }

    const userInfoValidation = UserInfoResponse.safeParse(await userInfoR.json());
    if (!userInfoValidation.success) {
      return error(
        500,
        `Unexpected response from OIDC userinfo ${userInfoValidation.error.message}`,
      );
    }
    const userInfo = userInfoValidation.data;

    if (!validateUserAccess(userInfo)) {
      const providerType = detectProviderType();
      const errorMessage = providerType === 'entitlement' 
        ? 'You lack the required entitlement to access this service. Please contact the service administrator.'
        : 'You lack the required roles to access this service. Please contact the service administrator.';
      
      return error(403, errorMessage);
    }

    return target(request, { ...context, user: userInfo } as UserContext & any);
  };

export type MLFlowUserContext = {
  mlflowUser: MLFlowUserResponse['user'];
};

export const validAuthAndRegisteredDecorator = <Req extends Request>(
  target: Handler<Req, UserContext & MLFlowUserContext>,
): Handler<Req> =>
  validAuthDecorator(async function wrapped(request: Req, context: UserContext): Promise<Response> {
    const mlflowUserR = await mlflowUserGet(context.user.email);
    if (mlflowUserR.status === 404) {
      return error(403, 'Not registered');
    }
    if (mlflowUserR.status !== 200) {
      console.error('getUserPermissions failed:', await mlflowUserR.text());
      return error(500, 'Failed to get user from MLFlow');
    }

    const mlflowUserJson = await mlflowUserR.json();
    const mlflowUserValidation = MLFlowUserResponse.safeParse(mlflowUserJson);
    if (!mlflowUserValidation.success) {
      console.error(
        'getUserPermissions failed:',
        mlflowUserValidation.error.message,
        mlflowUserJson,
      );
      return error(500, `Invalid response from MLFlow ${mlflowUserValidation.error.message}`);
    }

    return target(request, { ...context, mlflowUser: mlflowUserValidation.data.user });
  });

// a poor man's Either
export type ValueOrError<T, ErrorT = Response> = [T, null] | [null, ErrorT];

export type NullableFields<T> = {
  [P in keyof T]: T[P] | null;
};
