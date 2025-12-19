interface StatusBadgeProps {
  status: 'active' | 'paused' | 'draft' | 'completed';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  const dots = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    draft: 'bg-gray-500',
    completed: 'bg-blue-500',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${styles[status]}`}>
      <div className={`w-2 h-2 rounded-full ${dots[status]} animate-pulse`}></div>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}
