import config from '../next.config';
import {
  GetExperimentPermissionRequest,
  GetModelPermissionRequest,
  UpdateExperimentPermissionRequest,
  UpdateModelPermissionRequest,
} from '@/lib/apiTypes';
import { Permission } from '@/lib/mlflowTypes';
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
export const getExperiment = async (token: string, experimentId: string) =>
  fetch(
    //`${HOSTNAME}/api/2.0/mlflow/experiments/get?${new URLSearchParams({
    `${prefix}/experiment?${new URLSearchParams({
      experiment_id: experimentId,
    })}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const checkUserModelPermissions = async (
  token: string,
  username: string,
  modelName: string,
) =>
  fetch(
    `${prefix}/user/permission/model?${new URLSearchParams({
      username,
      model_name: modelName,
    } satisfies GetModelPermissionRequest)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const updateUserModelPermissions = async (
  token: string,
  username: string,
  modelName: string,
  permission: Permission,
) =>
  fetch(`${prefix}/user/permission/model`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username,
      model_name: modelName,
      permission,
    } satisfies UpdateModelPermissionRequest),
  });

export const getModel = async (token: string, modelName: string) =>
  fetch(
    `${prefix}/registeredModel?${new URLSearchParams({
      model_name: modelName,
    })}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
