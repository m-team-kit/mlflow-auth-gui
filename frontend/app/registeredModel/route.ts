import { GetModelRequest } from '@/lib/apiTypes';
import { NextRequest } from 'next/server';
import {
  error,
  MLFlowUserContext,
  NullableFields,
  UserContext,
  validAuthAndRegisteredDecorator,
} from '@/lib/helpers';
import { getModelFromMlflow } from './operations';
import { Permissions, RegisteredModel } from '@/lib/mlflowTypes';

export type GetModelResponse = RegisteredModel;
/**
 * Get model
 *
 * This proxies the request to MLFlow, so the user doesn't need to sign in on MLFlow.
 *
 * @param request
 * @param context
 */
const getModel = async (request: NextRequest, context: UserContext & MLFlowUserContext) => {
  const body = GetModelRequest.safeParse({
    model_name: request.nextUrl.searchParams.get('model_name'),
  } satisfies NullableFields<GetModelRequest>);
  if (!body.success) {
    return error(400, `Validation failed: ${body.error.message}`);
  }

  if (
    !context.mlflowUser.registered_model_permissions.some(
      (p) =>
        p.name === body.data.model_name &&
        (p.permission === Permissions.Edit || p.permission === Permissions.Manage),
    )
  ) {
    return error(403, 'You are not allowed to view this model');
  }

  const [model, err] = await getModelFromMlflow(body.data.model_name);
  if (err) {
    return err;
  }

  return Response.json(model satisfies GetModelResponse);
};
export const GET = validAuthAndRegisteredDecorator(getModel);
