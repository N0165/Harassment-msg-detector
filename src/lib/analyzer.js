// Demo analysis engine.
//
// IMPORTANT: this is a transparent, rule-based simulation. It matches hand-written
// patterns and applies a few context rules (negation, quoting, who the message is
// aimed at). It is NOT a trained machine-learning model, and every result it
// produces is labelled `source: 'demo'`. Replace it with a real model through
// src/lib/api.js (see the integration guide in the app).

export const MAX_CHARS = 1000;

export const CATEGORIES = [
  { id: 'abuse', label: 'Abusive language', color: '#C4B5FD', blurb: 'Insults and demeaning name-calling aimed at a person.' },
  { id: 'threat', label: 'Threat or intimidation', color: '#FB7185', blurb: 'Threats of harm, stalking cues and blackmail.' },
  { id: 'hate', label: 'Hate speech', color: '#E879F9', blurb: 'Hostility toward a person because of who they are.' },
  { id: 'sexual', label: 'Sexual harassment', color: '#5EEAD4', blurb: 'Unwanted sexual remarks, requests and pressure.' },
  { id: 'bullying', label: 'Cyberbullying', color: '#FDBA74', blurb: 'Exclusion, humiliation, pile-ons and encouragement of self-harm.' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const SEVERITY = {
  none: { id: 'none', label: 'None', rank: 0, color: '#34D399' },
  low: { id: 'low', label: 'Low', rank: 1, color: '#7DD3FC' },
  medium: { id: 'medium', label: 'Medium', rank: 2, color: '#FCD34D' },
  high: { id: 'high', label: 'High', rank: 3, color: '#FB923C' },
  critical: { id: 'critical', label: 'Critical', rank: 4, color: '#F43F5E' },
};

export const ENGINE = { type: 'demo', name: 'Aegis keyword-rules demo', version: '0.1' };

// ---------------------------------------------------------------------------
// Lexicon
// ---------------------------------------------------------------------------

const r = String.raw;
// Every apostrophe in a pattern also matches a curly apostrophe or no apostrophe.
const ap = (s) => s.replace(/'/g, "['’]?");

function def(cat, weight, patterns, opts = {}) {
  return patterns.map((p) => ({
    cat,
    weight,
    directed: Boolean(opts.directed), // already addresses the reader, so no "who is this aimed at" check
    critical: Boolean(opts.critical), // encourages self-harm
    re: new RegExp(ap(p), 'gi'),
  }));
}

export const LEXICON = [
  // --- Abusive language ----------------------------------------------------
  ...def('abuse', 0.75, [r`\b(?:fuck|screw) (?:you|u|off)\b`], { directed: true }),
  ...def('abuse', 0.72, [r`\bpiece of (?:garbage|trash|junk|shit)\b`], { directed: true }),
  ...def('abuse', 0.6, [r`\bdumb ?ass(?:es)?\b`, r`\bassholes?\b`, r`\bbitch(?:es)?\b`, r`\bbastards?\b`, r`\bscum(?:bag)?s?\b`]),
  ...def('abuse', 0.6, [r`\bgo to hell\b`], { directed: true }),
  ...def('abuse', 0.55, [r`\bidiot(?:s|ic)?\b`, r`\bmoron(?:s|ic)?\b`]),
  ...def('abuse', 0.5, [r`\bshut (?:up|your (?:mouth|face)|it)\b`, r`\bi hate (?:you|u)\b`], { directed: true }),
  ...def('abuse', 0.5, [r`\bbrain ?dead\b`, r`\bbrainless\b`, r`\bworthless\b`]),
  ...def('abuse', 0.45, [r`\bstupid(?:ity)?\b`, r`\bpathetic\b`, r`\blosers?\b`, r`\bugly\b`]),
  ...def('abuse', 0.4, [r`\bdumb\b`, r`\buseless\b`, r`\bdisgusting\b`, r`\bfreaks?\b`, r`\bcreeps?\b`]),
  ...def('abuse', 0.35, [r`\bfools?\b`, r`\bjerks?\b`]),
  ...def('abuse', 0.35, [r`\bwhat's wrong with you\b`], { directed: true }),
  ...def('abuse', 0.3, [r`\bclowns?\b`, r`\b(?:trash|garbage)\b`]),

  // --- Threats and intimidation -------------------------------------------
  ...def('threat', 0.92, [
    r`\b(?:i'll|i will|i'm going to|i'm gonna|gonna|going to|will|wanna|want to) (?:kill|murder|hurt|beat|destroy|ruin|strangle|stab|shoot) (?:you|u|ur)\b`,
  ], { directed: true }),
  ...def('threat', 0.9, [r`\b(?:kill|murder|stab|shoot|strangle) (?:you|u)\b`, r`\bi know where you (?:live|work|study|sleep)\b`], { directed: true }),
  ...def('threat', 0.88, [
    r`\b(?:i'll|i will|gonna|going to) (?:find|hunt|track) (?:you|u)(?: down)?\b`,
    r`\bbeat (?:you|u) up\b`,
    r`\bbreak your (?:face|legs|bones|neck|phone)\b`,
  ], { directed: true }),
  ...def('threat', 0.85, [
    r`\b(?:make|making) you suffer\b`,
    r`\b(?:you're|you are) dead\b`,
    r`\byou'll die\b|\byou will die\b`,
    r`\bburn (?:your|ur) (?:house|home|car)\b`,
    r`\b(?:i'll|i will|gonna|going to) (?:post|share|leak|expose|send|spread) (?:your|ur) (?:photos?|pics?|pictures?|nudes?|number|address|secrets?|videos?|screenshots?|chats?)(?: to (?:everyone|everybody|all))?`,
  ], { directed: true }),
  ...def('threat', 0.8, [r`\bwatch your back\b`], { directed: true }),
  ...def('threat', 0.75, [r`\byou'll regret\b|\byou will regret\b`], { directed: true }),
  ...def('threat', 0.7, [r`\byou'll pay\b|\byou will pay for\b`], { directed: true }),
  ...def('threat', 0.65, [r`\bteach you a lesson\b`], { directed: true }),
  ...def('threat', 0.35, [r`\bor else\b`]),

  // --- Hate speech ---------------------------------------------------------
  ...def('hate', 0.9, [r`\b(?:go|get) back to (?:your|ur) (?:country|village|homeland)\b`, r`\bgo back to where you came from\b`], { directed: true }),
  ...def('hate', 0.85, [
    r`\bpeople like you (?:don't|do not) belong(?: here)?\b`,
    r`\b(?:subhuman|vermin|inferior race|filthy animals?)\b`,
    r`\b(?:dirty|filthy|disgusting|stupid) (?:immigrants?|foreigners?|refugees?|muslims?|jews?|hindus?|christians?|blacks?|gays?|women|girls?)\b`,
    r`\b(?:all|those|these|most) (?:women|men|muslims|hindus|christians|jews|immigrants|foreigners|refugees|gays|lesbians|blacks|whites|asians|disabled people) (?:are|should)\b[^.!?\n]{0,40}?\b(?:stupid|dirty|evil|animals|inferior|trash|scum|disgusting|worthless|subhuman|vermin|go back|die|leave)\b`,
  ], { directed: true }),
  ...def('hate', 0.75, [r`\b(?:retarded|cripple[ds]?)\b`, r`\bwomen (?:belong|should stay) in (?:the )?kitchen\b`], { directed: true }),
  ...def('hate', 0.5, [r`\byou people\b`, r`\byour kind\b`], { directed: true }),

  // --- Sexual harassment ---------------------------------------------------
  ...def('sexual', 0.92, [r`\bsend (?:me )?(?:your )?(?:nudes?|nude (?:pics?|photos?)|naked pics?)\b`], { directed: true }),
  ...def('sexual', 0.88, [r`\bshow me your (?:body|boobs|chest|legs|butt)\b`, r`\bbet you're good in bed\b`], { directed: true }),
  ...def('sexual', 0.85, [r`\b(?:slut|whore)s?\b`], { directed: true }),
  ...def('sexual', 0.8, [r`\basking for it\b`], { directed: true }),
  ...def('sexual', 0.7, [r`\bsleep with me\b`, r`\bhook ?up with me\b`], { directed: true }),
  ...def('sexual', 0.65, [r`\b(?:nice|hot|sexy) (?:body|ass|figure)\b`]),
  ...def('sexual', 0.35, [r`\bwhat are you wearing\b`], { directed: true }),
  ...def('sexual', 0.3, [r`\bsexy\b`, r`\bnudes?\b`, r`\bnaked\b`]),

  // --- Cyberbullying -------------------------------------------------------
  ...def('bullying', 0.97, [r`\b(?:kill yourself|kys|go die|end yourself|hang yourself|off yourself)\b`], { directed: true, critical: true }),
  ...def('bullying', 0.93, [r`\bthe world (?:would be|is) better (?:off )?without you\b`], { directed: true, critical: true }),
  ...def('bullying', 0.9, [
    r`\byou should (?:just )?(?:die|disappear|vanish)\b`,
    r`\b(?:no ?one|nobody) (?:would|will) (?:even )?miss (?:you|u)\b`,
  ], { directed: true, critical: true }),
  ...def('bullying', 0.68, [r`\b(?:no ?one|nobody) (?:likes|wants|loves|cares about|needs) (?:you|u)\b`, r`\beveryone (?:hates|despises) (?:you|u)\b`], { directed: true }),
  ...def('bullying', 0.6, [
    r`\b(?:everyone|everybody|we all) (?:(?:is|are|was|were) )?(?:laughing|laughs|laughed) at (?:you|u)\b`,
    r`\byou don't belong (?:here|with us)\b`,
  ], { directed: true }),
  ...def('bullying', 0.55, [r`\bjust disappear\b`], { directed: true }),
  ...def('bullying', 0.5, [r`\b(?:attention seeker|attention whore|cry ?baby)\b`, r`\bdelete your (?:account|profile|page)\b`], { directed: true }),
  ...def('bullying', 0.45, [r`\bembarrassing yourself\b`], { directed: true }),
  ...def('bullying', 0.4, [r`\bget lost\b`, r`\bgo away\b`, r`\bleave us alone\b`], { directed: true }),
  ...def('bullying', 0.35, [r`\bnobody asked\b`], { directed: true }),
];

export const PATTERN_COUNT = LEXICON.length;

// ---------------------------------------------------------------------------
// Context rules
// ---------------------------------------------------------------------------

const SECOND_PERSON = /\b(?:you|youre|your|yours|yourself|u|ur|ya|yall)\b|@\w+/i;
const NEGATION = /\b(?:not|never|(?:do|does|is|are|was|were|wo|would|ca|could|should)n['’]?t|cannot|nor|hardly)\b/i;
const NOT_JOKING = /\b(?:not|never)\s+(?:joking|kidding|playing)\b/i;
const FIRST_PERSON = /\b(?:i|i['’]?m|im|am|myself|me)\b/i;
const REPORTED = /\b(?:called me|calls me|call me|told me|said|says|wrote|texted me|messaged me|accused me|quote|quoted|replied)\b/i;
const SARCASM = /\b(?:yeah right|sure,? genius|jk|just kidding|lol|lmao|haha)\b|\/s\b/i;

// How much a pattern is weakened when nothing in the message addresses a person.
const UNTARGETED = { abuse: 0.4, threat: 0.8, hate: 1, sexual: 0.6, bullying: 0.85 };

const BOUNDARY = /[.!?\n]/;

function sentenceBounds(text, start, end) {
  let s = start;
  while (s > 0 && !BOUNDARY.test(text[s - 1])) s--;
  let e = end;
  while (e < text.length && !BOUNDARY.test(text[e])) e++;
  return [s, e];
}

function clauseBefore(text, sentenceStart, matchStart) {
  const before = text.slice(sentenceStart, matchStart);
  const parts = before.split(/[,;:]|\bbut\b|\bhowever\b|\balthough\b/i);
  return parts[parts.length - 1].trim().split(/\s+/).slice(-5).join(' ');
}

function insideQuotes(text, start) {
  const prefix = text.slice(0, start);
  const straight = (prefix.match(/"/g) || []).length % 2 === 1;
  const curly = (prefix.match(/“/g) || []).length > (prefix.match(/”/g) || []).length;
  return straight || curly;
}

function collectCandidates(text) {
  const found = [];
  for (const entry of LEXICON) {
    for (const m of text.matchAll(entry.re)) {
      if (!m[0]) continue;
      found.push({ start: m.index, end: m.index + m[0].length, text: m[0], entry });
    }
  }
  // Prefer longer, stronger matches, then drop anything that overlaps a kept match.
  found.sort((a, b) => b.end - b.start - (a.end - a.start) || b.entry.weight - a.entry.weight);
  const kept = [];
  for (const c of found) {
    if (!kept.some((k) => c.start < k.end && c.end > k.start)) kept.push(c);
  }
  return kept.sort((a, b) => a.start - b.start);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const THRESHOLDS = [0.25, 0.45, 0.65, 0.88];

function severityFor(overall, catScores, hasCritical) {
  if (hasCritical && overall >= 0.6) return 'critical';
  if (catScores.threat >= 0.8) return 'critical';
  if (overall >= THRESHOLDS[3]) return 'critical';
  if (overall >= THRESHOLDS[2]) return 'high';
  if (overall >= THRESHOLDS[1]) return 'medium';
  if (overall >= THRESHOLDS[0]) return 'low';
  return 'none';
}

function confidenceFor(overall, active, wordCount, sarcasm) {
  let c;
  if (active.length === 0) {
    c = wordCount < 4 ? 0.7 : wordCount < 8 ? 0.84 : 0.91;
  } else {
    const margin = Math.min(...THRESHOLDS.map((t) => Math.abs(overall - t)));
    const cats = new Set(active.map((m) => m.category)).size;
    c = 0.6 + 0.28 * Math.min(1, margin / 0.1) + 0.07 * Math.min(1, (active.length - 1) / 2) + (cats > 1 ? 0.03 : 0);
  }
  if (sarcasm) c -= 0.08;
  return Math.max(0.5, Math.min(0.97, c));
}

const ACTIONS = {
  none: 'No action needed. The message can stay visible.',
  low: 'Log it and keep an eye on this conversation. A gentle reminder of the community guidelines may be enough.',
  medium: 'Send to a human moderator and consider warning the sender.',
  high: 'Hide the message and escalate it to a moderator for review.',
  critical:
    'Hide the message now, escalate to a moderator and keep a copy as evidence. If someone may be in danger, contact local emergency services.',
};

const VERDICT = {
  none: { id: 'safe', label: 'No harassment detected' },
  low: { id: 'review', label: 'Possibly offensive' },
  medium: { id: 'flagged', label: 'Harassment likely' },
  high: { id: 'flagged', label: 'Harassment detected' },
  critical: { id: 'flagged', label: 'Severe harassment detected' },
};

export function analyzeDemo(input) {
  const text = String(input ?? '').slice(0, MAX_CHARS);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const messageHasSecond = SECOND_PERSON.test(text);
  const signals = new Set();
  const matches = [];

  for (const c of collectCandidates(text)) {
    const { entry } = c;
    const [sStart, sEnd] = sentenceBounds(text, c.start, c.end);
    const sentence = text.slice(sStart, sEnd);
    const clause = clauseBefore(text, sStart, c.start);
    const term = c.text.trim();
    let w = entry.weight;
    const notes = [];

    const sentenceHasSecond = SECOND_PERSON.test(sentence);
    if (sentenceHasSecond) {
      w *= 1.12;
    } else if (!entry.directed) {
      w *= messageHasSecond ? 1 - (1 - UNTARGETED[entry.cat]) * 0.5 : UNTARGETED[entry.cat];
      if (!messageHasSecond) {
        notes.push('Not aimed at a person');
        signals.add(`“${term}” is not aimed at a person, so its weight was reduced`);
      }
    }

    if (NEGATION.test(clause) && !NOT_JOKING.test(clause)) {
      w *= 0.15;
      notes.push('Negated');
      signals.add(`Negation near “${term}” reduced its weight`);
    }
    if (entry.cat !== 'threat' && FIRST_PERSON.test(clause) && !sentenceHasSecond) {
      w *= 0.2;
      notes.push('Self-directed');
      signals.add(`“${term}” reads as self-directed`);
    }
    if (REPORTED.test(sentence.slice(0, c.start - sStart)) || insideQuotes(text, c.start)) {
      w *= 0.45;
      notes.push('Quoted or reported');
      signals.add(`“${term}” looks like quoted or reported language`);
    }
    if (entry.critical) signals.add('Contains a phrase that encourages self-harm');

    w = Math.min(0.99, w);
    matches.push({
      start: c.start,
      end: c.end,
      text: c.text,
      category: entry.cat,
      weight: entry.weight,
      effective: w,
      critical: entry.critical,
      dim: w < 0.2,
      notes,
    });
  }

  // Category scores use a noisy-OR: independent evidence adds up but never exceeds 1.
  const catScores = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  for (const c of CATEGORIES) {
    const prod = matches.filter((m) => m.category === c.id).reduce((p, m) => p * (1 - m.effective), 1);
    catScores[c.id] = 1 - prod;
  }
  const ranked = CATEGORIES.map((c) => ({ id: c.id, label: c.label, score: catScores[c.id] })).sort((a, b) => b.score - a.score);

  let overall = ranked.reduce((p, c, i) => p * (1 - (i === 0 ? c.score : c.score * 0.5)), 1);
  overall = 1 - overall;

  const letters = text.replace(/[^A-Za-z]/g, '');
  const shouting = letters.length >= 8 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.6;
  const emphatic = /[!?]{2,}/.test(text);
  if (overall >= 0.3 && (shouting || emphatic)) {
    overall = Math.min(0.99, overall + (shouting ? 0.04 : 0) + (emphatic ? 0.02 : 0));
    signals.add('Capital letters or repeated punctuation added emphasis');
  }

  const active = matches.filter((m) => m.effective >= 0.1);
  if (active.some((m) => SECOND_PERSON.test(text.slice(...sentenceBounds(text, m.start, m.end))))) {
    signals.add('Language is aimed at a person (“you”, “your” or an @mention)');
  }
  if (new Set(active.map((m) => m.category)).size > 1) signals.add('More than one harassment category appears together');
  const sarcasm = SARCASM.test(text);
  if (sarcasm) signals.add('Possible joking or sarcasm: this engine cannot judge tone');
  if (words > 0 && words < 4) signals.add('Very short message, so there is little context to work with');

  const hasCritical = active.some((m) => m.critical && m.effective >= 0.5);
  const severity = severityFor(overall, catScores, hasCritical);
  const flagged = severity !== 'none';
  const confidence = confidenceFor(overall, active, words, sarcasm);
  let action = ACTIONS[severity];
  if (hasCritical) action += ' Consider sharing support resources with the person it was sent to.';

  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    source: 'demo',
    engine: ENGINE,
    text,
    verdict: VERDICT[severity].id,
    verdictLabel: VERDICT[severity].label,
    overall,
    confidence,
    severity,
    primaryCategory: flagged && ranked[0].score > 0 ? ranked[0].id : null,
    categories: ranked,
    matches,
    signals: [...signals],
    action,
  };
}

// Split text into plain and highlighted segments for rendering.
export function buildSegments(text, matches) {
  const segments = [];
  let cursor = 0;
  for (const m of [...matches].sort((a, b) => a.start - b.start)) {
    if (m.start < cursor) continue;
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start), match: null });
    segments.push({ text: text.slice(m.start, m.end), match: m });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: null });
  return segments;
}
