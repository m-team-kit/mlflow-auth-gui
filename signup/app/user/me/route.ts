import {
  deleteSecret,
  mlflowUserCreate,
  mlflowUserDelete,
  mlflowUserGet,
  SECRETS_API,
  SECRETS_VO,
  updateSecret,
} from '@/lib/serverApi';
import { CreateUserRequest, UserinfoResponse } from '@/lib/apiTypes';
import { error, UserContext, validAuthDecorator } from '@/lib/helpers';
import { MLFlowUserResponse } from '@/lib/mlflowTypes';

export type GetMeResponse = {
  oidc: UserinfoResponse;
  mlflow: MLFlowUserResponse | null;
};
/**
 * Get information about the current user
 *
 * The user identifier is derived from the OIDC email address, not any parameters.
 *
 * @param request
 * @param context
 */
const getMe = async (request: Request, context: UserContext) => {
  const mlflowUserR = await mlflowUserGet(context.user.email);
  if (mlflowUserR.status === 404) {
    return Response.json({ oidc: context.user, mlflow: null });
  }
  if (mlflowUserR.status !== 200) {
    console.error('getMe failed:', await mlflowUserR.text());
    return error(500, 'Failed to get user from MLFlow');
  }

  const mlflowUserJson = await mlflowUserR.json();
  const mlflowUserValidation = MLFlowUserResponse.safeParse(mlflowUserJson);
  if (!mlflowUserValidation.success) {
    console.error('getMe failed:', mlflowUserValidation.error.message, mlflowUserJson);
    return error(500, `Invalid response from MLFlow ${mlflowUserValidation.error.message}`);
  }

  return Response.json({
    oidc: context.user,
    mlflow: mlflowUserValidation.data,
  } satisfies GetMeResponse);
};
export const GET = validAuthDecorator(getMe);

export type CreateMeResponse = {
  user: MLFlowUserResponse;
};
/**
 * Register a new user on MLFlow
 *
 * @param request
 * @param context
 */
const createMe = async (request: Request, context: UserContext) => {
  const body = CreateUserRequest.safeParse(await request.json());
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  const createResponse = await mlflowUserCreate(context.user.email, body.data.password);
  if (!createResponse.ok) {
    console.error('createMe failed:', await createResponse.text());
    return error(500, "Couldn't create user in mlflow");
  }

  const createResponseBody = await createResponse.json();
  const validation = MLFlowUserResponse.safeParse(createResponseBody);
  if (!validation.success) {
    console.error('createMe failed:', validation.error.message, createResponseBody);
    return error(500, `Invalid response from MLFlow: ${validation.error.message}`);
  }

  // should be guaranteed to be valid through validAuthDecorator
  const authorization = request.headers.get('Authorization');

  if (SECRETS_VO.length > 0 && SECRETS_API.length > 0 && authorization != null) {
    const secretResponse = await updateSecret(
      authorization,
      context.user.email,
      body.data.password,
    );
    if (!secretResponse.ok) {
      // TODO: delete mlflow user? retry? mlflow and secret should ideally be synchronized, but this control panel is the authority
      //       and allows just changing the password if it goes wrong
      console.warn('createMe waning: could not update secret:', await secretResponse.text());
      return error(500, 'Could not update secret');
    }
  }

  return Response.json({
    user: validation.data,
  } satisfies CreateMeResponse);
};
export const POST = validAuthDecorator(createMe);

/**
 * Delete the current user from MLFlow
 *
 * @param request
 * @param context
 */
const deleteMe = async (request: Request, context: UserContext) => {
  const mlflowDeleteR = await mlflowUserDelete(context.user.email);
  if (!mlflowDeleteR.ok) {
    console.error('deleteMe failed:', await mlflowDeleteR.text());
    return new Response('Internal Server Error', { status: 500 });
  }

  // should be guaranteed to be valid through validAuthDecorator
  const authorization = request.headers.get('Authorization');

  if (SECRETS_VO.length > 0 && SECRETS_API.length > 0 && authorization != null) {
    const secretResponse = await deleteSecret(authorization);
    if (!secretResponse.ok) {
      // TODO: this leaves trash in vault, but not much we can do without workers
      console.warn('deleteMe waning: could not delete secret:', await secretResponse.text());
      return error(500, 'Could not delete secret');
    }
  }

  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const DELETE = validAuthDecorator(deleteMe);
