import { Link } from 'react-router-dom';
import { memo, useMemo, useCallback } from 'react';
import { useUpdateTicket } from '../hooks/useTickets';
import Badge from './ui/Badge';
import Card from './ui/Card';

// Wrapped in React.memo — only re-renders when ticket or staff props actually change.
// categories is now passed as a prop instead of being fetched inside this component,
// eliminating N redundant React Query observers (one per ticket card).
const TicketItem = memo(function TicketItem({ ticket, isStaff, staff = [], categories = [] }) {
  const updateTicketMutation = useUpdateTicket();

  const handleStatusChange = useCallback((e) => {
    const newStatus = e.target.value;
    if (newStatus === ticket.status) return;
    updateTicketMutation.mutate({ id: ticket.id, status: newStatus });
  }, [ticket.id, ticket.status, updateTicketMutation]);

  const handleAssign = useCallback((e) => {
    const selectedValue = e.target.value;
    const newAssignee = selectedValue === "" ? null : selectedValue;
    if (newAssignee === ticket.assigned_to) return;
    updateTicketMutation.mutate({ id: ticket.id, assigned_to: newAssignee });
  }, [ticket.id, ticket.assigned_to, updateTicketMutation]);

  const assignedStaffEmail = useMemo(() => {
    if (!ticket.assigned_to) return 'Não Atribuído';
    const assignedStaff = staff.find(s => s.id === ticket.assigned_to);
    return assignedStaff?.email || `Equipe (${ticket.assigned_to.substring(0,8)}...)`;
  }, [ticket.assigned_to, staff]);

  const getCategoryName = useCallback(
    (categoryId) => categories.find(c => c.id === categoryId)?.name || categoryId,
    [categories]
  );

  // Semantic Status Configuration
  const statusConfig = {
    'open': { label: 'Aberto', variant: 'warning', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    'in progress': { label: 'Em Atendimento', variant: 'info', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    'closed': { label: 'Concluído', variant: 'success', icon: 'M5 13l4 4L19 7' }
  };

  const currentStatus = statusConfig[ticket.status] || statusConfig['open'];

  return (
    <Card variant="glass" className="group mb-4 hover:border-primary-500/50 transition-all duration-300 !p-0 overflow-hidden shadow-sm hover:shadow-primary-500/10">
      <div className="p-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-primary-500/20 group-hover:to-indigo-500/20 transition-all duration-500" />
      
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            {/* Top Row: Meta info */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={currentStatus.variant} className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                  </span>
                  {currentStatus.label}
                </div>
              </Badge>
              
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tighter">
                ID-{ticket.id.substring(0, 8).toUpperCase()}
              </span>

              {ticket.priority === 'high' && (
                <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                  Urgente
                </span>
              )}
            </div>
            
            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                {ticket.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 max-w-3xl font-medium italic">
                "{ticket.description}"
              </p>
            </div>

            {/* Bottom Row: Tags and User Info */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {ticket.user?.email?.charAt(0).toUpperCase() || 'S'}
                </div>
                {ticket.assigned_to && (
                   <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {assignedStaffEmail.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {ticket.user?.email?.split('@')[0] || 'Sistema'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <Badge variant="indigo" className="bg-indigo-500/5 text-indigo-500 border-indigo-500/10 text-[10px]">
                  {getCategoryName(ticket.category || 'outro')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            {isStaff && (
              <div className="flex flex-col gap-2 flex-1 lg:flex-none">
                 <select 
                  value={ticket.status || 'open'} 
                  onChange={handleStatusChange}
                  disabled={updateTicketMutation.isPending}
                  className="w-full lg:min-w-[180px] py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="open">Aberto</option>
                  <option value="in progress">Em Atendimento</option>
                  <option value="closed">Concluído</option>
                </select>

                <select 
                  value={ticket.assigned_to || ''}
                  onChange={handleAssign}
                  disabled={updateTicketMutation.isPending}
                  className="w-full lg:min-w-[180px] py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="">Aguardando Técnico</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}
                </select>
              </div>
            )}
            
            <Link 
              to={`/ticket/${ticket.id}`} 
              className="flex items-center justify-center h-10 px-6 text-xs font-black text-white bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-500 rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/20 active:scale-95 whitespace-nowrap"
            >
              GERENCIAR
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default TicketItem;
