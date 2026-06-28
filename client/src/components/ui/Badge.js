import React from 'react';

const variants = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  neutral: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
};

const Badge = ({ 
  children, 
  variant = 'neutral', 
  className = '', 
  dot = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all duration-200';
  const variantClasses = variants[variant] || variants.neutral;

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;