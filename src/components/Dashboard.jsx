import { CATEGORIES, CATEGORY_BY_ID, SEVERITY } from '../lib/analyzer.js';
import { formatTime, pct, truncate } from '../lib/utils.js';
import { LayersIcon, TrashIcon } from './icons.jsx';

export function StatStrip({ history }) {
  const total = history.length;
  const flagged = history.filter((h) => h.severity !== 'none');
  const avg = total ? history.reduce((s, h) => s + h.confidence, 0) / total : null;

  const counts = {};
  flagged.forEach((h) => h.primaryCategory && (counts[h.primaryCategory] = (counts[h.primaryCategory] || 0) + 1));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: 'Messages analyzed', value: total, note: 'this session' },
    {
      label: 'Flagged',
      value: flagged.length,
      note: total ? `${pct(flagged.length / total)}% of messages` : 'none yet',
    },
    { label: 'Average confidence', value: avg === null ? '–' : `${pct(avg)}%`, note: 'demo heuristic' },
    {
      label: 'Most common category',
      value: top ? CATEGORY_BY_ID[top[0]].label : '–',
      note: top ? `${top[1]} flagged` : 'none yet',
      small: true,
    },
  ];

  return (
    <dl className="stat-strip" aria-label="Session statistics">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <dt>{s.label}</dt>
          <dd className={s.small ? 'small' : ''}>{s.value}</dd>
          <span className="muted">{s.note}</span>
        </div>
      ))}
    </dl>
  );
}

function CategoryChart({ history }) {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  history.forEach((h) => h.severity !== 'none' && h.primaryCategory && counts[h.primaryCategory]++);
  const max = Math.max(1, ...Object.values(counts));
  const rows = CATEGORIES.map((c) => ({ ...c, n: counts[c.id] })).sort((a, b) => b.n - a.n);

  return (
    <section className="panel" aria-labelledby="cat-title">
      <h3 id="cat-title">Flagged by category</h3>
      <ul className="bars tall">
        {rows.map((c) => (
          <li key={c.id} className={c.n === 0 ? 'quiet' : ''}>
            <span className="bar-label">{c.label}</span>
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ width: `${(c.n / max) * 100}%`, background: c.color, minWidth: c.n ? 6 : 0 }} />
            </span>
            <span className="bar-val">{c.n}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeverityChart({ history }) {
  const levels = ['none', 'low', 'medium', 'high', 'critical'];
  const counts = Object.fromEntries(levels.map((l) => [l, history.filter((h) => h.severity === l).length]));
  const total = history.length;

  return (
    <section className="panel" aria-labelledby="sev-title">
      <h3 id="sev-title">Severity mix</h3>
      {total === 0 ? (
        <p className="muted">Severity counts appear after your first analysis.</p>
      ) : (
        <div className="stack" role="img" aria-label={levels.map((l) => `${SEVERITY[l].label} ${counts[l]}`).join(', ')}>
          {levels.map(
            (l) =>
              counts[l] > 0 && (
                <span key={l} style={{ flexGrow: counts[l], background: SEVERITY[l].color }} title={`${SEVERITY[l].label}: ${counts[l]}`} />
              )
          )}
        </div>
      )}
      <ul className="legend">
        {levels.map((l) => (
          <li key={l}>
            <i style={{ background: SEVERITY[l].color }} aria-hidden="true" />
            <span>{SEVERITY[l].label}</span>
            <strong>{counts[l]}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentList({ history, onOpen, onLoadSamples }) {
  const items = history.slice(0, 6);
  return (
    <section className="panel recent" aria-labelledby="recent-title">
      <h3 id="recent-title">Recent analyses</h3>
      {items.length === 0 ? (
        <div className="empty small">
          <p className="muted">Nothing analyzed yet. Run a message, or fill the dashboard with the sample set.</p>
          <button type="button" className="btn soft" onClick={onLoadSamples}>
            <LayersIcon size={18} /> Analyze all samples
          </button>
        </div>
      ) : (
        <ul className="recent-list">
          {items.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => onOpen(h)} aria-label={`Open analysis: ${truncate(h.text, 40)}`}>
                <i className="sev-dot" style={{ background: SEVERITY[h.severity].color }} aria-hidden="true" />
                <span className="recent-text">{truncate(h.text, 58)}</span>
                <span className="recent-meta">
                  {SEVERITY[h.severity].label}
                  <small>{formatTime(h.timestamp)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Insights({ history, onOpen, onLoadSamples }) {
  return (
    <div className="insights">
      <CategoryChart history={history} />
      <SeverityChart history={history} />
      <RecentList history={history} onOpen={onOpen} onLoadSamples={onLoadSamples} />
    </div>
  );
}

export function DashboardActions({ hasHistory, onLoadSamples, onClearHistory }) {
  return (
    <div className="dash-actions">
      <button type="button" className="btn soft" onClick={onLoadSamples}>
        <LayersIcon size={18} /> Analyze all samples
      </button>
      <button type="button" className="btn ghost" onClick={onClearHistory} disabled={!hasHistory}>
        <TrashIcon size={18} /> Clear history
      </button>
    </div>
  );
}
