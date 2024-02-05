import { error, ValueOrError } from '@/lib/helpers';
import { ExperimentPermissionResponse } from '@/lib/apiTypes';
import { mlflowExperimentPermissionGet } from '@/lib/serverApi';
import { ExperimentPermission } from '@/lib/mlflowTypes';

export const getExperimentPermission = async (
  username: string,
  experimentId: string,
): Promise<ValueOrError<ExperimentPermission>> => {
  const permission = await mlflowExperimentPermissionGet(username, experimentId);
  if (!permission.ok) {
    if (permission.status === 404) {
      console.log(username, experimentId, permission, await permission.json());
      return [null, error(404, 'User experiment permission entry not found')];
    }
    return [null, error(500, "Couldn't get user experiment permission entry")];
  }
  const userExperimentPermissionJson = await permission.json();
  const userExperimentPermission = ExperimentPermissionResponse.safeParse(
    userExperimentPermissionJson,
  );
  if (!userExperimentPermission.success) {
    console.error(
      'getExperimentPermission failed:',
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
