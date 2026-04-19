import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import RevenueChart from './components/RevenueChart';
import ActivityFeed from './components/ActivityFeed';
import UnpaidToday from './components/UnpaidToday';
import LogPanel from './components/LogPanel';
import DailyTracker from './components/DailyTracker';
import CustomerTable from './components/CustomerTable';
import DebtTable from './components/DebtTable';
import Summary from './components/Summary';
import FinancesView from './components/FinancesView';
import Login from './components/Login';
import type { DashboardData, Customer, DebtCustomer, View, Summary as SummaryData, FinancesData } from './types';
import './App.css';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [customersData, setCustomersData] = useState<Customer[] | null>(null);
  const [debtData, setDebtData] = useState<DebtCustomer[] | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [financesData, setFinancesData] = useState<FinancesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('14d');
  const [logOpen, setLogOpen] = useState(false);
  const [paidIds, setPaidIds] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [auth, setAuth] = useState(() => localStorage.getItem('bytes_auth') === 'true');

  useEffect(() => {
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [isDark]);

  const loadDashboard = () => {
    if (!auth) return;
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/debt').then(r => r.json()),
      fetch('/api/summary').then(r => r.json()),
      fetch('/api/finances').then(r => r.json())
    ])
      .then(([dash, cust, dbt, sum, fin]) => {
        setData(dash);
        setCustomersData(cust);
        setDebtData(dbt);
        setSummaryData(sum);
        setFinancesData(fin);
      })
      .catch(() => setError('Failed to connect to server.'));
  };

  useEffect(() => { loadDashboard(); }, [auth]);

  const onSync = async () => {
    setSyncing(true);
    await fetch('/api/refresh', { method: 'POST' });
    await loadDashboard();
    setSyncing(false);
  };

  const onMarkPaid = (id: number) => {
    setPaidIds(s => new Set([...s, id]));
  };

  if (!auth) {
    return <Login onLogin={() => {
      localStorage.setItem('bytes_auth', 'true');
      setAuth(true);
    }} />;
  }

  if (error) {
    return (
      <div className="app">
        <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} view={view} setView={setView} />
        <main className="main">
          <div className="error-state">{error}</div>
        </main>
      </div>
    );
  }

  if (!data || !customersData || !debtData || !summaryData || !financesData) {
    return (
      <div className="app">
        <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} view={view} setView={setView} />
        <main className="main">
          <div className="loading-state">
            <div className="spinner" />
            Loading data…
          </div>
        </main>
      </div>
    );
  }

  const todayDate = data.dailyBreakdown?.[0]?.date ?? '';

  return (
    <div className="app">
      <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} view={view} setView={setView} />

      <main className="main">
        {view === 'dashboard' && (
          <div className="fade-in">
            <div className="greeting">
              <h1>{data.today}.</h1>
              <div className="sub">{data.metrics.todayOrders} orders today · {data.openOrders.length} unpaid</div>
            </div>

            <Hero m={data.metrics} />
            <RevenueChart revData={data.revData ?? []} revLabels={data.revLabels ?? []} range={range} setRange={setRange} />

            <div className="bottom">
              <ActivityFeed data={data.activity} />
              <UnpaidToday data={data.openOrders} paidIds={paidIds} onMarkPaid={onMarkPaid} />
            </div>

            <DailyTracker data={data.dailyBreakdown ?? []} todayDate={todayDate} />
          </div>
        )}

        {view === 'customers' && (
          <div className="fade-in">
            <Summary data={summaryData} />
            <div style={{ height: 48 }} />
            <CustomerTable data={customersData} />
          </div>
        )}

        {view === 'debt' && (
          <div className="fade-in">
            <DebtTable data={debtData} />
          </div>
        )}

        {view === 'finances' && (
          <div className="fade-in">
            <FinancesView data={financesData} />
          </div>
        )}
      </main>

      {logOpen && <LogPanel onClose={() => setLogOpen(false)} />}
    </div>
  );
}
