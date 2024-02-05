import { FC, useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import styles from './Modal.module.scss';
import clsx from 'clsx';
import useSWR from 'swr';
import { ifOk, jsonIfOk, NetworkError } from '@/lib/helpers';
import {
  checkUserExperimentPermissions,
  getExperiment,
  getUser,
  updateUserExperimentPermissions,
} from '@/lib/clientApi';
import { useAuth } from 'react-oidc-context';
import { GetUserExperimentPermissionResponse } from '@/app/user/permission/experiment/route';
import useTimedState from '@/lib/useTimedState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Experiment, Permission, Permissions } from '@/lib/mlflowTypes';

const DEFAULT_CHECK = 'Check';
const DEFAULT_UPDATE = 'Update';

type ManageExperimentProps = {
  experimentId: string;
  onHide: () => void;
};
const ManageExperiment: FC<ManageExperimentProps> = ({ experimentId, onHide }) => {
  const auth = useAuth();

  const dialog = useRef<HTMLDialogElement>(null);

  const [checkError, setCheckError] = useState<Error | null>(null);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  const [foundPermission, setFoundPermission] = useState<GetUserExperimentPermissionResponse>();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const experiment = useSWR<Experiment>(
    ['experiment', experimentId],
    async () => jsonIfOk(await getExperiment(auth.user!.access_token, experimentId)),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const [checkLabel, setCheckLabel, resetCheckLabel] = useTimedState(DEFAULT_CHECK);
  const [updateLabel, setUpdateLabel, resetUpdateLabel] = useTimedState(DEFAULT_UPDATE);

  return (
    <dialog
      className={clsx(
        'prose rounded border-2 bg-white p-2 dark:prose-invert dark:bg-black',
        styles['modal'],
      )}
      ref={dialog}
      onCancel={() => onHide()}
    >
      <h1>Manage Experiment {experimentId}</h1>

      {experiment.data != null && (
        <>
          <p>Experiment name: {experiment.data.name}</p>
        </>
      )}
      {experiment.error && <span className="text-red-500">Failed to get experiment info</span>}

      <form
        className="mb-2 flex items-center"
        onSubmit={(f) => {
          f.preventDefault();
          setCheckLabel('...');
          const username = f.currentTarget.username.value;

          checkUserExperimentPermissions(auth.user!.access_token, username, experimentId)
            .then(jsonIfOk)
            .then((r: GetUserExperimentPermissionResponse) => setFoundPermission(r))
            .catch((e) => {
              if (e instanceof NetworkError && e.response.status === 404) {
                setFoundPermission({
                  username,
                  experiment_id: experimentId,
                  permission: Permissions.None,
                });
              } else {
                setCheckError(e);
              }
            })
            .finally(() => resetCheckLabel());
        }}
      >
        <label htmlFor="username" className="me-1">
          Email
        </label>
        <input
          type="text"
          name="username"
          placeholder="user@example.com"
          className="me-1 grow rounded"
          onChange={() => setFoundPermission(undefined)}
        />
        <Button disabled={checkLabel !== DEFAULT_CHECK} type="submit">
          {checkLabel}
        </Button>
      </form>
      {checkError && <ErrorDisplay error={checkError} />}

      {foundPermission != null && (
        <>
          <form
            className="mb-2 flex items-center"
            onSubmit={(f) => {
              f.preventDefault();
              setUpdateLabel('...');
              setUpdateError(null);

              updateUserExperimentPermissions(
                auth.user!.access_token,
                foundPermission?.username,
                experimentId,
                f.currentTarget.permission.value,
              )
                .then(ifOk)
                .catch(setUpdateError)
                .then(() => setUpdateLabel('✓'))
                .catch((e) => {
                  setUpdateError(e);
                  setUpdateLabel('✗');
                });
            }}
          >
            <label htmlFor="permission" className="me-1">
              Permission
            </label>
            <select
              className="me-1 grow rounded"
              name="permission"
              defaultValue={foundPermission.permission}
            >
              {Object.entries(Permissions).map(([key, value]) => (
                <option
                  key={key}
                  value={value}
                  //disabled={value === Permissions.None}
                >
                  {key}
                </option>
              ))}
            </select>
            <Button disabled={updateLabel !== DEFAULT_UPDATE} type="submit">
              {updateLabel}
            </Button>
          </form>
          {updateError && <ErrorDisplay error={updateError} />}
        </>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            onHide();
            dialog.current?.close();
          }}
        >
          Close
        </Button>
      </div>
    </dialog>
  );
};

export default ManageExperiment;
