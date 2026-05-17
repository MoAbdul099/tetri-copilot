import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tetri-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-tetri-blue text-white hover:bg-tetri-blue-hover',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-tetri-border bg-transparent text-tetri-text hover:bg-tetri-bg hover:text-tetri-text',
        secondary: 'bg-tetri-bg text-tetri-text hover:bg-tetri-border',
        ghost: 'hover:bg-tetri-bg hover:text-tetri-text text-tetri-muted',
        link: 'text-tetri-blue underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2.5 rounded-btn',
        sm: 'h-8 px-3.5 py-2 rounded-btn text-xs',
        lg: 'h-12 px-6 py-3 rounded-btn text-base',
        icon: 'h-9 w-9 rounded-btn',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
