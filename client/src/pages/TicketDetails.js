import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTicket, useTicketComments, useAddComment, useUpdateTicket, useCategories, useStaff } from '../hooks/useTickets';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user: currentUser } = useAuth();
  const { data: ticket, isLoading, isError } = useTicket(id);
  const { data: comments = [], isLoading: isLoadingComments } = useTicketComments(id);
  const { data: categories = [] } = useCategories();
  const { data: staff = [] } = useStaff();
  
  const addCommentMutation = useAddComment();
  const updateTicketMutation = useUpdateTicket();
  
  const [newComment, setNewComment] = useState('');
  // Local state for instant feedback
  const [optimisticStatus, setOptimisticStatus] = useState(null);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ ticket_id: id, comment: newComment }, {
      onSuccess: () => setNewComment('')
    });
  };

  const handleStatusChange = (newStatus) => {
    setOptimisticStatus(newStatus);
    updateTicketMutation.mutate({ id, status: newStatus }, {
      onError: () => setOptimisticStatus(null) // Revert on error
    });
  };

  if (isLoading) return <PageContainer title="Carregando..." />;
  if (isError || !ticket) return <PageContainer title="Erro">Chamado não encontrado.</PageContainer>;

  const currentStatusValue = optimisticStatus || ticket.status;
  const categoryName = categories.find(c => c.id === ticket.category)?.name || ticket.category;
  const isStaff = role === 'staff';

  return (
    <PageContainer 
      title={ticket.title}
      subtitle={`Chamado aberto por ${ticket.user?.email} em ${new Date(ticket.created_at).toLocaleDateString()}`}
      actions={
        <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="glass" title="Descrição do Problema">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>
          </Card>

          <section className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Interações e Histórico</h3>
            
            <Card variant="glass" className="!p-0 overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-white/5">
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione uma atualização ou resposta..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all min-h-[100px] text-sm font-medium"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" isLoading={addCommentMutation.isPending} disabled={!newComment.trim()}>
                        Enviar Comentário
                      </Button>
                    </div>
                  </form>
               </div>

               <div className="divide-y divide-slate-100 dark:divide-white/5 bg-slate-50/30 dark:bg-black/10">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-6 hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${comment.user?.role === 'staff' ? 'bg-primary-500' : 'bg-slate-500'}`}>
                            {comment.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {comment.user?.email}
                                {comment.user?.role === 'staff' && (
                                  <Badge variant="primary" className="ml-2 py-0">Suporte</Badge>
                                )}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-slate-400 font-medium">Nenhuma interação registrada ainda.</p>
                    </div>
                  )}
               </div>
            </Card>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card variant="glass" title="Status e Controle">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status Atual</label>
                <div className="flex flex-wrap gap-2">
                  <StatusButton 
                    active={currentStatusValue === 'open'} 
                    onClick={() => handleStatusChange('open')}
                    variant="warning"
                    label="Aberto"
                  />
                  <StatusButton 
                    active={currentStatusValue === 'in progress'} 
                    onClick={() => handleStatusChange('in progress')}
                    variant="info"
                    label="Em Atendimento"
                  />
                  <StatusButton 
                    active={currentStatusValue === 'closed'} 
                    onClick={() => handleStatusChange('closed')}
                    variant="success"
                    label="Concluído"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Metadados</label>
                <div className="space-y-3">
                  <MetaItem label="Categoria" value={categoryName} />
                  <MetaItem label="Prioridade" value={ticket.priority} uppercase isPriority />
                  <MetaItem label="Técnico" value={staff.find(s => s.id === ticket.assigned_to)?.email || 'Não Atribuído'} />
                </div>
              </div>

              {isStaff && (
                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Atribuição</label>
                  <select 
                    value={ticket.assigned_to || ''}
                    onChange={(e) => updateTicketMutation.mutate({ id, assigned_to: e.target.value || null })}
                    className="w-full py-2.5 px-3 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="">Aguardando Técnico</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}
                  </select>
                </div>
              )}
            </div>
          </Card>

          <Card variant="flat" className="bg-primary-500/5 border-primary-500/10">
             <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs font-bold leading-relaxed">
                  Este chamado segue as políticas de SLA nível 1. Respostas técnicas em até 4h úteis.
                </p>
             </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function StatusButton({ active, onClick, variant, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
        active 
          ? `bg-${variant === 'warning' ? 'amber' : variant === 'info' ? 'blue' : 'emerald'}-500 text-white border-transparent shadow-lg` 
          : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function MetaItem({ label, value, uppercase, isPriority }) {
  const priorityColors = {
    high: "text-red-500",
    medium: "text-amber-500",
    low: "text-emerald-500"
  };
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-xs font-black ${uppercase ? 'uppercase' : ''} ${isPriority ? priorityColors[value] : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

export default TicketDetails;