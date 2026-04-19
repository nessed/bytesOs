import type { Summary as SummaryData } from '../types';

function fmt(n: number) { return 'PKR ' + n.toLocaleString(); }

const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const IconCoin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 3h5.5" />
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

interface Props { data: SummaryData; }

export default function Summary({ data }: Props) {
  const cards = [
    {
      label: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      sub: 'across all delivery slots',
      icon: <IconBox />,
      accent: 'var(--orange)',
      muted: 'var(--orange-muted)',
    },
    {
      label: 'Total Revenue',
      value: fmt(data.totalRevenue),
      sub: 'including outstanding',
      icon: <IconCoin />,
      accent: 'var(--green)',
      muted: 'var(--green-muted)',
    },
    {
      label: 'Outstanding',
      value: fmt(data.unpaidAmount),
      sub: 'not yet collected',
      icon: <IconAlert />,
      accent: 'var(--red)',
      muted: 'var(--red-muted)',
    },
    {
      label: 'Repeat Customers',
      value: data.repeatCustomers.toLocaleString(),
      sub: 'ordered on 2+ days',
      icon: <IconUsers />,
      accent: 'var(--blue)',
      muted: 'var(--blue-muted)',
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map(c => (
        <div
          key={c.label}
          className="stat-card"
          style={{ '--accent-color': c.accent, '--accent-muted': c.muted } as React.CSSProperties}
        >
          <div className="stat-icon">{c.icon}</div>
          <div className="stat-value">{c.value}</div>
          <div className="stat-label">{c.label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
