import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTicket, useCategories } from '../hooks/useTickets';
import PageContainer from './PageContainer';
import Card from './ui/Card';
import Button from './ui/Button';

function CreateTicket() {
  const navigate = useNavigate();
  const createTicketMutation = useCreateTicket();
  const { data: categories = [] } = useCategories();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'outro'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTicketMutation.mutate(formData, {
      onSuccess: () => navigate('/my-tickets')
    });
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm";
  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <PageContainer 
      title="Novo Chamado" 
      subtitle="Descreva seu problema com o máximo de detalhes para um atendimento ágil."
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card variant="glass" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Título do Chamado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Não consigo acessar o e-mail corporativo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputClasses + " font-bold cursor-pointer appearance-none"}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Urgência Estimada</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={inputClasses + " font-bold cursor-pointer appearance-none"}
                >
                  <option value="low">Baixa - Não impede o trabalho</option>
                  <option value="medium">Média - Dificulta o trabalho</option>
                  <option value="high">Alta - Impede o trabalho totalmente</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Descrição Detalhada</label>
                <textarea
                  required
                  rows="6"
                  placeholder="Descreva o que aconteceu, mensagens de erro que apareceram, etc..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClasses + " min-h-[150px] leading-relaxed"}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <Button 
                type="submit" 
                className="flex-1 py-4 text-base" 
                isLoading={createTicketMutation.isPending}
              >
                Abrir Chamado Agora
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="px-8"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
            </div>
          </Card>
          
          <p className="mt-6 text-center text-xs text-slate-400 font-medium">
            Ao abrir um chamado, nossa equipe técnica será notificada e você receberá atualizações por e-mail.
          </p>
        </form>
      </div>
    </PageContainer>
  );
}

export default CreateTicket;