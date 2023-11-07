import {
  ComponentPropsWithoutRef,
  ElementType,
} from 'react';
import clsx from 'clsx';

type ButtonProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  as?: T;
};
const Button = <T extends ElementType = 'button'>({
  className,
  type = 'button',
  as,
  ...props
}: ButtonProps<T>) => {
  const Component: ElementType = as ?? 'button';
  return (
    <Component
      className={clsx(
        'rounded border bg-white p-2 text-black no-underline transition-colors hover:cursor-pointer hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:cursor-not-allowed dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black',
        className,
      )}
      type={Component === 'button' ? type : undefined}
      {...props}
    />
  );
};

export default Button;
