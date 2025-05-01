import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [totalTickets, setTotalTickets] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [inProgressTickets, setInProgressTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);
  const [recentTickets, setRecentTickets] = useState([]);
  const [urgentTickets, setUrgentTickets] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [ticketTrend, setTicketTrend] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('week');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        if (!user) {
          navigate('/login');
          return;
        }

        if (role !== 'staff') {
          navigate('/my-tickets');
          return;
        }

        // Obter data atual e calcular intervalo com base no período selecionado
        const now = new Date();
        let startDate;
        
        switch(timeFrame) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          default:
            startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        const startDateString = startDate.toISOString();

        // Buscar todos os dados de tickets
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            user:user_id (
              id,
              email
            ),
            assigned_staff:assigned_to (
              id,
              email
            ),
            ticket_comments (
              id,
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calcular estatísticas
        setTotalTickets(data.length);
        setOpenTickets(data.filter(ticket => ticket.status === 'open').length);
        setInProgressTickets(data.filter(ticket => ticket.status === 'in progress').length);
        setClosedTickets(data.filter(ticket => ticket.status === 'closed').length);
        
        // Calcular tickets urgentes
        setUrgentTickets(data.filter(ticket => ticket.priority === 'high').length);
        
        // Obter tickets recentes
        setRecentTickets(data.slice(0, 5));

        // Calcular tempo médio de resposta (tempo até o primeiro comentário)
        const ticketsWithComments = data.filter(ticket => ticket.ticket_comments && ticket.ticket_comments.length > 0);
        let totalResponseTime = 0;
        
        ticketsWithComments.forEach(ticket => {
          const createdAt = new Date(ticket.created_at);
          const firstComment = new Date(ticket.ticket_comments[0].created_at);
          const diffTime = Math.abs(firstComment - createdAt);
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          totalResponseTime += diffHours;
        });
        
        const avgResponseTime = ticketsWithComments.length > 0 ? 
          (totalResponseTime / ticketsWithComments.length).toFixed(1) : 0;
        setResponseTime(avgResponseTime);

        // Gerar dados de tendência de tickets (últimos 7 dias)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();
        
        const trendsData = last7Days.map(date => {
          return {
            date,
            count: data.filter(ticket => ticket.created_at.startsWith(date)).length
          };
        });
        
        setTicketTrend(trendsData);

        // Calcular os principais usuários que criam tickets
        const userCounts = {};
        data.forEach(ticket => {
          const email = ticket.user?.email || 'Desconhecido';
          userCounts[email] = (userCounts[email] || 0) + 1;
        });
        
        setTopUsers(Object.entries(userCounts)
          .map(([email, count]) => ({ email, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5));

        // Calcular desempenho da equipe
        const staffData = {};
        data.filter(ticket => ticket.assigned_to).forEach(ticket => {
          const email = ticket.assigned_staff?.email || 'Desconhecido';
          if (!staffData[email]) {
            staffData[email] = { assigned: 0, closed: 0 };
          }
          staffData[email].assigned += 1;
          if (ticket.status === 'closed') {
            staffData[email].closed += 1;
          }
        });
        
        setStaffPerformance(Object.entries(staffData)
          .map(([email, stats]) => ({ 
            email, 
            assigned: stats.assigned, 
            closed: stats.closed,
            efficiency: stats.assigned > 0 ? Math.round((stats.closed / stats.assigned) * 100) : 0
          }))
          .sort((a, b) => b.efficiency - a.efficiency));

      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, role, navigate, timeFrame]);

  // Dados para gráfico de status
  const statusChartData = {
    labels: ['Aberto', 'Em Andamento', 'Fechado'],
    datasets: [
      {
        label: 'Tickets por Status',
        data: [openTickets, inProgressTickets, closedTickets],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de tendências
  const trendChartData = {
    labels: ticketTrend.map(item => item.date.substring(5)),
    datasets: [
      {
        label: 'Novos Tickets',
        data: ticketTrend.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgb(66, 133, 244)',
        tension: 0.4
      }
    ]
  };

  // Dados para gráfico de desempenho da equipe
  const staffChartData = {
    labels: staffPerformance.map(item => item.email.split('@')[0]),
    datasets: [
      {
        label: 'Atribuídos',
        data: staffPerformance.map(item => item.assigned),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'Fechados',
        data: staffPerformance.map(item => item.closed),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  if (isLoading) {
    return (
      <PageContainer title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Painel de Suporte">
      {/* Seletor de período */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeFrame === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeFrame === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => setTimeFrame('quarter')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeFrame === 'quarter' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Trimestre
          </button>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total de Tickets</dt>
                <dd className="text-3xl font-semibold text-gray-900">{totalTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-yellow-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Abertos</dt>
                <dd className="text-3xl font-semibold text-gray-900">{openTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-600 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-600 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Em Andamento</dt>
                <dd className="text-3xl font-semibold text-gray-900">{inProgressTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-green-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Fechados</dt>
                <dd className="text-3xl font-semibold text-gray-900">{closedTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Urgentes</dt>
                <dd className="text-3xl font-semibold text-gray-900">{urgentTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Tempo Médio Resp.</dt>
                <dd className="text-3xl font-semibold text-gray-900">{responseTime}h</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Tendências */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tendências de Tickets</h3>
          <div className="h-64">
            <Line data={trendChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Gráfico de Distribuição de Status */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
          <div className="h-64 flex justify-center">
            <div style={{ maxWidth: '250px' }}>
              <Doughnut data={statusChartData} options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                },
                cutout: '70%'
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* Desempenho da Equipe */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Desempenho da Equipe</h3>
          <div className="h-64">
            <Bar data={staffChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    afterBody: function(context) {
                      const index = context[0].dataIndex;
                      return `Eficiência: ${staffPerformance[index].efficiency}%`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Grid Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Principais Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Principais Usuários</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topUsers.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{user.count}</span>
                        <div className="relative w-full h-2 bg-gray-200 rounded">
                          <div 
                            className="absolute top-0 left-0 h-2 bg-blue-500 rounded"
                            style={{ width: `${(user.count / topUsers[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tickets Recentes */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets Recentes</h3>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentTickets.map((ticket) => (
                <li key={ticket.id} className="py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="mr-2">Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span className="ml-2">Por {ticket.user?.email.split('@')[0] || 'Desconhecido'}</span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status === 'open' ? 'Aberto' : 
                         ticket.status === 'in progress' ? 'Em Andamento' : 'Fechado'}
                      </div>
                      <button 
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="ml-3 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/tickets')} 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Ver Todos os Tickets
              <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Dashboard;