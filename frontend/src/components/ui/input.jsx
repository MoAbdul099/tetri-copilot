import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-xl border border-tetri-border bg-white px-3 py-2.5 text-sm text-tetri-text',
        'placeholder:text-tetri-neutral',
        'focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent',
        'disabled:cursor-not-allowed disabled:bg-tetri-bg disabled:opacity-60',
        'read-only:cursor-default read-only:bg-tetri-bg',
        'transition-shadow',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
