import { useCallback, useRef, useState } from 'react';

const useTimedState = <T>(value: T, timeout: number = 1500) => {
  const [state, setState] = useState<T>(value);

  const timer = useRef<ReturnType<typeof setTimeout>>();
  const queueReset = useCallback(
    (newValue: T) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setState(newValue), timeout);
    },
    [timeout],
  );

  const set = useCallback(
    (tempValue: T) => {
      setState(tempValue);
      queueReset(value);
    },
    [queueReset, value],
  );

  const reset = useCallback(() => {
    timer.current && clearTimeout(timer.current);
    setState(value);
  }, [value]);

  return [state, set, reset] as const;
};

export default useTimedState;
