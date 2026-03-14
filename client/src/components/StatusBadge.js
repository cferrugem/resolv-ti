function StatusBadge({ status }) {
  const statusStyles = {
    open: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-700/50',
      icon: '🔔'
    },
    'in progress': {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700/50',
      icon: '⚡'
    },
    closed: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-700/50',
      icon: '✓'
    }
  };

  const style = statusStyles[status] || statusStyles.open;
  
  const statusText = status === 'open' ? 'Aberto' : 
                     status === 'in progress' ? 'Em Andamento' : 
                     status === 'closed' ? 'Fechado' : 
                     status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors ${style.bg} ${style.text} ${style.border}`}>
      <span className="mr-1.5">{style.icon}</span>
      {statusText}
    </span>
  );
}

export default StatusBadge;