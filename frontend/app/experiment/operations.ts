import { error, ValueOrError } from '@/lib/helpers';
import { mlflowExperimentGet } from '@/lib/serverApi';
import { Experiment, MLFlowExperimentResponse } from '@/lib/mlflowTypes';

export const getExperimentFromMlflow = async (
  experimentId: string,
): Promise<ValueOrError<Experiment>> => {
  const experimentResponse = await mlflowExperimentGet(experimentId);
  if (!experimentResponse.ok) {
    if (experimentResponse.status === 404) {
      return [null, error(404, 'Experiment not found')];
    }
    return [null, error(500, "Couldn't get experiment")];
  }
  const experimentJson = await experimentResponse.json();
  const experiment = MLFlowExperimentResponse.safeParse(experimentJson);
  if (!experiment.success) {
    console.error(
      'getExperimentFromMlflow failed:',
      experiment.error.message,
      JSON.stringify(experimentJson),
    );
    return [null, error(500, `Invalid response from MLFlow ${experiment.error.message}`)];
  }

  return [experiment.data.experiment, null];
};
