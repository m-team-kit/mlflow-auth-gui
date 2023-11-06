export type UserinfoResponse = {
  sub: string;
  active: boolean;
  eduperson_entitlement?: string[];
  email: string;
  email_verified: boolean;
};

export type IntrospectionResponse = {
  active: boolean;
  client_id: string;
  eduperson_entitlement?: string[];
  email: string;
  email_verified: boolean;
  iss: string;
  scope: string;
};

const Permission = {
  Read: 'READ',
  Edit: 'EDIT',
  Manage: 'MANAGE',
  None: 'NO_PERMISSIONS',
};
type Permission = (typeof Permission)[keyof typeof Permission];

type ExperimentPermission = {
  experiment_id: string;
  user_id: string;
  permission: Permission;
};
type RegisteredModelPermission = {
  name: string;
  user_id: string;
  permission: Permission;
};

export type MLFlowUserResponse = {
  id: string;
  username: string;
  is_admin: boolean;
  experiment_permissions: ExperimentPermission[];
  registered_model_permissions: RegisteredModelPermission[];
};

const localApiAuthorization = `Basic ${Buffer.from(
  process.env['MLFLOW_USERNAME'] + ':' + process.env['MLFLOW_PASSWORD'],
).toString('base64')}`;

const HOSTNAME = process.env['MLFLOW_HOSTNAME'] ?? 'http://localhost';
const OAUTH_INTROSPECTION =
  process.env['OAUTH_INTROSPECTION_ENDPOINT'] ??
  'https://aai-demo.egi.eu/auth/realms/egi/protocol/openid-connect/token/introspect';
const OAUTH_USERINFO =
  process.env['OAUTH_USERINFO_ENDPOINT'] ??
  'https://aai-demo.egi.eu/auth/realms/egi/protocol/openid-connect/userinfo';

export const introspect = async (token: string) =>
  fetch(OAUTH_USERINFO, {
    headers: {
      Authorization: token,
    },
  });

export const mlflowUserGet = async (username: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/users/get?${new URLSearchParams({
      username: username,
    })}`,
    {
      headers: {
        Authorization: localApiAuthorization,
      },
    },
  );

export const mlflowUserCreate = async (username: string, password: string) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/users/create`, {
    method: 'POST',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

export const mlflowUserUpdatePassword = async (username: string, password: string) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/users/update-password`, {
    method: 'PATCH',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

export const mlflowUserDelete = async (username: string) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/users/delete`, {
    method: 'DELETE',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
    }),
  });
