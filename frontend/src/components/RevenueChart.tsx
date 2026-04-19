interface Props {
  rev14: number[];
  chartLabels: string[];
  range: string;
  setRange: (r: string) => void;
}

export default function RevenueChart({ rev14, chartLabels, range, setRange }: Props) {
  const series = rev14;
  if (series.length < 2) return null;

  const W = 800, H = 180, padT = 10, padB = 10, padL = 0, padR = 0;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = Math.max(...series), min = 0;
  const stepX = innerW / (series.length - 1);
  const points = series.map((v, i) => [
    padL + i * stepX,
    padT + innerH - ((v - min) / (max - min || 1)) * innerH,
  ]);
  const d = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');
  const area = d + ` L${points[points.length - 1][0]},${H - padB} L${points[0][0]},${H - padB} Z`;
  const todayIdx = series.length - 1;

  const labels = chartLabels.length >= 4
    ? [chartLabels[0], chartLabels[Math.floor(chartLabels.length / 3)], chartLabels[Math.floor(chartLabels.length * 2 / 3)], 'today']
    : [...chartLabels.slice(0, -1), 'today'];

  return (
    <section className="chart-section">
      <div className="section-head">
        <div>
          <span className="section-title">Revenue</span>
          <span className="section-sub">last {series.length} days</span>
        </div>
        <div className="seg">
          {['7d', '14d', '30d'].map(r => (
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
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </section>
  );
}
