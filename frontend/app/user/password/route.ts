import { introspect, mlflowUserUpdatePassword, UserinfoResponse } from '@/lib/serverApi';

export const PATCH = async (request: Request) => {
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

  const mlflowCreateR = await mlflowUserUpdatePassword(userInfo.email, body.password);
  if (!mlflowCreateR.ok) {
    return new Response('Internal Server Error', { status: 500 });
  }
  const mlflowCreate = await mlflowCreateR.json();

  return Response.json({
    user: mlflowCreate,
  });
};
