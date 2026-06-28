import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  variant = 'glass', 
  className = '', 
  footer,
  borderLeft = '',
  ...props 
}) => {
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300 flex flex-col';
  
  const variants = {
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-lg hover:shadow-primary-500/5',
    solid: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
    flat: 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700',
  };

  const borderClasses = borderLeft ? `border-l-4 ${borderLeft}` : '';

  return (
    <div className={`${baseClasses} ${variants[variant]} ${borderClasses} ${className}`} {...props}>
      {(title || Icon) && (
        <div className="flex items-center justify-between p-6 pb-0 mb-4">
          <div className="flex items-center">
            {Icon && (
              <div className="flex-shrink-0 bg-primary-500/10 dark:bg-primary-500/20 p-2 rounded-xl mr-4 text-primary-600 dark:text-primary-400">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className={`flex-1 ${variant !== 'none' ? 'p-6 pt-2' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="mt-auto p-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;