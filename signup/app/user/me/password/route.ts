import { mlflowUserUpdatePassword, SECRETS_API, SECRETS_VO, updateSecret } from '@/lib/serverApi';
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

  //return new Response(undefined, { status: 204 });
  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const PATCH = validAuthDecorator(updateMyPassword);
