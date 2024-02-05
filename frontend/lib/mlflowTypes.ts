import { z } from 'zod';

export const Permissions = {
  Read: 'READ',
  Edit: 'EDIT',
  Manage: 'MANAGE',
  None: 'NO_PERMISSIONS',
} as const;
export const Permission = z.enum([
  Permissions.Read,
  Permissions.Edit,
  Permissions.Manage,
  Permissions.None,
]);
export type Permission = z.infer<typeof Permission>;

export const ExperimentPermission = z.object({
  experiment_id: z.string(),
  user_id: z.number(),
  permission: Permission,
});
export type ExperimentPermission = z.infer<typeof ExperimentPermission>;

export const RegisteredModelPermission = z.object({
  name: z.string(),
  user_id: z.number(),
  permission: Permission,
});
export type RegisteredModelPermission = z.infer<typeof RegisteredModelPermission>;

export const MLFlowUserResponse = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    is_admin: z.boolean(),
    experiment_permissions: z.array(ExperimentPermission),
    registered_model_permissions: z.array(RegisteredModelPermission),
  }),
});
export type MLFlowUserResponse = z.infer<typeof MLFlowUserResponse>;

export const Tag = z.object({
  key: z.string(),
  value: z.string(),
});
export type Tag = z.infer<typeof Tag>;

export const Experiment = z.object({
  experiment_id: z.string(),
  name: z.string(),
  artifact_location: z.string(),
  lifecycle_stage: z.string(),
  last_update_time: z.number(),
  creation_time: z.number(),
  tags: z.array(Tag).optional(),
});
export type Experiment = z.infer<typeof Experiment>;

export const ModelVersionStatus = z.enum(['PENDING_REGISTRATION', 'FAILED_REGISTRATION', 'READY']);
export type ModelVersionStatus = z.infer<typeof ModelVersionStatus>;

export const ModelVersionTag = z.object({
  key: z.string(),
  value: z.string(),
});
export type ModelVersionTag = z.infer<typeof ModelVersionTag>;

export const ModelVersion = z.object({
  name: z.string(),
  version: z.string(),
  creation_timestamp: z.number(),
  last_updated_timestamp: z.number(),
  user_id: z.number().optional(),
  current_stage: z.string(),
  description: z.string(),
  source: z.string(),
  run_id: z.string(),
  status: ModelVersionStatus,
  status_message: z.string().optional(),
  tags: z.array(ModelVersionTag).optional(),
  run_link: z.string(),
  aliases: z.array(z.string()).optional(),
});
export type ModelVersion = z.infer<typeof ModelVersion>;

export const RegisteredModelTag = z.object({
  key: z.string(),
  value: z.string(),
});
export type RegisteredModelTag = z.infer<typeof RegisteredModelTag>;

export const RegisteredModelAlias = z.object({
  alias: z.string(),
  version: z.string(),
});
export type RegisteredModelAlias = z.infer<typeof RegisteredModelAlias>;

export const RegisteredModel = z.object({
  name: z.string(),
  creation_timestamp: z.number(),
  last_updated_timestamp: z.number(),
  user_id: z.string().optional(),
  description: z.string().optional(),
  latest_versions: z.array(ModelVersion).optional(),
  tags: z.array(RegisteredModelTag).optional(),
  aliases: z.array(RegisteredModelAlias).optional(),
});
export type RegisteredModel = z.infer<typeof RegisteredModel>;

export const MLFlowExperimentResponse = z.object({
  experiment: Experiment,
});
export type MLFlowExperimentResponse = z.infer<typeof MLFlowExperimentResponse>;

export const MLFlowModelResponse = z.object({
  registered_model: RegisteredModel,
});
export type MLFlowModelResponse = z.infer<typeof MLFlowModelResponse>;
