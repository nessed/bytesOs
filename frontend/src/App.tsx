import { useEffect, useState } from 'react';
import Summary from './components/Summary';
import DebtTable from './components/DebtTable';
import CustomerTable from './components/CustomerTable';
import type { Summary as SummaryData, DebtCustomer, Customer } from './types';
import './App.css';

type Tab = 'summary' | 'debt' | 'customers';

interface AppData {
  summary: SummaryData;
  debt: DebtCustomer[];
  customers: Customer[];
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'summary',
    label: 'Overview',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'debt',
    label: 'Debt',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('summary');
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/summary').then(r => r.json()),
      fetch('/api/debt').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
    ])
      .then(([summary, debt, customers]) => setData({ summary, debt, customers }))
      .catch(() => setError('Failed to connect to server.'));
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">B</div>
          <span className="header-title">Bytes <span>OS</span></span>
        </div>

        {data && (
          <div className="header-meta">
            <div className="meta-pill">
              <strong>{data.summary.totalOrders}</strong> orders
            </div>
            <div className="meta-pill">
              <strong>PKR {data.summary.totalRevenue.toLocaleString()}</strong> revenue
            </div>
            {data.summary.unpaidAmount > 0 && (
              <div className="meta-pill" style={{ borderColor: 'var(--red-border)', color: 'var(--red)' }}>
                <strong>PKR {data.summary.unpaidAmount.toLocaleString()}</strong> unpaid
              </div>
            )}
          </div>
        )}
      </header>

      <nav className="app-nav">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`nav-btn${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            {icon}{label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {error && <div className="error-state">{error}</div>}

        {!data && !error && (
          <div className="loading-state">
            <div className="spinner" />
            Loading data…
          </div>
        )}

        {data && (
          <>
            {tab === 'summary'   && <Summary data={data.summary} />}
            {tab === 'debt'      && <DebtTable data={data.debt} />}
            {tab === 'customers' && <CustomerTable data={data.customers} />}
          </>
        )}
      </main>
    </>
  );
}
