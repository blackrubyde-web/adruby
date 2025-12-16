import React from 'react';
import { cn } from '../../utils/cn';

export const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={cn('text-xs font-medium text-muted-foreground', className)}>
    {children}
  </label>
);

export const FieldError = ({ children, className = '' }) => {
  if (!children) return null;
  return <p className={cn('text-xs text-muted-foreground mt-1', className)}>{children}</p>;
};

export const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    {...props}
    className={cn(
      'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-primary/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-muted-foreground',
      className
    )}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className = '', rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    {...props}
    className={cn(
      'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-primary/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-muted-foreground',
      className
    )}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    {...props}
    className={cn(
      'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-primary/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'text-foreground',
      className
    )}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

const DefaultInput = Input;

export default DefaultInput;
