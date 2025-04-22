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
    <PageContainer title="My Support Tickets">
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tickets.length === 0 ? "You haven't created any tickets yet." : "No tickets match your current filters."}
              </p>
              <div className="mt-6">
                <Link
                  to="/create-ticket"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Ticket
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