import { useState, useMemo } from 'react';
import TicketItem from '../components/TicketItem';
import PageContainer from '../components/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTickets, useCategories, useStaff } from '../hooks/useTickets';
import { useDebounce } from '../hooks/useDebounce';

function TicketList() {
  const { data: tickets = [], isLoading } = useTickets();
  const { data: categories = [] } = useCategories();
  const { data: staff = [] } = useStaff();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Debounce search input — useMemo only re-runs 300ms after typing stops,
  // preventing expensive re-filtering on every individual keystroke.
  const debouncedSearch = useDebounce(search, 300);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(s) || t.user?.email?.toLowerCase().includes(s));
    }
    
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === 'priority') {
      const p = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => p[a.priority] - p[b.priority]);
    }
    return result;
  }, [tickets, statusFilter, priorityFilter, debouncedSearch, sortBy]);

  if (isLoading) {
    return (
      <PageContainer title="Gerenciar Chamados" subtitle="Sincronizando fila de atendimento...">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Gerenciar Chamados" 
      subtitle={`${filteredTickets.length} chamados encontrados na fila atual.`}
    >
      <Card variant="glass" className="mb-8 !p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pesquisa Inteligente</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título, e-mail ou descrição..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              />
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold cursor-pointer appearance-none">
              <option value="all">Todos os Status</option>
              <option value="open">Abertos</option>
              <option value="in progress">Em Atendimento</option>
              <option value="closed">Concluídos</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prioridade</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold cursor-pointer appearance-none">
              <option value="all">Todas</option>
              <option value="high">Alta Urgência</option>
              <option value="medium">Média</option>
              <option value="low">Normal</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ordenação</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold cursor-pointer appearance-none">
                <option value="newest">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
                <option value="priority">Prioridade</option>
              </select>
            </div>
            <button 
              onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); }}
              className="p-2.5 mt-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 transition-colors"
              title="Limpar Filtros"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(t => (
            <TicketItem key={t.id} ticket={t} isStaff={true} staff={staff} categories={categories} />
          ))
        ) : (
          <Card variant="glass" className="text-center py-20 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Nenhum resultado</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Não encontramos chamados com os filtros aplicados.</p>
            <Button variant="secondary" className="mt-8" onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); }}>Resetar Busca</Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

export default TicketList;