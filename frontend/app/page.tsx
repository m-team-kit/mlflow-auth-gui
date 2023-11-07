'use client';

import { type FC, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import AuthContext from '@/components/AuthContext';
import useSWR from 'swr';
import Button from '@/components/Button';
import { GetUserResponse } from '@/app/user/route';
import { deleteUser, getUser, register, updatePassword } from '@/lib/clientApi';
import { ifOk, jsonIfOk } from '@/lib/helpers';
import ErrorDisplay from '@/components/ErrorDisplay';

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

  const swr = useSWR<GetUserResponse>('/user', async () =>
    jsonIfOk(await getUser(auth.user?.access_token!)),
  );

  const [error, setError] = useState<Error | null>(null);
  const [password, setPassword] = useState<string>('');
  const [updatedPassword, setUpdatePassword] = useState(false);

  const { data } = swr;

  if (error != null) {
    return <ErrorDisplay message="An error occurred" error={error} />;
  }

  if (auth.error) {
    return <ErrorDisplay message="An error occurred during authentication" error={auth.error} />;
  }

  if (auth.isLoading || auth.user == null) {
    return 'Loading OIDC...';
  }

  if (swr.error) {
    return <ErrorDisplay message="An error occurred while fetching user data" error={swr.error} />;
  }

  if (!data) {
    return 'Fetching user...';
  }

  return (
    <>
      <h1>MLFlow {data.mlflow ? 'User Settings' : 'Registration'}</h1>
      <div>Email: {data.oidc.email}</div>
      <div>Registered: {data.mlflow != null ? 'Yes' : 'No'}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (data.mlflow) {
            updatePassword(auth.user!.access_token, e.currentTarget.password.value)
              .then(ifOk)
              .then(() => {
                setUpdatePassword(true);
                setTimeout(() => setUpdatePassword(false), 1500);
                setPassword('');
              })
              .then(() => swr.mutate())
              .catch(setError);
          } else {
            register(auth.user!.access_token, e.currentTarget.password.value)
              .then(ifOk)
              .then(() => setPassword(''))
              .then(() => swr.mutate())
              .catch(setError);
          }
        }}
        className="mb-4"
      >
        {data.mlflow == null && <h2>Create account</h2>}
        <div className="flex items-center justify-between">
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            className="rounded text-black"
            value={password}
            minLength={1}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <small>Please choose a secure password</small>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className={'mt-2'} disabled={password.length == 0}>
            {updatedPassword ? 'Updated ✓' : data.mlflow ? 'Update' : 'Create'}
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
              deleteUser(auth.user!.access_token)
                .then(ifOk)
                .then(() => swr.mutate())
                .catch(setError);
            }}
          >
            Delete my account
          </Button>
        )}
        <Button onClick={() => auth.signoutRedirect()}>Logout</Button>
        {data.mlflow != null && (
          <Button as="a" href="/">
            Go to mlflow →
          </Button>
        )}
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
