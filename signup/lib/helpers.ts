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

// detect which provider is config based on available fields in userinfo
const detectProviderType = (userInfo: UserinfoResponse): 'egi' | 'ai4eosc' => {
  // EGI provider has eduperson_entitlement field
  if (userInfo.eduperson_entitlement != null) {
    return 'egi';
  }
  
  // AI4EOSC provider has groups, realm_access, or group_membership fields
  if (userInfo.groups != null || userInfo.realm_access != null || userInfo.group_membership != null) {
    return 'ai4eosc';
  }
  
  // Default to AI4EOSC if no specific fields are found
  return 'ai4eosc';
};

const validateUserAccess = (userInfo: UserinfoResponse): boolean => {
  const providerType = detectProviderType(userInfo);
  
  if (providerType === 'egi') {
    // EGI provider validation using entitlements
    const requiredEntitlement = process.env['REQUIRED_ENTITLEMENT']?.split(',') ?? [
      'urn:mace:egi.eu:group:vo.ai4eosc.eu:role=member#aai.egi.eu',
    ];
    
    if (
      userInfo.eduperson_entitlement == null ||
      !requiredEntitlement.some(
        (entitlement) => userInfo.eduperson_entitlement?.includes(entitlement) ?? false,
      )
    ) {
      return false;
    }
  } else if (providerType === 'ai4eosc') {
    // AI4EOSC provider validation using groups and realm roles
    const requiredGroup = process.env['REQUIRED_GROUP_AI4EOSC']?.split(',') ?? ['vo.ai4eosc.eu'];
    const requiredRealmRoles = process.env['REQUIRED_REALM_ROLES_AI4EOSC']?.split(',') ?? [];
    
    const hasRequiredGroup = requiredGroup.some((group) => {
      // Check in groups array
      if (userInfo.groups?.includes(group)) {
        return true;
      }
      // Check in realm_access.roles array
      if (userInfo.realm_access?.roles?.includes(group)) {
        return true;
      }
      // Check in group_membership array (for path-based groups)
      if (userInfo.group_membership?.some((membership) => membership.includes(group))) {
        return true;
      }
      return false;
    });

    const hasRequiredRealmRole = requiredRealmRoles.length === 0 || requiredRealmRoles.some((role) => {
      return userInfo.realm_access?.roles?.includes(role) ?? false;
    });

    if (!hasRequiredGroup || !hasRequiredRealmRole) {
      return false;
    }
  }

  return true;
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
      const providerType = detectProviderType(userInfo);
      const errorMessage = providerType === 'egi' 
        ? 'You lack the required entitlement to access this service. Please contact the service administrator.'
        : 'You lack the required group membership to access this service. Please contact the service administrator.';
      
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