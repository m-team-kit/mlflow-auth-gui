import config from '../next.config';
const prefix = config.basePath ?? '';

console.log(prefix);

export const getUser = async (token: string) =>
  fetch(`${prefix}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const register = async (token: string, password: string) =>
  fetch(`${prefix}/user`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const updatePassword = async (token: string, password: string) =>
  fetch(`${prefix}/user/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const deleteUser = async (token: string) =>
  fetch(`${prefix}/user`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
