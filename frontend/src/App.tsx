import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import RevenueChart from './components/RevenueChart';
import ActivityFeed from './components/ActivityFeed';
import UnpaidToday from './components/UnpaidToday';
import LogPanel from './components/LogPanel';
import DailyTracker from './components/DailyTracker';
import type { DashboardData } from './types';
import './App.css';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('14d');
  const [logOpen, setLogOpen] = useState(false);
  const [paidIds, setPaidIds] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [isDark]);

  const loadDashboard = () =>
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to connect to server.'));

  useEffect(() => { loadDashboard(); }, []);

  const onSync = async () => {
    setSyncing(true);
    await fetch('/api/refresh', { method: 'POST' });
    await loadDashboard();
    setSyncing(false);
  };

  const onMarkPaid = (id: number) => {
    setPaidIds(s => new Set([...s, id]));
  };

  if (error) {
    return (
      <div className="app">
        <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
        <main className="main">
          <div className="error-state">{error}</div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
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
      <TopBar onOpenLog={() => setLogOpen(true)} onSync={onSync} syncing={syncing} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <main className="main">
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
      </main>

      {logOpen && <LogPanel onClose={() => setLogOpen(false)} />}
    </div>
  );
}
