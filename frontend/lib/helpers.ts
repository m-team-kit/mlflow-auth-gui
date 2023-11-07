import { introspect } from '@/lib/serverApi';
import { UserinfoResponse, UserInfoResponse } from '@/lib/types';

export class NetworkError extends Error {
  response: Response;
  json: ErrorResponse;

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
    throw new NetworkError(response, await response.json());
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

export type UserContext = {
  user: UserinfoResponse;
};
export const validAuthDecorator = <ExtraContext extends Exclude<Record<string, any>, UserContext>>(
  target: (request: Request, context: Context<ExtraContext> & UserContext) => Promise<Response>,
): ((request: Request, context: Context<ExtraContext>) => Promise<Response>) =>
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

    return target(request, { ...context, user: userInfo });
  };
