import { buildSegments, CATEGORIES, CATEGORY_BY_ID, SEVERITY } from '../lib/analyzer.js';
import { pct, tint } from '../lib/utils.js';
import { AlertIcon, CheckIcon, CopyIcon, DownloadIcon, InfoIcon, PlayIcon, TrashIcon } from './icons.jsx';

function Pill({ id }) {
  const c = CATEGORY_BY_ID[id];
  return (
    <span className="pill" style={{ '--c': c.color }}>
      <i aria-hidden="true" />
      {c.label}
    </span>
  );
}

function ConfidenceRing({ value, source }) {
  const label = source === 'model' ? 'Model confidence' : 'Demo confidence';
  return (
    <div className="ring" role="img" aria-label={`${label}: ${pct(value)} percent`}>
      <svg viewBox="0 0 100 100" width="104" height="104" aria-hidden="true">
        <circle className="ring-bg" cx="50" cy="50" r="42" pathLength="100" />
        <circle className="ring-fg" cx="50" cy="50" r="42" pathLength="100" style={{ '--pct': pct(value) }} />
      </svg>
      <div className="ring-num">
        <strong>{pct(value)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function SeverityMeter({ level }) {
  const order = ['low', 'medium', 'high', 'critical'];
  const rank = SEVERITY[level].rank;
  return (
    <div className="sev">
      <div className="sev-head">
        <span>Severity</span>
        <strong style={{ color: SEVERITY[level].color }}>{SEVERITY[level].label}</strong>
      </div>
      <div className="sev-bar" role="img" aria-label={`Severity level: ${SEVERITY[level].label}`}>
        {order.map((k, i) => (
          <span key={k} className={rank > i ? 'seg on' : 'seg'} style={{ '--c': SEVERITY[k].color, '--i': i }} />
        ))}
      </div>
      <div className="sev-labels" aria-hidden="true">
        {order.map((k) => (
          <span key={k} className={level === k ? 'cur' : ''}>
            {SEVERITY[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Highlighted({ result }) {
  const segments = buildSegments(result.text, result.matches);
  return (
    <p className="msg">
      {segments.map((s, i) => {
        if (!s.match) return <span key={i}>{s.text}</span>;
        const cat = CATEGORY_BY_ID[s.match.category];
        const tip = `${cat.label}${s.match.dim ? ' (weight reduced by context)' : ''}`;
        return (
          <mark
            key={i}
            className={`hl${s.match.dim ? ' dim' : ''}`}
            style={{ '--c': cat.color, '--cbg': tint(cat.color, 0.2) }}
            title={tip}
            tabIndex={0}
          >
            {s.text}
          </mark>
        );
      })}
    </p>
  );
}

function SourceBanner({ source, onGuide }) {
  if (source === 'model') {
    return (
      <div className="banner model">
        <CheckIcon size={18} />
        <p>
          <strong>Model prediction.</strong> This result came from your connected model endpoint.
        </p>
      </div>
    );
  }
  return (
    <div className="banner demo">
      <InfoIcon size={18} />
      <p>
        <strong>Demo result.</strong> Produced by keyword rules, not a trained AI model. Do not use it to judge real
        people.{' '}
        <button type="button" className="link" onClick={onGuide}>
          See the difference
        </button>
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="sk sk-wide" />
      <div className="sk sk-mid" />
      <div className="sk sk-block" />
      <div className="sk sk-wide" />
      <div className="sk sk-mid" />
    </div>
  );
}

function Empty({ onSample }) {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h3>Results appear here</h3>
      <p className="muted">
        You will see the verdict, category, severity, a confidence score and the exact words that triggered it.
      </p>
      <button type="button" className="btn soft" onClick={onSample}>
        <PlayIcon size={18} /> Try a sample message
      </button>
    </div>
  );
}

export default function ResultPanel({ result, busy, onClear, onSample, onCopy, onDownload, onGuide, copied, panelRef }) {
  const flaggedTerms = result ? result.matches.filter((m) => m.effective >= 0.1) : [];
  const shownCategories = result ? result.categories : CATEGORIES;
  const flagged = result && result.severity !== 'none';

  return (
    <section className="panel results" ref={panelRef} aria-labelledby="res-title" aria-busy={busy}>
      <div className="panel-head">
        <h2 id="res-title">Detection results</h2>
      </div>

      <p className="sr" role="status">
        {result && !busy ? `${result.verdictLabel}. Severity ${SEVERITY[result.severity].label}. Confidence ${pct(result.confidence)} percent.` : ''}
      </p>

      {busy ? (
        <Skeleton />
      ) : !result ? (
        <Empty onSample={onSample} />
      ) : (
        <div className="result" key={result.id}>
          <SourceBanner source={result.source} onGuide={onGuide} />

          <div className="verdict r" style={{ '--i': 0 }}>
            <div className="verdict-text">
              <span className={`verdict-icon ${flagged ? 'bad' : 'good'}`} aria-hidden="true">
                {flagged ? <AlertIcon size={22} /> : <CheckIcon size={22} />}
              </span>
              <div>
                <h3>{result.verdictLabel}</h3>
                <div className="pill-row">
                  {result.primaryCategory ? (
                    result.categories
                      .filter((c) => c.score >= 0.25)
                      .map((c) => <Pill key={c.id} id={c.id} />)
                  ) : (
                    <span className="muted">No harassment category matched</span>
                  )}
                </div>
              </div>
            </div>
            <ConfidenceRing value={result.confidence} source={result.source} />
          </div>

          <div className="r" style={{ '--i': 1 }}>
            <SeverityMeter level={result.severity} />
          </div>

          <div className="r block" style={{ '--i': 2 }}>
            <h4>Message with flagged words highlighted</h4>
            <Highlighted result={result} />
            {result.matches.length === 0 && <p className="fine">No harmful words or phrases were found.</p>}
          </div>

          <div className="r block" style={{ '--i': 3 }}>
            <h4>Category breakdown</h4>
            <ul className="bars">
              {shownCategories.map((c) => (
                <li key={c.id} className={c.score < 0.05 ? 'quiet' : ''}>
                  <span className="bar-label">{c.label}</span>
                  <span className="bar-track" aria-hidden="true">
                    <span
                      className="bar-fill"
                      style={{ width: `${Math.max(2, pct(c.score))}%`, background: CATEGORY_BY_ID[c.id].color }}
                    />
                  </span>
                  <span className="bar-val">{pct(c.score)}%</span>
                </li>
              ))}
            </ul>
          </div>

          {(flaggedTerms.length > 0 || result.signals.length > 0) && (
            <div className="r block two" style={{ '--i': 4 }}>
              {flaggedTerms.length > 0 && (
                <div>
                  <h4>Flagged terms</h4>
                  <ul className="terms">
                    {flaggedTerms.map((m, i) => (
                      <li key={`${m.start}-${i}`}>
                        <span className="term" style={{ '--c': CATEGORY_BY_ID[m.category].color }}>
                          {m.text.trim()}
                        </span>
                        <span className="muted">{CATEGORY_BY_ID[m.category].label}</span>
                        <span className="weight" title="Weight after context rules">
                          {pct(m.effective)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.signals.length > 0 && (
                <div>
                  <h4>Why this result</h4>
                  <ul className="signals">
                    {result.signals.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="r action" style={{ '--i': 5 }}>
            <strong>Suggested next step</strong>
            <p>{result.action}</p>
          </div>

          <details className="r how-calc" style={{ '--i': 6 }}>
            <summary>How are severity and confidence calculated?</summary>
            {result.source === 'demo' ? (
              <p>
                Each matched pattern has a weight. Context rules lower it when the word is negated, quoted, aimed at
                no one, or self-directed. Weights combine so that more evidence raises the score, and fixed thresholds
                turn the score into a severity level. The confidence value is a heuristic: it is higher when the score
                sits far from a threshold and when several signals agree. It is not a statistical probability.
              </p>
            ) : (
              <p>Severity and confidence are taken directly from your model endpoint's response.</p>
            )}
          </details>

          <div className="r result-actions" style={{ '--i': 7 }}>
            <button type="button" className="btn soft" onClick={onCopy}>
              {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />} {copied ? 'Copied' : 'Copy report'}
            </button>
            <button type="button" className="btn soft" onClick={onDownload}>
              <DownloadIcon size={18} /> Download JSON
            </button>
            <button type="button" className="btn ghost" onClick={onClear}>
              <TrashIcon size={18} /> Clear
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
