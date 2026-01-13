import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
  iconClassName?: string;
};

export function SelectField({
  className,
  wrapperClassName,
  iconClassName,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select
        {...props}
        className={cn(
          'w-full appearance-none rounded-xl border border-border/60 bg-card/70 px-4 py-3 pr-10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus:outline-none focus:ring-2 focus:ring-primary/40 hover:border-border cursor-pointer disabled:opacity-60',
          className
        )}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
          iconClassName
        )}
      />
    </div>
  );
}
