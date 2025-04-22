function StatusBadge({ status }) {
  const statusStyles = {
    open: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-100',
      icon: '🔔'
    },
    'in progress': {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-100',
      icon: '⚡'
    },
    closed: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-100',
      icon: '✓'
    }
  };

  const style = statusStyles[status] || statusStyles.open;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      <span className="mr-1">{style.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default StatusBadge;