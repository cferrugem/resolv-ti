function StatusBadge({ status }) {
  const statusStyles = {
    open: {
<<<<<<< HEAD
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
=======
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
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
      icon: '✓'
    }
  };

  const style = statusStyles[status] || statusStyles.open;
<<<<<<< HEAD
  
  const statusText = status === 'open' ? 'Aberto' : 
                     status === 'in progress' ? 'Em Andamento' : 
                     status === 'closed' ? 'Fechado' : 
                     status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors ${style.bg} ${style.text} ${style.border}`}>
      <span className="mr-1.5">{style.icon}</span>
      {statusText}
=======

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      <span className="mr-1">{style.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
    </span>
  );
}

export default StatusBadge;