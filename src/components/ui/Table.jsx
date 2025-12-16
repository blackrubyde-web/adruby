import React from 'react';
import EmptyState from './EmptyState';

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-card/50 ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-card/60 border-b border-border ${className}`}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableRow({ children, className = '', as: Component = 'tr', ...rest }) {
  return (
    <Component
      className={`border-b border-border last:border-0 hover:bg-accent/40 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function TableCell({ children, align = 'left', className = '', colSpan, ...rest }) {
  return (
    <td className={`px-4 py-3 ${alignClass[align] || alignClass.left} ${className}`} colSpan={colSpan} {...rest}>
      {children}
    </td>
  );
}

export function TableEmpty({ title = 'Keine Einträge', description, actionLabel, onAction }) {
  return (
    <tr>
      <td colSpan={99} className="p-6">
        <EmptyState title={title} description={description} actionLabel={actionLabel} onAction={onAction} />
      </td>
    </tr>
  );
}
