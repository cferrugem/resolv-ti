import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TicketItem from '../components/TicketItem';
import PageContainer from '../components/PageContainer';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros e ordenação
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch tickets with user information
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            *,
            user:user_id (
              id,
              email
            ),
            assigned_staff:assigned_to (
              id,
              role,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;
        if (isMounted) setTickets(tickets || []);

        // Buscar dados da equipe de suporte
        const { data: staffData, error: staffError } = await supabase
          .from('users')
          .select(`
            id,
            role,
            email
          `)
          .eq('role', 'staff');

        if (staffError) throw staffError;
        if (isMounted) {
          setStaff(staffData || []);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/tickets/categories');
        if (!response.ok) throw new Error('Falha ao carregar categorias');
        const data = await response.json();
        if (isMounted) setCategories(data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }

    fetchData();
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Aplicar filtros e ordenação quando os critérios mudarem
  useEffect(() => {
    let result = [...tickets];
    
    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    // Aplicar filtro de prioridade
    if (priorityFilter !== 'all') {
      result = result.filter(ticket => ticket.priority === priorityFilter);
    }
    
    // Aplicar filtro de atribuição
    if (assignmentFilter === 'assigned') {
      result = result.filter(ticket => ticket.assigned_to !== null);
    } else if (assignmentFilter === 'unassigned') {
      result = result.filter(ticket => ticket.assigned_to === null);
    }
    
    // Aplicar filtro de categoria
    if (categoryFilter !== 'all') {
      result = result.filter(ticket => ticket.category === categoryFilter);
    }
    
    // Aplicar busca
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(ticket => 
        ticket.title?.toLowerCase().includes(searchLower) || 
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar ordenação
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'status') {
      const statusOrder = { 'open': 0, 'in progress': 1, 'closed': 2 };
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    
    setFilteredTickets(result);
  }, [tickets, statusFilter, priorityFilter, assignmentFilter, categoryFilter, search, sortBy]);

  // Calcular estatísticas
  const stats = {
    total: tickets.length,
    open: tickets.filter(ticket => ticket.status === 'open').length,
    inProgress: tickets.filter(ticket => ticket.status === 'in progress').length,
    closed: tickets.filter(ticket => ticket.status === 'closed').length,
    high: tickets.filter(ticket => ticket.priority === 'high').length,
    unassigned: tickets.filter(ticket => ticket.assigned_to === null).length
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssignmentFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  return (
    <PageContainer title="Todos os Chamados">
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro: {error}</p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">Por favor, recarregue a página ou contate o administrador.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="glass-card p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mr-3">
                  <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Abertos</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.open}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full mr-3">
                  <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Em Andamento</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full mr-3">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Concluídos</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.closed}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full mr-3">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgentes</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.high}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-l-4 border-slate-400 dark:border-slate-500">
              <div className="flex items-center">
                <div className="p-2 bg-slate-100 dark:bg-slate-700/60 rounded-full mr-3">
                  <svg className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Não Atribuídos</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.unassigned}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e pesquisa */}
          <div className="glass-card mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Filtrar Chamados</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Pesquisar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 text-sm form-input-dark"
                      placeholder="Título, descrição ou email"
                    />
                    {search && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full py-2.5 px-3 text-sm form-select-dark"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="open">Abertos</option>
                    <option value="in progress">Em Andamento</option>
                    <option value="closed">Fechados</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Prioridade</label>
                  <select
                    id="priority"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="block w-full py-2.5 px-3 text-sm form-select-dark"
                  >
                    <option value="all">Todas as Prioridades</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>

                {/* Assignment */}
                <div>
                  <label htmlFor="assignment" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Atribuição</label>
                  <select
                    id="assignment"
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                    className="block w-full py-2.5 px-3 text-sm form-select-dark"
                  >
                    <option value="all">Todos</option>
                    <option value="assigned">Atribuídos</option>
                    <option value="unassigned">Não Atribuídos</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Categoria</label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full py-2.5 px-3 text-sm form-select-dark"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="sort" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Ordenar por</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full py-2.5 px-3 text-sm form-select-dark"
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="oldest">Mais Antigos</option>
                    <option value="priority">Prioridade</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary text-sm gap-2 inline-flex items-center"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de chamados */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Resultados</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                  {filteredTickets.length} {filteredTickets.length === 1 ? 'chamado' : 'chamados'}
                </span>
              </div>
            </div>

            <div className="overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredTickets.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredTickets.map(ticket => (
                    <TicketItem
                      key={ticket.id}
                      ticket={ticket}
                      isStaff={true}
                      staff={staff}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700/50">
                    <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Nenhum chamado encontrado</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {tickets.length === 0
                      ? "Não há chamados registrados no sistema."
                      : "Nenhum chamado corresponde aos filtros aplicados."}
                  </p>
                  {tickets.length > 0 && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn-primary text-sm"
                      >
                        Limpar filtros e mostrar todos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default TicketList;