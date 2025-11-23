import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'aktiv':
        return {
          className: 'bg-success/10 text-success border-success/20',
          text: 'Aktiv'
        };
      case 'pausiert':
        return {
          className: 'bg-muted text-muted-foreground border-border',
          text: 'Pausiert'
        };
      case 'gestoppt':
        return {
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          text: 'Gestoppt'
        };
      default:
        return {
          className: 'bg-muted text-muted-foreground border-border',
          text: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status?.toLowerCase() === 'aktiv' ? 'bg-success' :
        status?.toLowerCase() === 'gestoppt'? 'bg-destructive' : 'bg-muted-foreground'
      }`} />
      {config?.text}
    </span>
  );
};

export default StatusBadge;