import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import TicketItem from '../components/TicketItem';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a variable to track if the component is still mounted
    let isMounted = true;
    
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get tickets with user information
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            *,
            user:user_id (
              id,
              role,
              email
            ),
            assigned_staff:assigned_to (
              id,
              role,
              email
            )
          `);

        if (ticketsError) throw ticketsError;
        if (isMounted) setTickets(ticketsData || []);

        // Skip the RPC attempt and go directly to the working query
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
          console.log('Staff data loaded:', staffData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTickets = tickets.filter(ticket =>
    ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Tickets</h1>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search tickets"
        className="w-full p-2 border rounded mb-4"
      />
      {filteredTickets.map(ticket => (
        <TicketItem 
          key={ticket.id} 
          ticket={ticket} 
          isStaff={true} 
          staff={staff || []} 
        />
      ))}
    </div>
  );
}

export default TicketList;