import {
  mlflowExperimentPermissionCreate,
  mlflowExperimentPermissionGet,
  mlflowExperimentPermissionUpdate,
} from '@/lib/serverApi';
import { GetExperimentPermissionRequest, UpdateExperimentPermissionRequest } from '@/lib/apiTypes';
import {
  error,
  MLFlowUserContext,
  UserContext,
  validAuthAndRegisteredDecorator,
} from '@/lib/helpers';
import { NextRequest } from 'next/server.js';
import { getExperimentPermission } from '@/app/user/permission/experiment/operations';
import { ExperimentPermission, Permission, Permissions } from '@/lib/mlflowTypes';

export type GetUserExperimentPermissionResponse = {
  username: string;
  experiment_id: string;
  permission: Permission;
};
/**
 * Get user experiment permissions
 *
 * @param request
 * @param context
 */
const getUserPermissions = async (
  request: NextRequest,
  context: UserContext & MLFlowUserContext,
) => {
  const body = GetExperimentPermissionRequest.safeParse({
    username: request.nextUrl.searchParams.get('username'),
    experiment_id: request.nextUrl.searchParams.get('experiment_id'),
  });
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  if (
    !context.mlflowUser.experiment_permissions.some(
      (p) =>
        p.experiment_id === body.data.experiment_id &&
        (p.permission === Permissions.Edit || p.permission === Permissions.Manage),
    )
  ) {
    return error(403, 'You are not allowed to view this experiment');
  }

  const [permission, err] = await getExperimentPermission(
    body.data.username,
    body.data.experiment_id,
  );
  if (err) {
    return err;
  }

  return Response.json({
    username: body.data.username,
    experiment_id: body.data.experiment_id,
    permission: permission.permission,
  } satisfies GetUserExperimentPermissionResponse);
};
export const GET = validAuthAndRegisteredDecorator(getUserPermissions);

/**
 * Update user experiment permissions
 *
 * @param request
 * @param context
 */
const updateUserExperimentPermission = async (
  request: NextRequest,
  context: UserContext & MLFlowUserContext,
) => {
  const body = UpdateExperimentPermissionRequest.safeParse(await request.json());
  if (!body.success) {
    return error(422, `Validation failed: ${body.error.message}`);
  }

  if (
    !context.mlflowUser.experiment_permissions.some(
      (p) => p.experiment_id === body.data.experiment_id && p.permission == Permissions.Manage,
    )
  ) {
    return error(403, 'You are not allowed to add permissions for this experiment');
  }

  const [permission, permissionError] = await getExperimentPermission(
    body.data.username,
    body.data.experiment_id,
  );
  if (permissionError && permissionError.status !== 404) {
    return permissionError;
  }

  const mlflowUpdateR = await (permission
    ? mlflowExperimentPermissionUpdate
    : mlflowExperimentPermissionCreate)(
    body.data.username,
    body.data.experiment_id,
    body.data.permission,
  );
  if (!mlflowUpdateR.ok) {
    console.error('updateUserExperimentPermission failed:', await mlflowUpdateR.text());
    return error(500, "Couldn't update user experiment permission in mlflow");
  }

  // TODO: use 204 once next fixes their shit
  return new Response(undefined, { status: 200 });
};
export const PUT = validAuthAndRegisteredDecorator(updateUserExperimentPermission);
