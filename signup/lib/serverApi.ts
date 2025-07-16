import { Permission } from '@/lib/mlflowTypes';

const localApiAuthorization = `Basic ${Buffer.from(
  process.env['MLFLOW_USERNAME'] + ':' + process.env['MLFLOW_PASSWORD'],
).toString('base64')}`;

const HOSTNAME = process.env['MLFLOW_HOSTNAME'] ?? 'http://localhost';

// If OIDC Option 1 is set
// const OAUTH_INTROSPECTION =
//   process.env['OAUTH_INTROSPECTION_ENDPOINT'] ??
//   'https://aai-demo.egi.eu/auth/realms/egi/protocol/openid-connect/token/introspect';
// const OAUTH_USERINFO =
//   process.env['OAUTH_USERINFO_ENDPOINT'] ??
//   'https://aai-demo.egi.eu/auth/realms/egi/protocol/openid-connect/userinfo';

// If OIDC Option 2 is set
const OAUTH_INTROSPECTION =
  process.env['OAUTH_INTROSPECTION_ENDPOINT'] ??
  'https://login.cloud.ai4eosc.eu/realms/ai4eosc/protocol/openid-connect/token/introspect';
  

const OAUTH_USERINFO =
  process.env['OAUTH_USERINFO_ENDPOINT'] ??
  'https://login.cloud.ai4eosc.eu/realms/ai4eosc/protocol/openid-connect/userinfo';


// Check OIDC configuration vars for missing or empty values

if (!OAUTH_INTROSPECTION || OAUTH_INTROSPECTION.trim() === '') {
  throw new Error('Missing required environment variable: OAUTH_INTROSPECTION_ENDPOINT');
}

if (!OAUTH_USERINFO || OAUTH_USERINFO.trim() === '') {
  throw new Error('Missing required environment variable: OAUTH_USERINFO_ENDPOINT');
}

console.log('OAUTH_INTROSPECTION:', OAUTH_INTROSPECTION.trim());
console.log('OAUTH_USERINFO:', OAUTH_USERINFO.trim());

export const SECRETS_VO = process.env['USER_CREDENTIALS_SECRETS_VO'] ?? '';
export const SECRETS_API = process.env['USER_CREDENTIALS_SECRETS_API'] ?? '';
export const SECRETS_PATH =
  process.env['USER_CREDENTIALS_SECRETS_PATH'] ?? '/services/mlflow/credentials';
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

export const mlflowExperimentPermissionGet = async (username: string, experimentId: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/experiments/permissions/get?${new URLSearchParams({
      username: username,
      experiment_id: experimentId,
    })}`,
    {
      headers: {
        Authorization: localApiAuthorization,
      },
    },
  );

export const mlflowExperimentPermissionCreate = async (
  username: string,
  experimentId: string,
  permission: Permission,
) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/experiments/permissions/create`, {
    method: 'POST',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      experiment_id: experimentId,
      username,
      permission,
    }),
  });

export const mlflowExperimentPermissionUpdate = async (
  username: string,
  experimentId: string,
  permission: Permission,
) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/experiments/permissions/update`, {
    method: 'PATCH',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      experiment_id: experimentId,
      username,
      permission,
    }),
  });

export const mlflowExperimentGet = async (experimentId: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/experiments/get?${new URLSearchParams({
      experiment_id: experimentId,
    })}`,
    {
      headers: {
        Authorization: localApiAuthorization,
      },
    },
  );

export const mlflowModelPermissionGet = async (username: string, modelName: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/registered-models/permissions/get?${new URLSearchParams({
      username: username,
      name: modelName,
    })}`,
    {
      headers: {
        Authorization: localApiAuthorization,
      },
    },
  );

export const mlflowModelPermissionCreate = async (
  username: string,
  modelName: string,
  permission: Permission,
) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/registered-models/permissions/create`, {
    method: 'POST',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: modelName,
      username,
      permission,
    }),
  });

export const mlflowModelPermissionUpdate = async (
  username: string,
  modelName: string,
  permission: Permission,
) =>
  fetch(`${HOSTNAME}/api/2.0/mlflow/registered-models/permissions/update`, {
    method: 'PATCH',
    headers: {
      Authorization: localApiAuthorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: modelName,
      username,
      permission,
    }),
  });

export const mlflowModelGet = async (experimentId: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/registered-models/get?${new URLSearchParams({
      name: experimentId,
    })}`,
    {
      headers: {
        Authorization: localApiAuthorization,
        'Content-Type': 'application/json',
      },
    },
  );

export const updateSecret = async (userAuth: string, username: string, password: string) =>
  fetch(
    `${SECRETS_API}/secrets?${new URLSearchParams({
      vo: SECRETS_VO,
      secret_path: SECRETS_PATH,
    }).toString()}`,
    {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        Authorization: userAuth,
        'Content-Type': 'application/json',
      },
    },
  );

export const deleteSecret = async (userAuth: string) =>
  fetch(
    `${SECRETS_API}/secrets?${new URLSearchParams({
      vo: SECRETS_VO,
      secret_path: SECRETS_PATH,
    }).toString()}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: userAuth,
        'Content-Type': 'application/json',
      },
    },
  );
