import { motion } from 'framer-motion';

function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        glass-card
        ${hover ? 'hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-none dark:hover:ring-2 dark:hover:ring-slate-600/50 hover:-translate-y-1 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export default Card;