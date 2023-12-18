import { error, ValueOrError } from '@/lib/helpers';
import { ModelPermissionResponse } from '@/lib/apiTypes';
import { mlflowModelPermissionGet } from '@/lib/serverApi';
import { RegisteredModelPermission } from '@/lib/mlflowTypes';

export const getModelPermission = async (
  username: string,
  modelName: string,
): Promise<ValueOrError<RegisteredModelPermission>> => {
  const permission = await mlflowModelPermissionGet(username, modelName);
  if (!permission.ok) {
    if (permission.status === 404) {
      console.log(username, modelName, permission, await permission.json());
      return [null, error(404, 'User model permission entry not found')];
    }
    return [null, error(500, "Couldn't get user model permission entry")];
  }
  const userModelPermissionJson = await permission.json();
  const userModelPermission = ModelPermissionResponse.safeParse(userModelPermissionJson);
  if (!userModelPermission.success) {
    console.error(
      'getModelPermission failed:',
      userModelPermission.error.message,
      userModelPermissionJson,
    );
    return [null, error(500, `Invalid response from MLFlow ${userModelPermission.error.message}`)];
  }

  return [userModelPermission.data.registered_model_permission, null];
};
