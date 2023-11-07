import { FC } from 'react';
import { NetworkError } from '@/lib/helpers';

type ErrorDisplayErrorProps = {
  error: Error;
};
const ErrorDisplayError: FC<ErrorDisplayErrorProps> = ({ error }) => {
  if (error instanceof NetworkError) {
    return (
      <div>
        <div>
          <span>{error.response.status}</span> <small>{error.response.statusText}</small>
        </div>
        <div>Cause: {error.response.url}</div>
        <div>Message: {error.json.message}</div>
      </div>
    );
  }

  return <span>{error.message}</span>;
};

type ErrorDisplayProps = {
  error: Error;
  message?: string;
};
const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, message = 'An error occurred' }) => {
  return (
    <div>
      <div className="text-red-500">{message}</div>
      <ErrorDisplayError error={error} />
    </div>
  );
};

export default ErrorDisplay;
