import config from '../next.config';
import {
  GetExperimentPermissionRequest,
  UpdateExperimentPermissionRequest,
  Permission,
} from '@/lib/types';
const prefix = config.basePath ?? '';

export const getUser = async (token: string) =>
  fetch(`${prefix}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const register = async (token: string, password: string) =>
  fetch(`${prefix}/user/me`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const updatePassword = async (token: string, password: string) =>
  fetch(`${prefix}/user/me/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password: password,
    }),
  });

export const deleteUser = async (token: string) =>
  fetch(`${prefix}/user/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const checkUserExperimentPermissions = async (
  token: string,
  username: string,
  experimentId: string,
) =>
  fetch(
    `${prefix}/user/permission/experiment?${new URLSearchParams({
      username,
      experiment_id: experimentId,
    } satisfies GetExperimentPermissionRequest)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const updateUserExperimentPermissions = async (
  token: string,
  username: string,
  experimentId: string,
  permission: Permission,
) =>
  fetch(`${prefix}/user/permission/experiment`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username,
      experiment_id: experimentId,
      permission,
    } satisfies UpdateExperimentPermissionRequest),
  });

const HOSTNAME = process.env['MLFLOW_HOSTNAME'] ?? 'http://localhost';
export const getExperiment = async (experimentId: string) =>
  fetch(
    `${HOSTNAME}/api/2.0/mlflow/experiments/get?${new URLSearchParams({
      experiment_id: experimentId,
    })}`,
    {
      method: 'GET',
    },
  );
