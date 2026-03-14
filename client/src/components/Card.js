import { motion } from 'framer-motion';

function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
<<<<<<< HEAD
        glass-card
        ${hover ? 'hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-none dark:hover:ring-2 dark:hover:ring-slate-600/50 hover:-translate-y-1 transition-all duration-300' : ''}
=======
        bg-white rounded-lg shadow-sm border border-gray-200
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export default Card;