import { motion } from 'framer-motion';

function PageContainer({ children, title, subtitle, actions }) {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 ml-1">
          <div>
            {title && (
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </motion.main>
  );
}

export default PageContainer;