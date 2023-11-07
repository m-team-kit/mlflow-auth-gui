'use client';

import { type FC } from 'react';
import { useAuth } from 'react-oidc-context';
import AuthContext from '@/components/AuthContext';
import useSWR from 'swr';
import Button from '@/components/Button';
import { UserResponse } from '@/app/user/route';
import { deleteUser, getUser, register, updatePassword } from '@/lib/clientApi';

const NotSignedIn: FC = () => {
  const auth = useAuth();

  return (
    <>
      <h1>Please sign in</h1>
      <div className="flex justify-center">
        <Button onClick={() => auth.signinRedirect()}>Login</Button>
      </div>
    </>
  );
};

const LoggedIn: FC = () => {
  const auth = useAuth();

  const swr = useSWR<UserResponse>('/user', async () =>
    (await getUser(auth.user?.access_token!)).json(),
  );

  const { data } = swr;

  if (auth.isLoading || auth.user == null) {
    return 'Loading OIDC...';
  }

  if (!data) {
    return 'Fetching user...';
  }

  return (
    <>
      <h1>MLFlow User Settings</h1>
      <div>Email: {data.oidc.email}</div>
      <div>Registered: {data.mlflow != null ? 'Yes' : 'No'}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (data.mlflow) {
            updatePassword(auth.user!.access_token, e.currentTarget.password.value).then(() =>
              swr.mutate(),
            );
          } else {
            register(auth.user!.access_token, e.currentTarget.password.value).then(() =>
              swr.mutate(),
            );
          }
        }}
        className="mb-4"
      >
        {data.mlflow == null && <h2>Create account</h2>}
        <div className="flex items-center justify-between">
          <label htmlFor="password">Password: </label>
          <input type="password" name="password" id="password" className="rounded text-black" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="mt-2">
            {data.mlflow ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
      {data.mlflow && (
        <div className="my-2 block border">
          <pre>{JSON.stringify(data.mlflow, null, 2)}</pre>
        </div>
      )}
      <div className="flex justify-center gap-2">
        {data.mlflow != null && (
          <Button
            onClick={() => {
              deleteUser(auth.user!.access_token).then(() => swr.mutate());
            }}
          >
            Delete User
          </Button>
        )}
        <Button onClick={() => auth.signoutRedirect()}>Logout</Button>
      </div>
    </>
  );
};

const Home: FC = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <>Loading...</>;
  }

  if (!auth.isAuthenticated) {
    return <NotSignedIn />;
  }

  return <LoggedIn />;
};

const Page: FC = () => {
  return (
    <AuthContext>
      <Home />
    </AuthContext>
  );
};

export default Page;
