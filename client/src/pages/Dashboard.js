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
  const [categoryData, setCategoryData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], datasets: [] });
  const [categories, setCategories] = useState([]);
  const [userTicketsData, setUserTicketsData] = useState({ labels: [], datasets: [] });
  const [techTicketsData, setTechTicketsData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    let isMounted = true;
    
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

        // Buscar as definições de categorias para exibir nomes amigáveis
        const categoriesResponse = await fetch('http://localhost:5000/api/tickets/categories');
        if (!categoriesResponse.ok) throw new Error('Falha ao buscar categorias');
        const categoriesData = await categoriesResponse.json();
        if (isMounted) setCategories(categoriesData);
        
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

        // Calcular métricas por categoria
        const categoryCount = {};
        
        // Inicializar contadores para cada categoria
        categoriesData.forEach(cat => {
          categoryCount[cat.id] = 0;
        });
        
        // Contar tickets por categoria
        data.forEach(ticket => {
          const ticketCategory = ticket.category || 'outro';
          categoryCount[ticketCategory] = (categoryCount[ticketCategory] || 0) + 1;
        });
        
        // Preparar dados para o gráfico
        const categoryStats = Object.entries(categoryCount)
          .map(([catId, count]) => {
            const category = categoriesData.find(c => c.id === catId) || { name: catId, id: catId };
            return {
              id: catId,
              name: category.name,
              count
            };
          })
          .sort((a, b) => b.count - a.count);

        if (isMounted) setCategoryData(categoryStats);

        // Criar dados para o gráfico de categorias
        const categoryChart = {
          labels: categoryStats.map(cat => cat.name),
          datasets: [
            {
              label: 'Chamados por Categoria',
              data: categoryStats.map(cat => cat.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)',
                'rgba(255, 99, 255, 0.7)',
                'rgba(255, 159, 144, 0.7)'
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(199, 199, 199)',
                'rgb(83, 102, 255)',
                'rgb(255, 99, 255)',
                'rgb(255, 159, 144)'
              ],
              borderWidth: 1
            }
          ]
        };
        
        if (isMounted) setCategoryChartData(categoryChart);

        // Process user tickets data
        const userStats = Object.entries(userCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Get top 10 users

        setUserTicketsData({
          labels: userStats.map(([email]) => email.split('@')[0]),
          datasets: [{
            label: 'Chamados Abertos',
            data: userStats.map(([_, count]) => count),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        });

        // Process technician tickets data
        const techStats = Object.entries(staffData)
          .sort((a, b) => b[1].assigned - a[1].assigned)
          .slice(0, 10); // Get top 10 techs

        setTechTicketsData({
          labels: techStats.map(([email]) => email.split('@')[0]),
          datasets: [{
            label: 'Chamados Atribuídos',
            data: techStats.map(([_, stats]) => stats.assigned),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }, {
            label: 'Chamados Fechados',
            data: techStats.map(([_, stats]) => stats.closed),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }]
        });

      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboardData();
    
    return () => {
      isMounted = false;
    };
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

        {/* Nova Card - Categoria mais frequente */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-indigo-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Categoria Principal</dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {categoryData.length > 0 ? categoryData[0].name : "N/A"}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Tendências */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tendências de Chamados</h3>
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

      {/* Nova seção para Categorias */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Gráfico de Distribuição por Categorias */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Categorias</h3>
          <p className="text-sm text-gray-500 mb-4">
            Visualize a distribuição dos chamados por tipo de problema para identificar áreas que precisam de mais atenção.
          </p>
          <div className="h-80">
            <Bar data={categoryChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.dataset.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
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
                },
                x: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas com Card de Categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Cards existentes... */}

        {/* Nova Card - Categoria mais frequente */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-indigo-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Categoria Principal</dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {categoryData.length > 0 ? categoryData[0].name : "N/A"}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Categorias */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhamento por Categorias</h3>
          <p className="text-sm text-gray-500 mb-4">
            Análise detalhada do volume de chamados por categoria, permitindo identificar áreas críticas e planejar recursos adequadamente.
          </p>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Chamados</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentagem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((category) => {
                  const percentage = Math.round((category.count / categoryData.reduce((sum, cat) => sum + cat.count, 0)) * 100);
                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Novos Gráficos de Usuários e Técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Usuários</h3>
          <p className="text-sm text-gray-500 mb-4">
            Usuários que mais abriram chamados no período.
          </p>
          <div className="h-80">
            <Bar 
              data={userTicketsData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Gráfico de Técnicos */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Desempenho da Equipe</h3>
          <p className="text-sm text-gray-500 mb-4">
            Chamados atribuídos vs. fechados por técnico.
          </p>
          <div className="h-80">
            <Bar 
              data={techTicketsData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo existente... */}
    </PageContainer>
  );
}

export default Dashboard;