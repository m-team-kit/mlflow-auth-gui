import { ComponentProps, FC } from 'react';
import clsx from 'clsx';

const Button: FC<ComponentProps<'button'>> = ({ className, type = 'button', ...props }) => (
  <button
    className={clsx(
      'rounded border bg-white p-2 text-black transition-colors hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black',
      className,
    )}
    type={type}
    {...props}
  />
);

export default Button;
