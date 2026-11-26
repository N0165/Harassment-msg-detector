// Entry point the UI uses to analyse a message.
//
// Without a model endpoint, every result comes from the rule-based demo engine and
// is labelled `source: 'demo'`. If you set VITE_ANALYZE_API_URL, the app sends the
// text to your model instead and labels the result `source: 'model'`.
//
// Expected contract (see the integration guide inside the app):
//   POST { "text": "..." }
//   -> { "category": "threat", "confidence": 0.93, "severity": "high",
//        "spans": [{ "start": 0, "end": 19, "category": "threat" }] }

import { analyzeDemo, CATEGORIES, CATEGORY_BY_ID, SEVERITY } from './analyzer.js';

const ENDPOINT = (import.meta.env && import.meta.env.VITE_ANALYZE_API_URL) || '';

export const modelConnected = Boolean(ENDPOINT);

const VERDICTS = {
  none: { id: 'safe', label: 'No harassment detected' },
  low: { id: 'review', label: 'Possibly offensive' },
  medium: { id: 'flagged', label: 'Harassment likely' },
  high: { id: 'flagged', label: 'Harassment detected' },
  critical: { id: 'flagged', label: 'Severe harassment detected' },
};

function normalizeModelResponse(text, data) {
  const category = CATEGORY_BY_ID[data.category] ? data.category : null;
  const confidence = Math.max(0, Math.min(1, Number(data.confidence) || 0));
  const severity = SEVERITY[data.severity] ? data.severity : category ? 'medium' : 'none';
  const spans = Array.isArray(data.spans) ? data.spans : [];

  const matches = spans
    .filter((s) => Number.isInteger(s.start) && Number.isInteger(s.end) && s.end > s.start && s.end <= text.length)
    .map((s) => ({
      start: s.start,
      end: s.end,
      text: text.slice(s.start, s.end),
      category: CATEGORY_BY_ID[s.category] ? s.category : category || 'abuse',
      weight: confidence,
      effective: confidence,
      critical: false,
      dim: false,
      notes: [],
    }));

  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    score: c.id === category ? confidence : 0,
  })).sort((a, b) => b.score - a.score);

  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    source: 'model',
    engine: { type: 'model', name: 'Connected model endpoint', version: '' },
    text,
    verdict: VERDICTS[severity].id,
    verdictLabel: VERDICTS[severity].label,
    overall: category ? confidence : 0,
    confidence,
    severity,
    primaryCategory: severity === 'none' ? null : category,
    categories,
    matches,
    signals: ['Prediction returned by your model endpoint'],
    action: MODEL_ACTIONS[severity],
  };
}

const MODEL_ACTIONS = {
  none: 'No action needed. The message can stay visible.',
  low: 'Log it and keep an eye on this conversation.',
  medium: 'Send to a human moderator and consider warning the sender.',
  high: 'Hide the message and escalate it to a moderator for review.',
  critical: 'Hide the message now and escalate to a moderator. If someone may be in danger, contact local emergency services.',
};

export async function analyzeMessage(text) {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Endpoint answered ${res.status}`);
      return normalizeModelResponse(text, await res.json());
    } catch (err) {
      const fallback = analyzeDemo(text);
      fallback.signals.unshift(`Your model endpoint could not be reached (${err.message}), so this is a demo result`);
      return fallback;
    }
  }
  return analyzeDemo(text);
}
