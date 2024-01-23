import { error, ValueOrError } from '@/lib/helpers';
import { mlflowModelGet } from '@/lib/serverApi';
import { MLFlowModelResponse, RegisteredModel } from '@/lib/mlflowTypes';

export const getModelFromMlflow = async (
  modelName: string,
): Promise<ValueOrError<RegisteredModel>> => {
  const modelResponse = await mlflowModelGet(modelName);
  if (!modelResponse.ok) {
    if (modelResponse.status === 404) {
      return [null, error(404, 'Model not found')];
    }
    return [null, error(500, "Couldn't get model")];
  }
  const modelJson = await modelResponse.json();
  const model = MLFlowModelResponse.safeParse(modelJson);
  if (!model.success) {
    console.error('getModelFromMlflow failed:', model.error.message, JSON.stringify(modelJson));
    return [null, error(500, `Invalid response from MLFlow ${model.error.message}`)];
  }

  return [model.data.registered_model, null];
};
