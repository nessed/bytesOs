interface Props {
  revData: number[];
  revLabels: string[];
  range: string;
  setRange: (r: string) => void;
}

export default function RevenueChart({ revData, revLabels, range, setRange }: Props) {
  const n = range === '7d' ? 7 : range === '30d' ? 30 : 14;
  const series = revData.slice(-n);
  const labels = revLabels.slice(-n);

  if (series.length < 2) return null;

  const W = 800, H = 180, padT = 10, padB = 10;
  const innerH = H - padT - padB;
  const max = Math.max(...series);
  const stepX = W / (series.length - 1);
  const points = series.map((v, i) => [
    i * stepX,
    padT + innerH - ((v) / (max || 1)) * innerH,
  ]);
  const d = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');
  const area = d + ` L${points[points.length - 1][0]},${H - padB} L${points[0][0]},${H - padB} Z`;
  const todayIdx = series.length - 1;

  const axisLabels = labels.length >= 4
    ? [labels[0], labels[Math.floor(labels.length / 3)], labels[Math.floor(labels.length * 2 / 3)], 'today']
    : [...labels.slice(0, -1), 'today'];

  const totalRevenue = series.reduce((s, v) => s + v, 0);
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n);

  return (
    <section className="chart-section">
      <div className="section-head">
        <div>
          <span className="section-title">Revenue</span>
          <span className="section-sub">last {series.length} days · PKR {fmt(totalRevenue)}</span>
        </div>
        <div className="seg">
          {(['7d', '14d', '30d'] as const).map(r => (
            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <svg className="bigchart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rg)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke" />
        <circle cx={points[todayIdx][0]} cy={points[todayIdx][1]} r="10" fill="var(--accent)" opacity="0.18" />
        <circle cx={points[todayIdx][0]} cy={points[todayIdx][1]} r="3.5" fill="var(--accent)" />
      </svg>

      <div className="bigchart-axis">
        {axisLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </section>
  );
}
