import {
  mlflowExperimentPermissionCreate,
  mlflowExperimentPermissionGet,
  mlflowExperimentPermissionUpdate,
  mlflowModelPermissionCreate,
  mlflowModelPermissionUpdate,
} from '@/lib/serverApi';
import {
  GetExperimentPermissionRequest,
  UpdateExperimentPermissionRequest,
  GetModelPermissionRequest,
  UpdateModelPermissionRequest,
} from '@/lib/apiTypes';
import {
  error,
  MLFlowUserContext,
  NullableFields,
  UserContext,
  validAuthAndRegisteredDecorator,
} from '@/lib/helpers';
import { NextRequest } from 'next/server.js';
import { getExperimentPermission } from '@/app/user/permission/experiment/operations';
import { getModelPermission } from '@/app/user/permission/model/operations';
import { ExperimentPermission, Permission, Permissions } from '@/lib/mlflowTypes';

export type GetUserModelPermissionResponse = {
  username: string;
  model_name: string;
  permission: Permission;
};
/**
 * Get user model permissions
 *
 * @param request
 * @param context
 */
const getUserModelPermission = async (
  request: NextRequest,
  context: UserContext & MLFlowUserContext,
) => {
  const body = GetModelPermissionRequest.safeParse({
    username: request.nextUrl.searchParams.get('username'),
    model_name: request.nextUrl.searchParams.get('model_name'),
  } satisfies NullableFields<GetModelPermissionRequest>);
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  if (
    !context.mlflowUser.registered_model_permissions.some(
      (p) =>
        p.name === body.data.model_name &&
        (p.permission === Permissions.Edit || p.permission === Permissions.Manage),
    )
  ) {
    return error(403, 'You are not allowed to view this experiment');
  }

  const [permission, err] = await getModelPermission(body.data.username, body.data.model_name);
  if (err) {
    return err;
  }

  return Response.json({
    username: body.data.username,
    model_name: body.data.model_name,
    permission: permission.permission,
  } satisfies GetUserModelPermissionResponse);
};
export const GET = validAuthAndRegisteredDecorator(getUserModelPermission);

/**
 * Update user model permissions
 *
 * @param request
 * @param context
 */
const updateUserModelPermissions = async (
  request: NextRequest,
  context: UserContext & MLFlowUserContext,
) => {
  const body = UpdateModelPermissionRequest.safeParse(await request.json());
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  if (
    !context.mlflowUser.registered_model_permissions.some(
      (p) => p.name === body.data.model_name && p.permission == Permissions.Manage,
    )
  ) {
    return error(403, 'You are not allowed to add permissions for this model');
  }

  const [permission, permissionError] = await getModelPermission(
    body.data.username,
    body.data.model_name,
  );
  if (permissionError && permissionError.status !== 404) {
    return permissionError;
  }

  const mlflowUpdateR = await (permission
    ? mlflowModelPermissionUpdate
    : mlflowModelPermissionCreate)(body.data.username, body.data.model_name, body.data.permission);
  if (!mlflowUpdateR.ok) {
    console.error('updateUserModelPermissions failed:', await mlflowUpdateR.text());
    return error(500, "Couldn't update user model permissions in mlflow");
  }

  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const PUT = validAuthAndRegisteredDecorator(updateUserModelPermissions);
