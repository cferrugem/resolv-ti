import { motion } from 'framer-motion';

function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-600 to-primary-800 mb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-primary-100">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PageHeader;