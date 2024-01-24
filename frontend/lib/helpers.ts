import { introspect, mlflowUserGet } from '@/lib/serverApi';
import { UserinfoResponse, UserInfoResponse } from '@/lib/apiTypes';
import { MLFlowUserResponse } from '@/lib/mlflowTypes';

export class NetworkError extends Error {
  response: Response;
  json: ErrorResponse | null;

  constructor(response: Response, json: ErrorResponse) {
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
      response.headers.get('Content-Type') == 'application/json' ? await response.json() : null,
    );
  }
};

export const ifOk = async (response: Response) => {
  if (response.ok) {
    return response;
  } else {
    throw new NetworkError(response, await response.json());
  }
};

type ErrorResponse = {
  message: string;
};

export const error = (status: number, message: string) =>
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

export type UserContext = {
  user: UserinfoResponse;
};
export const validAuthDecorator = <
  ExtraContext extends Exclude<Record<string, any>, UserContext>,
  Req extends Request,
>(
  target: (request: Req, context: Context<ExtraContext> & UserContext) => Promise<Response>,
): ((request: Req, context: Context<ExtraContext>) => Promise<Response>) =>
  async function wrapped(request, context?) {
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

    if (
      userInfo.eduperson_entitlement == null ||
      !requiredEntitlement.some(
        (entitlement) => userInfo.eduperson_entitlement?.includes(entitlement) ?? false,
      )
    ) {
      return error(
        403,
        'You lack the required entitlement to access this service. Please contact the service administrator.',
      );
    }

    return target(request, { ...context, user: userInfo });
  };

export type MLFlowUserContext = {
  mlflowUser: MLFlowUserResponse['user'];
};
export const validAuthAndRegisteredDecorator = <
  ExtraContext extends Exclude<Record<string, any>, UserContext>,
  Req extends Request,
>(
  target: (
    request: Req,
    context: Context<ExtraContext> & UserContext & MLFlowUserContext,
  ) => Promise<Response>,
): ((request: Req, context: Context<ExtraContext>) => Promise<Response>) =>
  validAuthDecorator(async function wrapped(request, context?) {
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
