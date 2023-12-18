import { GetExperimentRequest } from '@/lib/apiTypes';
import { NextRequest } from 'next/server';
import {
  error,
  MLFlowUserContext,
  UserContext,
  validAuthAndRegisteredDecorator,
} from '@/lib/helpers';
import { getExperimentFromMlflow } from './operations';
import { Experiment, Permissions } from '@/lib/mlflowTypes';

export type GetExperimentResponse = Experiment;
/**
 * Get experiment
 *
 * This proxies the request to MLFlow, so the user doesn't need to sign in on MLFlow.
 *
 * @param request
 * @param context
 */
const getExperiment = async (request: NextRequest, context: UserContext & MLFlowUserContext) => {
  const body = GetExperimentRequest.safeParse({
    experiment_id: request.nextUrl.searchParams.get('experiment_id'),
  });
  if (!body.success) {
    return error(400, `Validation failed: ${body.error.message}`);
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

  const [experiment, err] = await getExperimentFromMlflow(body.data.experiment_id);
  if (err) {
    return err;
  }

  return Response.json(experiment satisfies GetExperimentResponse);
};
export const GET = validAuthAndRegisteredDecorator(getExperiment);
