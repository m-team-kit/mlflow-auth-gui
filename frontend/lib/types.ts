import { z } from 'zod';

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

export const MLFlowExperimentResponse = z.object({
  experiment: Experiment,
});
export type MLFlowExperimentResponse = z.infer<typeof MLFlowExperimentResponse>;

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
