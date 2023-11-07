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
