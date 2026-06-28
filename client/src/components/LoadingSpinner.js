import React from 'react';

function LoadingSpinner({ label = "Carregando..." }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] p-8" role="status" aria-live="polite">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      {label && <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
