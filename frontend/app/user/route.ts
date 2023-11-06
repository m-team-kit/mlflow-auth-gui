import {
  introspect,
  mlflowUserCreate,
  mlflowUserDelete,
  mlflowUserGet,
  MLFlowUserResponse,
  UserinfoResponse,
} from '@/lib/serverApi';

export type UserResponse = {
  oidc: UserinfoResponse;
  mlflow: MLFlowUserResponse | null;
};
export const GET = async (request: Request) => {
  const token = request.headers.get('Authorization');
  if (token == null || !token.startsWith('Bearer')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfoR = await introspect(token);
  if (!userInfoR.ok) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfo: UserinfoResponse = await userInfoR.json();

  const mlflowUserR = await mlflowUserGet(userInfo.email);

  if (mlflowUserR.status === 404) {
    return Response.json({
      oidc: userInfo,
      mlflow: null,
    });
  }

  if (mlflowUserR.status !== 200) {
    return new Response('Internal Server Error', { status: 500 });
  }

  const mlflowUser: MLFlowUserResponse = await mlflowUserR.json();

  return Response.json({
    oidc: userInfo,
    mlflow: mlflowUser,
  });
};

export const POST = async (request: Request) => {
  const token = request.headers.get('Authorization');
  if (token == null || !token.startsWith('Bearer')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfoR = await introspect(token);
  if (!userInfoR.ok) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfo: UserinfoResponse = await userInfoR.json();

  const body = await request.json();

  const mlflowCreateR = await mlflowUserCreate(userInfo.email, body.password);
  if (!mlflowCreateR.ok) {
    return new Response('Internal Server Error', { status: 500 });
  }
  const mlflowCreate = await mlflowCreateR.json();

  return Response.json({
    user: mlflowCreate,
  });
};

export const DELETE = async (request: Request) => {
  const token = request.headers.get('Authorization');
  if (token == null || !token.startsWith('Bearer')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfoR = await introspect(token);
  if (!userInfoR.ok) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userInfo: UserinfoResponse = await userInfoR.json();

  const mlflowDeleteR = await mlflowUserDelete(userInfo.email);
  if (!mlflowDeleteR.ok) {
    return new Response('Internal Server Error', { status: 500 });
  }

  //return new Response('No Content', { status: 204 });
  // TODO: use 204 once next fixes their shit
  return new Response('OK', { status: 200 });
};
