import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import TicketItem from '../components/TicketItem';
import PageContainer from '../components/PageContainer';
import { Link } from 'react-router-dom';

function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            assigned_to_user:assigned_to (
              id
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setTickets(data || []);
        setFilteredTickets(data || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTickets();
  }, [user]);
  
  // Apply filters and sorting when criteria change
  useEffect(() => {
    let result = [...tickets];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(ticket => ticket.status === filter);
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(ticket => 
        ticket.title?.toLowerCase().includes(searchLower) || 
        ticket.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    
    setFilteredTickets(result);
  }, [tickets, filter, sortBy, search]);

  return (
    <PageContainer title="Meus Chamados">
      {error ? (
        <div className="bg-red-50/80 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl backdrop-blur-sm">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label htmlFor="filter" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full py-2.5 px-3 text-sm form-select-dark"
                >
                  <option value="all">Todos os Status</option>
                  <option value="open">Aberto</option>
                  <option value="in progress">Em Andamento</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Ordenar por</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full py-2.5 px-3 text-sm form-select-dark"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                  <option value="priority">Prioridade</option>
                </select>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Pesquisar</label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar chamados..."
                className="block w-full py-2.5 px-3 text-sm form-input-dark"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <TicketItem 
                  key={ticket.id} 
                  ticket={ticket} 
                  isStaff={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/40 dark:border-slate-700/30">
              <svg className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-xl font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Nenhum chamado encontrado</h3>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {tickets.length === 0 ? 'Você ainda não criou nenhum chamado. Crie seu primeiro chamado para que possamos ajudá-lo.' : 'Nenhum chamado corresponde aos filtros aplicados.'}
              </p>
              <div className="mt-8">
                <Link
                  to="/create-ticket"
                  className="btn-primary shadow-primary-500/30"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Novo Chamado
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

export default MyTickets;