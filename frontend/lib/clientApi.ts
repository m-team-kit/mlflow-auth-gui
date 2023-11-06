export const register = async (token: string, password: string) =>
  fetch('/user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const updatePassword = async (token: string, password: string) =>
  fetch('/user/password', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const deleteUser = async (token: string) =>
  fetch('/user', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
