import TicketItem from '../components/TicketItem';
import PageContainer from '../components/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTickets, useStaff, useCategories } from '../hooks/useTickets';
import { useNavigate } from 'react-router-dom';

function MyTickets() {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useTickets();
  const { data: staff = [] } = useStaff();
  // Fetch categories once at this level and pass as prop to TicketItem,
  // avoiding N separate query subscriptions inside each ticket card.
  const { data: categories = [] } = useCategories();

  if (isLoading) {
    return (
      <PageContainer title="Meus Chamados">
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Meus Chamados" 
      subtitle="Acompanhe o status das suas solicitações de suporte."
      actions={
        <Button onClick={() => navigate('/create-ticket')}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Novo Chamado
        </Button>
      }
    >
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map(t => (
            <TicketItem key={t.id} ticket={t} isStaff={false} staff={staff} categories={categories} />
          ))
        ) : (
          <Card variant="glass" className="text-center py-20 flex flex-col items-center">
             <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Você ainda não tem chamados</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Precisa de ajuda com algo? Abra um novo ticket agora.</p>
            <Button variant="primary" className="mt-8" onClick={() => navigate('/create-ticket')}>Abrir Primeiro Chamado</Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

export default MyTickets;