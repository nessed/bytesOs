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

interface Props {
  onOpenLog: () => void;
  onSync: () => void;
  syncing: boolean;
}

export default function TopBar({ onOpenLog, onSync, syncing }: Props) {
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
        <button className="sync-btn" onClick={onSync} disabled={syncing} title="Sync from Google Sheets">
          <SyncIcon spinning={syncing} />
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
        <button className="primary-btn" onClick={onOpenLog}><Plus /> New order</button>
      </div>
    </div>
  );
}
