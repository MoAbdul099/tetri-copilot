import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl border px-4 py-3 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        default: 'bg-tetri-bg border-tetri-border text-tetri-text',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        destructive: 'bg-red-50 border-red-200 text-tetri-error',
        info: 'bg-[#eff4ff] border-tetri-blue/20 text-tetri-blue',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('font-semibold leading-none tracking-tight mb-1', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
