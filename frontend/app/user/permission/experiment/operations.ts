import { error, ValueOrError } from '@/lib/helpers';
import { ExperimentPermission, ExperimentPermissionResponse } from '@/lib/types';
import { mlflowExperimentPermissionGet } from '@/lib/serverApi';

export const getExperimentPermission = async (
  username: string,
  experimentId: string,
): Promise<ValueOrError<ExperimentPermission>> => {
  const permission = await mlflowExperimentPermissionGet(username, experimentId);
  if (!permission.ok) {
    if (permission.status === 404) {
      console.log(username, experimentId, permission, await permission.json());
      return [null, error(404, 'User permission entry not found')];
    }
    return [null, error(500, "Couldn't get user permission entry")];
  }
  const userExperimentPermissionJson = await permission.json();
  const userExperimentPermission = ExperimentPermissionResponse.safeParse(
    userExperimentPermissionJson,
  );
  if (!userExperimentPermission.success) {
    console.error(
      'getUserPermissions failed:',
      userExperimentPermission.error.message,
      userExperimentPermissionJson,
    );
    return [
      null,
      error(500, `Invalid response from MLFlow ${userExperimentPermission.error.message}`),
    ];
  }

  return [userExperimentPermission.data.experiment_permission, null];
};
