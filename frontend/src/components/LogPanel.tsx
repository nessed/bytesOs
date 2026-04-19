import { useState } from 'react';

const fmt = (n: number) => 'PKR ' + Math.round(n).toLocaleString();

const X = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface Props {
  onClose: () => void;
}

export default function LogPanel({ onClose }: Props) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [fries, setFries] = useState(false);
  const [slot, setSlot] = useState('Lunch');
  const [paid, setPaid] = useState(true);
  const amount = qty * 300 + (fries ? 380 : 0);

  return (
    <div className="log-panel">
      <div className="log-head">
        <div className="log-title">New order</div>
        <button className="log-close" onClick={onClose}><X /></button>
      </div>
      <div className="log-field">
        <label>Customer</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" autoFocus />
      </div>
      <div className="log-row2">
        <div className="log-field">
          <label>Qty</label>
          <input type="number" min="1" value={qty} onChange={e => setQty(+e.target.value || 1)} />
        </div>
        <div className="log-field">
          <label>Slot</label>
          <select value={slot} onChange={e => setSlot(e.target.value)}>
            <option>Lunch</option><option>Dinner</option><option>Late</option>
          </select>
        </div>
      </div>
      <div className="log-toggle-row">
        <button className={`log-toggle ${fries ? 'on' : ''}`} onClick={() => setFries(!fries)}>
          + Fries
        </button>
        <button className={`log-toggle ${paid ? 'on' : ''}`} onClick={() => setPaid(!paid)}>
          {paid ? 'Paid' : 'Unpaid'}
        </button>
      </div>
      <div className="log-amount-row">
        <span>Amount</span>
        <span className="num">{fmt(amount)}</span>
      </div>
      <button className="log-submit" onClick={onClose}>Add</button>
    </div>
  );
}
