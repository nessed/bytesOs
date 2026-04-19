const Plus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface Props {
  onOpenLog: () => void;
}

export default function TopBar({ onOpenLog }: Props) {
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
        <button className="primary-btn" onClick={onOpenLog}><Plus /> New order</button>
      </div>
    </div>
  );
}
