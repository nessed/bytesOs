const Plus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SyncIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spinning ? 'spin 0.7s linear infinite' : 'none' }}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

interface Props {
  onOpenLog: () => void;
  onSync: () => void;
  syncing: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function TopBar({ onOpenLog, onSync, syncing, isDark, onToggleTheme }: Props) {
  return (
    <div className="topbar">
      <div className="tb-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo">B</div>
          <div className="tb-title">bytes<em>os</em></div>
        </div>
      </div>
      <div className="tb-right">
        <span className="live-dot">live</span>
        <button className="ghost-btn" onClick={onToggleTheme} title="Toggle theme" style={{ padding: '6px 8px' }}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="sync-btn" onClick={onSync} disabled={syncing} title="Sync from Google Sheets">
          <SyncIcon spinning={syncing} />
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
        <button className="primary-btn" onClick={onOpenLog}><Plus /> New order</button>
      </div>
    </div>
  );
}
