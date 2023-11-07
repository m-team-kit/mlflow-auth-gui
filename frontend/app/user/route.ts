import { mlflowUserCreate, mlflowUserDelete, mlflowUserGet } from '@/lib/serverApi';
import { CreateUserRequest, MLFlowUserResponse, UserinfoResponse } from '@/lib/types';
import { error, UserContext, validAuthDecorator } from '@/lib/helpers';

export type GetUserResponse = {
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
const getUser = async (request: Request, context: UserContext) => {
  const mlflowUserR = await mlflowUserGet(context.user.email);
  if (mlflowUserR.status === 404) {
    return Response.json({ oidc: context.user, mlflow: null });
  }
  if (mlflowUserR.status !== 200) {
    console.error('getUser failed:', await mlflowUserR.text());
    return error(500, 'Failed to get user from MLFlow');
  }

  const mlflowUserJson = await mlflowUserR.json();
  const mlflowUserValidation = MLFlowUserResponse.safeParse(mlflowUserJson);
  if (!mlflowUserValidation.success) {
    console.error('getUser failed:', mlflowUserValidation.error.message, mlflowUserJson);
    return error(500, `Invalid response from MLFlow ${mlflowUserValidation.error.message}`);
  }

  return Response.json({
    oidc: context.user,
    mlflow: mlflowUserValidation.data,
  } satisfies GetUserResponse);
};
export const GET = validAuthDecorator(getUser);

export type CreateUserResponse = {
  user: MLFlowUserResponse;
};
/**
 * Register a new user on MLFlow
 *
 * @param request
 * @param context
 */
const createUser = async (request: Request, context: UserContext) => {
  const body = CreateUserRequest.safeParse(await request.json());
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  const mlflowCreateR = await mlflowUserCreate(context.user.email, body.data.password);
  if (!mlflowCreateR.ok) {
    console.error('createUser failed:', await mlflowCreateR.text());
    return error(500, "Couldn't create user in mlflow");
  }

  const mlflowCreateJson = await mlflowCreateR.json();
  const mlflowCreateValidation = MLFlowUserResponse.safeParse(mlflowCreateJson);
  if (!mlflowCreateValidation.success) {
    console.error('createUser failed:', mlflowCreateValidation.error.message, mlflowCreateJson);
    return error(500, `Invalid response from MLFlow: ${mlflowCreateValidation.error.message}`);
  }

  return Response.json({
    user: mlflowCreateValidation.data,
  } satisfies CreateUserResponse);
};
export const POST = validAuthDecorator(createUser);

/**
 * Delete the current user from MLFlow
 *
 * @param request
 * @param context
 */
const deleteUser = async (request: Request, context: UserContext) => {
  const mlflowDeleteR = await mlflowUserDelete(context.user.email);
  if (!mlflowDeleteR.ok) {
    console.error('deleteUser failed:', await mlflowDeleteR.text());
    return new Response('Internal Server Error', { status: 500 });
  }

  //return new Response(undefined, { status: 204 });
  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const DELETE = validAuthDecorator(deleteUser);
