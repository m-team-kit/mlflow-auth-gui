import { mlflowUserUpdatePassword } from '@/lib/serverApi';
import { UpdatePasswordRequest } from '@/lib/apiTypes';
import { error, UserContext, validAuthDecorator } from '@/lib/helpers';

/**
 * Update the password of the MLFlow user associated with the current OIDC user
 *
 * @param request
 * @param context
 */
const updateMyPassword = async (request: Request, context: UserContext) => {
  const body = UpdatePasswordRequest.safeParse(await request.json());
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  const mlflowUpdatePasswordR = await mlflowUserUpdatePassword(
    context.user.email,
    body.data.password,
  );
  if (!mlflowUpdatePasswordR.ok) {
    console.error('updatePassword failed:', await mlflowUpdatePasswordR.text());
    return error(500, "Error updating user's password in mlflow");
  }

  //return new Response(undefined, { status: 204 });
  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const PATCH = validAuthDecorator(updateMyPassword);
