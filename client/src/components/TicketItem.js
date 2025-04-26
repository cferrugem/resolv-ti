import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useState, useMemo } from 'react';

function TicketItem({ ticket, isStaff, staff = [] }) {
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'open');
  const [currentAssignee, setCurrentAssignee] = useState(ticket.assigned_to || null);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return; // Skip if no change
    
    try {
      setIsUpdating(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }

      // First try direct Supabase update
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) {
        // Fall back to server API if direct update fails
        const response = await fetch(`http://localhost:5000/api/tickets/${ticket.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update ticket status');
          } else {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
      }
      
      setCurrentStatus(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
      e.target.value = currentStatus; // Reset to previous value
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssign = async (e) => {
    const selectedValue = e.target.value;
    const newAssignee = selectedValue === "" ? null : selectedValue;
    
    if (newAssignee === currentAssignee) return;

    const previousAssignee = currentAssignee;
    setCurrentAssignee(newAssignee);
    setIsUpdating(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session found');

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: newAssignee,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError('Failed to assign ticket');
      setCurrentAssignee(previousAssignee);
      e.target.value = previousAssignee || '';
    } finally {
      setIsUpdating(false);
    }
  };

  const assignedStaffEmail = useMemo(() => {
    if (!currentAssignee) return 'Unassigned';
    
    // Find assigned staff member in the staff array
    const assignedStaff = staff.find(s => s.id === currentAssignee);
    
    // Return email if found, otherwise show a partial ID
    return assignedStaff?.email || `Staff (${currentAssignee.substring(0,8)}...)`;
  }, [currentAssignee, staff]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.title}</h3>
          <p className="text-gray-600 mb-4">{ticket.description}</p>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium border ${
              currentStatus === 'open' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              currentStatus === 'in progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              currentStatus === 'closed' ? 'bg-green-100 text-green-800 border-green-300' :
              'bg-gray-100 text-gray-800 border-gray-300' // Default/fallback style
            }`}>
              {/* Icons for status */}
              {currentStatus === 'open' && <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>}
              {currentStatus === 'in progress' && <svg className="w-3 h-3 mr-1.5 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.5a1.5 1.5 0 013 0V5a1 1 0 01-2 0V3.5zM10 15a1.5 1.5 0 013 0v1.5a1 1 0 11-2 0V15zm-5-1.5a1.5 1.5 0 000 3H6a1 1 0 100-2H5zm11.5 0a1.5 1.5 0 000 3H18a1 1 0 100-2h-1.5zM5 6.5a1.5 1.5 0 010-3H3.5a1 1 0 000 2H5zm11.5 0a1.5 1.5 0 010-3H15a1 1 0 100 2h1.5z" /></svg>}
              {currentStatus === 'closed' && <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              {/* Capitalize status */}
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
            <Link to={`/ticket/${ticket.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
              View Details →
            </Link>
          </div>
        </div>
        {isStaff && (
          <div className="flex flex-col space-y-2">
            <select 
              value={currentStatus} 
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
            >
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <div className="relative">
              <select 
                value={currentAssignee || ''}
                onChange={handleAssign}
                disabled={isUpdating}
                className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {staff.map(staffMember => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.email || 'Loading...'}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-sm text-gray-500">
                Currently assigned to: {assignedStaffEmail}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketItem;