import { z } from 'zod';
import { ExperimentPermission, Permission, RegisteredModelPermission } from '@/lib/mlflowTypes';

export const UserInfoResponse = z.object({
  sub: z.string(),
  eduperson_entitlement: z.optional(z.array(z.string())),
  email: z.string(),
  email_verified: z.boolean(),
});
export type UserinfoResponse = z.infer<typeof UserInfoResponse>;

export const IntrospectionResponse = z.object({
  active: z.boolean(),
  client_id: z.string(),
  eduperson_entitlement: z.optional(z.array(z.string())),
  email: z.string(),
  email_verified: z.boolean(),
  iss: z.string(),
  scope: z.string(),
});
export type IntrospectionResponse = z.infer<typeof IntrospectionResponse>;

const Password = z.string().min(1, 'Password must be at least 1 character long');

export const CreateUserRequest = z.object({
  password: Password,
});
export type CreateUserRequest = z.infer<typeof CreateUserRequest>;

export const UpdatePasswordRequest = z.object({
  password: Password,
});
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequest>;

export const GetExperimentPermissionRequest = z.object({
  username: z.string(),
  experiment_id: z.string(),
});
export type GetExperimentPermissionRequest = z.infer<typeof GetExperimentPermissionRequest>;

export const UpdateExperimentPermissionRequest = z.object({
  username: z.string(),
  experiment_id: z.string(),
  permission: Permission,
});
export type UpdateExperimentPermissionRequest = z.infer<typeof UpdateExperimentPermissionRequest>;

export const ExperimentPermissionResponse = z.object({
  experiment_permission: ExperimentPermission,
});
export type ExperimentPermissionResponse = z.infer<typeof ExperimentPermissionResponse>;

export const GetExperimentRequest = z.object({
  experiment_id: z.string(),
});
export type GetExperimentRequest = z.infer<typeof GetExperimentRequest>;

export const GetModelPermissionRequest = z.object({
  username: z.string(),
  model_name: z.string(),
});
export type GetModelPermissionRequest = z.infer<typeof GetModelPermissionRequest>;

export const UpdateModelPermissionRequest = z.object({
  username: z.string(),
  model_name: z.string(),
  permission: Permission,
});
export type UpdateModelPermissionRequest = z.infer<typeof UpdateModelPermissionRequest>;

export const ModelPermissionResponse = z.object({
  registered_model_permission: RegisteredModelPermission,
});
export type ModelPermissionResponse = z.infer<typeof ModelPermissionResponse>;

export const GetModelRequest = z.object({
  model_name: z.string(),
});
export type GetModelRequest = z.infer<typeof GetModelRequest>;
