import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useState, useMemo, useEffect } from 'react';

function TicketItem({ ticket, isStaff, staff = [] }) {
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'open');
  const [currentAssignee, setCurrentAssignee] = useState(ticket.assigned_to || null);
  const [categories, setCategories] = useState([]);

  // Buscar categorias ao carregar o componente
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/tickets/categories');
        if (!response.ok) throw new Error('Falha ao carregar categorias');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }
    
    fetchCategories();
  }, []);
  
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

  // Encontrar o nome da categoria pelo ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="glass-card p-6 mb-5 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-none dark:hover:ring-slate-600/50 dark:hover:ring-2 hover:-translate-y-0.5">
      {error && (
        <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 mb-5 rounded-r-xl">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">{ticket.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">{ticket.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
              currentStatus === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50' :
              currentStatus === 'in progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50' :
              currentStatus === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50' :
              'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                currentStatus === 'open' ? 'bg-amber-500' :
                currentStatus === 'in progress' ? 'bg-blue-500' :
                currentStatus === 'closed' ? 'bg-emerald-500' : 'bg-slate-500'
              }`}></span>
              {currentStatus === 'open' ? 'Aberto' : 
               currentStatus === 'in progress' ? 'Em Andamento' : 
               currentStatus === 'closed' ? 'Fechado' : currentStatus}
            </span>
            
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium text-slate-700 dark:text-slate-300">{getCategoryName(ticket.category || 'outro')}</span>
            </div>
            
            <Link to={`/ticket/${ticket.id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors inline-flex items-center">
              Ver Detalhes 
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {isStaff && (
          <div className="flex flex-col space-y-3 w-full sm:w-64 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/40">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select 
                value={currentStatus} 
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="block w-full px-3 py-2 text-sm form-select-dark shadow-sm disabled:opacity-50 transition-shadow"
              >
                <option value="open">Aberto</option>
                <option value="in progress">Em Andamento</option>
                <option value="closed">Fechado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Responsável</label>
              <select 
                value={currentAssignee || ''}
                onChange={handleAssign}
                disabled={isUpdating}
                className="block w-full px-3 py-2 text-sm form-select-dark shadow-sm disabled:opacity-50 transition-shadow"
              >
                <option value="">Não Atribuído</option>
                {staff.map(staffMember => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.email || 'Carregando...'}
                  </option>
                ))}
              </select>
              <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Atual: <span className="font-medium text-slate-700 dark:text-slate-300">{assignedStaffEmail === 'Unassigned' ? 'Não Atribuído' : assignedStaffEmail}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/40 flex items-center text-sm text-slate-500 dark:text-slate-400">
        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">
          {new Date(ticket.created_at).toLocaleDateString()}
        </span>
        <span className="mx-2 opacity-50">•</span>
        <span>
          Aberto por <span className="font-medium text-slate-900 dark:text-slate-200">{ticket.user?.email || 'Usuário não encontrado'}</span>
        </span>
      </div>
    </div>
  );
}

export default TicketItem;