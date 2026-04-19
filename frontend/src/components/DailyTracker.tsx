import type { DailyBreakdown } from '../types';

const fmt = (n: number) => Math.round(n).toLocaleString();

interface Props {
  data: DailyBreakdown[];
  todayDate: string;
}

export default function DailyTracker({ data, todayDate }: Props) {
  if (data.length === 0) return null;

  return (
    <section className="daily-section">
      <div className="section-head">
        <div>
          <span className="section-title">Daily breakdown</span>
          <span className="section-sub">{data.length} days · newest first</span>
        </div>
      </div>

      <div className="daily-header">
        <span>Day</span>
        <span>Orders</span>
        <span>Revenue</span>
        <span>Profit</span>
        <span>Per person</span>
      </div>

      {data.map(d => {
        const isToday = d.date === todayDate;
        return (
          <div key={d.date} className={`daily-row${isToday ? ' daily-today' : ''}${d.isBest ? ' daily-best' : ''}`}>
            <span className="daily-date">
              {d.label}
              {isToday && <span className="daily-badge today-badge">today</span>}
              {d.isBest && !isToday && <span className="daily-badge best-badge">best</span>}
            </span>
            <span className="daily-count num">
              {d.count}
              {d.unpaidCount > 0 && <span className="daily-unpaid">{d.unpaidCount} unpaid</span>}
            </span>
            <span className="daily-revenue num">{fmt(d.revenue)}</span>
            <span className="daily-profit num">{fmt(d.profit)}</span>
            <span className="daily-pp num">{fmt(d.perPerson)}</span>
          </div>
        );
      })}
    </section>
  );
}
