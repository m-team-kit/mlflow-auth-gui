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
};
const Permission = z.enum([
  Permissions.Read,
  Permissions.Edit,
  Permissions.Manage,
  Permissions.None,
]);
type Permission = z.infer<typeof Permission>;

const ExperimentPermission = z.object({
  experiment_id: z.string(),
  user_id: z.string(),
  permission: Permission,
});
type ExperimentPermission = z.infer<typeof ExperimentPermission>;

const RegisteredModelPermission = z.object({
  name: z.string(),
  user_id: z.string(),
  permission: Permission,
});
type RegisteredModelPermission = z.infer<typeof RegisteredModelPermission>;

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

export const CreateUserRequest = z.object({
  password: z.string().min(1),
});
export type CreateUserRequest = z.infer<typeof CreateUserRequest>;

export const UpdatePasswordRequest = z.object({
  password: z.string().min(1),
});
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequest>;
