function PageContainer({ children, title }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card p-6 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default PageContainer;