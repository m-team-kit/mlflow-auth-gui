'use client';

import { type FC, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import AuthContext from '@/components/AuthContext';
import useSWR from 'swr';
import Button from '@/components/Button';
import { GetMeResponse } from '@/app/user/me/route';
import { deleteUser, getUser, register, updatePassword } from '@/lib/clientApi';
import { ifOk, jsonIfOk } from '@/lib/helpers';
import ErrorDisplay from '@/components/ErrorDisplay';
import { privacyPolicyUrl, termsOfUseUrl } from '@/app/links';
import ManageModel from '@/components/ManageModel';
import ManageExperiment from '@/components/ManageExperiment';

import { Permissions } from '@/lib/mlflowTypes';

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

  const swr = useSWR<GetMeResponse>('/user', async () =>
    jsonIfOk(await getUser(auth.user?.access_token!)),
  );

  const [error, setError] = useState<Error | null>(null);
  const [password, setPassword] = useState<string>('');
  const [updatedPassword, setUpdatePassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(
    termsOfUseUrl == null && privacyPolicyUrl == null,
  );

  const { data } = swr;

  const [manageModel, setManageModel] = useState<string | null>(null);
  const [manageExperiment, setManageExperiment] = useState<string | null>(null);

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
      {data.mlflow && <div>UserID: {data.mlflow.user.id}</div>}
      <div>Email: {data.oidc.email}</div>
      {data.mlflow && data.mlflow.user.username !== data.oidc.email && (
        <div>MLFlow username: {data.mlflow.user.username}</div>
      )}
      <div>Registered: {data.mlflow != null ? 'Yes' : 'No'}</div>
      {data.mlflow && <div>Admin: {data.mlflow.user.is_admin ? 'Yes' : 'No'}</div>}

      {manageModel && <ManageModel modelName={manageModel} onHide={() => setManageModel(null)} />}
      {manageExperiment && (
        <ManageExperiment
          experimentId={manageExperiment}
          onHide={() => setManageExperiment(null)}
        />
      )}

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
        {data.mlflow == null && termsOfUseUrl && (
          <div className="flex items-center justify-between">
            <label htmlFor="acceptedTOS">
              I accept the {termsOfUseUrl && <a href={termsOfUseUrl}>Terms of Use</a>}
              {termsOfUseUrl && privacyPolicyUrl && ' and '}
              {privacyPolicyUrl && <a href={privacyPolicyUrl}>Privacy Policy</a>}
            </label>
            <input
              type="checkbox"
              name="acceptedTOS"
              id="acceptedTOS"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
          </div>
        )}
        <div className="flex justify-end">
          <small>Please choose a secure password</small>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="mt-2"
            disabled={
              password.length == 0 ||
              (data.mlflow == null && (termsOfUseUrl || privacyPolicyUrl ? !acceptedTerms : false))
            }
          >
            {updatedPassword ? 'Updated ✓' : data.mlflow ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
      {data.mlflow && (
        <>
          <h3>Experiment permissions</h3>
          {data.mlflow.user.experiment_permissions.length == 0 ? (
            <div className="text-center">No experiment permissions</div>
          ) : (
            <table className="mb-0">
              <thead>
                <tr>
                  <th>Experiment ID</th>
                  <th>User ID</th>
                  <th>Permission</th>
                </tr>
              </thead>
              <tbody>
                {data.mlflow.user.experiment_permissions.map((permission) => (
                  <tr key={permission.experiment_id}>
                    <td>{permission.experiment_id}</td>
                    <td>
                      {permission.user_id}
                      {permission.user_id === data.mlflow?.user.id && (
                        <span className="text-orange-700 dark:text-orange-300"> (You)</span>
                      )}
                    </td>
                    <td>
                      {permission.permission === Permissions.Manage ? (
                        <Button onClick={() => setManageExperiment(permission.experiment_id)}>
                          Manage
                        </Button>
                      ) : (
                        permission.permission
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {data.mlflow && (
        <>
          <h3>Registered model permissions</h3>
          {data.mlflow.user.registered_model_permissions.length == 0 ? (
            <div className="text-center">No registered model permissions</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Model name</th>
                  <th>User ID</th>
                  <th>Permission</th>
                </tr>
              </thead>
              <tbody>
                {data.mlflow.user.registered_model_permissions.map((permission) => (
                  <tr key={permission.name}>
                    <td>{permission.name}</td>
                    <td>
                      {permission.user_id}
                      {permission.user_id === data.mlflow?.user.id && (
                        <span className="text-orange-700 dark:text-orange-300"> (You)</span>
                      )}
                    </td>
                    <td>
                      {permission.permission === Permissions.Manage ? (
                        <Button onClick={() => setManageModel(permission.name)}>Manage</Button>
                      ) : (
                        permission.permission
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {data.mlflow && <div className="mb-8" />}
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
