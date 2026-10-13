import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '../../lib/utils';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0',
  {
    variants: {
      state: {
        off: 'border-border bg-card text-foreground hover:bg-accent',
        selected: 'border-primary bg-primary/10 text-primary',
        included: 'border-primary bg-primary text-primary-foreground',
        excluded: 'border-destructive bg-destructive/10 text-destructive line-through',
        success: 'border-success bg-success/10 text-success',
      },
      size: {
        default: 'px-3 py-1 text-sm',
        sm: 'px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5',
      },
    },
    defaultVariants: { state: 'off', size: 'default' },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

/**
 * A rounded, toggleable pill button. Callers set `aria-pressed` to match the state.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, state, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(chipVariants({ state, size }), className)} {...props} />
  )
);
Chip.displayName = 'Chip';
