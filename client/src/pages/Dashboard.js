import { useState, useMemo } from 'react';
import { useDashboardStats, useCategories } from '../hooks/useTickets';
import PageContainer from '../components/PageContainer';
import Card from '../components/ui/Card';
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
  const [timeFrame, setTimeFrame] = useState('week');
  const { data: stats, isLoading, isError } = useDashboardStats(timeFrame);
  const { data: categories = [] } = useCategories();

  if (isLoading) {
    return (
      <PageContainer title="Analytics" subtitle="Carregando métricas em tempo real...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (isError || !stats) {
    return (
      <PageContainer title="Dashboard">
        <Card variant="glass" className="text-center py-12 border-red-500/20">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Erro ao carregar dados</h3>
          <p className="text-slate-600 dark:text-slate-400">Não foi possível carregar as estatísticas do painel.</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <DashboardContent
      stats={stats}
      categories={categories}
      timeFrame={timeFrame}
      setTimeFrame={setTimeFrame}
    />
  );
}

// Separated into its own component so useMemo runs after data is confirmed available.
function DashboardContent({ stats, categories, timeFrame, setTimeFrame }) {
  // Memoize chart options — object reference stays stable across renders.
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(203, 213, 225, 0.1)' },
        ticks: { font: { size: 11, weight: '600' }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '600' }, color: '#94a3b8' }
      }
    }
  }), []);

  const statusChartData = useMemo(() => ({
    labels: ['Aberto', 'Em Andamento', 'Fechado'],
    datasets: [{
      data: [stats.open, stats.inProgress, stats.closed],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
      borderWidth: 0,
      hoverOffset: 10
    }],
  }), [stats.open, stats.inProgress, stats.closed]);

  const trendChartData = useMemo(() => ({
    labels: Object.keys(stats.trends).map(d => d.substring(5)),
    datasets: [{
      label: 'Novos Tickets',
      data: Object.values(stats.trends),
      fill: true,
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      borderColor: '#0ea5e9',
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#0ea5e9',
      tension: 0.4
    }]
  }), [stats.trends]);

  const categoryChartData = useMemo(() => ({
    labels: Object.keys(stats.byCategory).map(catId => categories.find(c => c.id === catId)?.name || catId),
    datasets: [{
      data: Object.values(stats.byCategory),
      backgroundColor: '#6366f1',
      borderRadius: 8,
      barThickness: 20
    }]
  }), [stats.byCategory, categories]);

  const doughnutOptions = useMemo(() => ({
    ...chartOptions,
    cutout: '80%',
    plugins: { ...chartOptions.plugins, legend: { display: false } }
  }), [chartOptions]);

  const slaPercent = Math.round((stats.closed / (stats.total || 1)) * 100);

  return (
    <PageContainer 
      title="Analytics" 
      subtitle="Visão geral de performance e volumetria de suporte."
      actions={
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
          {['week', 'month', 'quarter'].map((p) => (
            <button
              key={p}
              onClick={() => setTimeFrame(p)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${
                timeFrame === p 
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Trimestre'}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Acumulado" value={stats.total} icon={IconTotal} color="blue" />
        <StatCard title="Aguardando" value={stats.open} icon={IconOpen} color="amber" />
        <StatCard title="Em Atendimento" value={stats.inProgress} icon={IconProgress} color="blue" />
        <StatCard title="Finalizados" value={stats.closed} icon={IconClosed} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tendência de Abertura" subtitle="Volume de tickets por período" className="lg:col-span-2">
          <div className="h-72 w-full mt-4">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Status de Operação" subtitle="Distribuição atual da fila">
          <div className="h-64 flex items-center justify-center mt-4">
            <Doughnut data={statusChartData} options={doughnutOptions} />
            <div className="absolute text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SLA</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {slaPercent}%
              </p>
            </div>
          </div>
        </Card>

        <Card title="Tickets por Categoria" subtitle="Top motivos de suporte" className="lg:col-span-1">
          <div className="h-72 w-full mt-4">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Ranking de Solicitantes" subtitle="Maiores volumes por e-mail" className="lg:col-span-2">
           <div className="mt-4 space-y-4">
              {Object.entries(stats.topUsers).slice(0, 5).sort((a,b) => b[1]-a[1]).map(([email, count], idx) => (
                <div key={email} className="flex items-center gap-4 group">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 w-4 font-mono">0{idx+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{email}</span>
                      <span className="text-xs font-black text-primary-500 font-mono">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10",
  };
  return (
    <Card variant="glass" className="hover:scale-[1.02] active:scale-95 cursor-default">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 font-mono tracking-tighter">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// Icons
const IconTotal = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconOpen = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconProgress = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconClosed = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

export default Dashboard;