function PageContainer({ children, title }) {
  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card p-6 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8">{title}</h1>
=======
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
        {children}
      </div>
    </div>
  );
}

export default PageContainer;