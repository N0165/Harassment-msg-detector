import assert from 'node:assert/strict';
import { analyzeDemo, buildSegments, PATTERN_COUNT } from '../src/lib/analyzer.js';
import { SAMPLES } from '../src/lib/samples.js';

const byId = Object.fromEntries(SAMPLES.map((s) => [s.id, analyzeDemo(s.text)]));
const show = (id) => {
  const r = byId[id];
  console.log(`${id.padEnd(11)} ${r.severity.padEnd(8)} overall=${r.overall.toFixed(2)} conf=${Math.round(r.confidence * 100)}% cat=${r.primaryCategory}`);
};
SAMPLES.forEach((s) => show(s.id));

assert.equal(byId.kind.severity, 'none', 'friendly feedback should be safe');
assert.ok(['high', 'critical'].includes(byId.insult.severity), 'insults should be high or critical');
assert.equal(byId.threat.severity, 'critical');
assert.equal(byId.threat.primaryCategory, 'threat');
assert.equal(byId.hate.primaryCategory, 'hate');
assert.equal(byId.sexual.severity, 'critical');
assert.equal(byId.pileon.severity, 'critical');
assert.equal(byId.pileon.primaryCategory, 'bullying');
assert.equal(byId.negation.severity, 'none', 'negated insult should not be flagged');
assert.equal(byId.untargeted.severity, 'none', 'insult not aimed at a person should not be flagged');
assert.ok(['medium', 'high', 'critical'].includes(byId.caps.severity));

// Empty / edge input
const empty = analyzeDemo('   ');
assert.equal(empty.severity, 'none');
assert.equal(empty.matches.length, 0);

// Segments rebuild the original text exactly
for (const s of SAMPLES) {
  const r = byId[s.id];
  assert.equal(buildSegments(r.text, r.matches).map((x) => x.text).join(''), r.text);
}

// Confidence stays in range
for (const r of Object.values(byId)) assert.ok(r.confidence >= 0.5 && r.confidence <= 0.97);

console.log(`\nAll analyzer checks passed (${PATTERN_COUNT} patterns).`);
