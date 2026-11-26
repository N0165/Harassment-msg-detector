import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CloseIcon, CopyIcon } from './icons.jsx';
import { copyText } from '../lib/clipboard.js';

const CONTRACT = `POST  <your endpoint>
Content-Type: application/json

{ "text": "message to analyze" }

200 OK
{
  "category": "threat",
  "confidence": 0.93,
  "severity": "high",
  "spans": [{ "start": 0, "end": 19, "category": "threat" }]
}

category: abuse | threat | hate | sexual | bullying | none
severity: none | low | medium | high | critical
confidence: a number from 0 to 1`;

const ENV = 'VITE_ANALYZE_API_URL=http://localhost:8000/analyze';

function CodeBlock({ label, code }) {
  const [done, setDone] = useState(false);
  return (
    <div className="code">
      <div className="code-head">
        <span>{label}</span>
        <button
          type="button"
          className="link-btn"
          onClick={async () => {
            await copyText(code);
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          }}
        >
          {done ? <CheckIcon size={16} /> : <CopyIcon size={16} />} {done ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Modal({ open, onClose }) {
  const dialog = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll('button, [href], summary, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialog}>
        <div className="modal-head">
          <h2 id="modal-title">Demo results and real predictions</h2>
          <button type="button" className="icon-btn" ref={closeBtn} onClick={onClose} aria-label="Close dialog">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Every result in this app carries a label. <span className="badge demo">Demo result</span> means a keyword
            rule produced it. <span className="badge model">Model prediction</span> appears only when a model endpoint
            you control answered the request.
          </p>

          <h3>Connect your own model</h3>
          <ol className="plain">
            <li>
              Host a model behind an HTTP endpoint (for example FastAPI or Flask serving a fine-tuned BERT classifier).
            </li>
            <li>
              Create a file named <code>.env</code> in the project root with the line below, then restart{' '}
              <code>npm run dev</code>.
            </li>
          </ol>
          <CodeBlock label=".env" code={ENV} />
          <ol className="plain" start={3}>
            <li>The endpoint receives and returns JSON in this shape. Enable CORS for the app's origin.</li>
          </ol>
          <CodeBlock label="Request and response" code={CONTRACT} />
          <p className="fine">
            If the endpoint cannot be reached, the app falls back to the demo engine and says so in the result.
          </p>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
