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
              role
            )
          `);

        if (ticketsError) throw ticketsError;
        setTickets(ticketsData || []);

        // Try fetching staff using RPC first
        const { data: staffData, error: staffError } = await supabase
          .rpc('get_staff_users');

        if (staffError) {
          // Log the error but don't necessarily throw, maybe staff
          console.log('Falling back to direct query');
          // Fallback query if the RPC doesn't exist
          const { data: fallbackStaffData, error: fallbackError } = await supabase
            .from('users')
            .select(`
              id,
              role
            `)
            .eq('role', 'staff');

          if (fallbackError) throw fallbackError;
          
          // Get emails for staff users
          const staffWithEmails = await Promise.all(
            (fallbackStaffData || []).map(async (staffMember) => {
              const { data: userData } = await supabase.auth.admin.getUserById(staffMember.id);
              return {
                ...staffMember,
                email: userData?.email || 'No email found'
              };
            })
          );
          
          setStaff(staffWithEmails);
        } else {
          setStaff(staffData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
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