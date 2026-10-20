// Builds the PowerFab wiki (docs/powerfab/) from raw replies saved by probe.mjs.
//
//   node tools/powerfab-wiki/build.mjs <raw dir> [more raw dirs]
//
// Prose (purpose, gotchas, groups) lives in meta.mjs. Field tables, results and samples come from
// the replies, so rerunning probe.mjs + build.mjs refreshes the wiki. It also writes calls.json:
// every request that was sent, so probe.mjs can repeat the run. A record marked fromSample was
// rebuilt from an earlier trimmed sample, for a reply the API user can no longer get.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groups, commands, readme, writeNotes } from './meta.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const docs = path.join(repo, 'docs', 'powerfab');
const samplesDir = path.join(docs, 'samples');
const rawDirs = process.argv.slice(2);
if (!rawDirs.length) { console.error('usage: node build.mjs <raw dir> [more raw dirs]'); process.exit(1); }

// ---- command table (same source as the service) ----
const cs = fs.readFileSync(path.join(repo, 'src', 'TeklaConversionLayer', 'PowerFabCommands.cs'), 'utf8');
const allNames = cs.match(/const string Names = """([\s\S]*?)""";/)[1].split(/\s+/).filter(Boolean).sort();
const extraReads = [...cs.match(/ExtraReads =\s*\[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
const isRead = n => n.startsWith('Get') || n.endsWith('_Get') || extraReads.includes(n);

// ---- raw replies ----
const records = rawDirs.flatMap(dir => fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))))
  .sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(path.join(here, 'calls.json'),
  JSON.stringify(records.filter(r => !r.fromSample).map(r => ({ id: r.id, command: r.command, body: r.body })), null, 1) + '\n');

// Envelope fields PowerFab repeats on many replies; documented once in the README.
const COMMON = ['InputDisplayUnits', 'FilterSet', 'PRJFilterSet', 'HoldSettings', 'FieldSettings'];
const ENVELOPE = new Set(['Successful', 'CommandGUID', 'LastLogID', 'GetOptions', 'JobNumber', 'ProductionControlID', 'JobGroups', ...COMMON]);
const isCommonPath = p => p.split('.').some((seg, i, a) => i < a.length - 1 && COMMON.includes(seg.replace('[]', '')));

// People's names, phone numbers and street addresses are masked in what goes into the repo.
const PRIVATE_KEYS = new Set(['Phone', 'Fax', 'Email', 'Address1', 'Address2', 'Attn', 'Username', 'FirstName', 'LastName']);
function sanitize(node, p = '') {
  if (Array.isArray(node)) return node.map(x => sanitize(x, p));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      const masked = typeof v === 'string' && v !== '' && (PRIVATE_KEYS.has(k) || (k === 'Name' && /Contact/.test(p)));
      out[k] = masked ? '<redacted>' : sanitize(v, p + '.' + k);
    }
    return out;
  }
  return node;
}

function trim(node, keep, maxStr = 100) {
  if (Array.isArray(node)) {
    const kept = node.slice(0, keep).map(x => trim(x, keep, maxStr));
    if (node.length > keep) kept.push(`… ${node.length - keep} more`);
    return kept;
  }
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, trim(v, keep, maxStr)]));
  if (typeof node === 'string' && node.length > maxStr) return node.slice(0, maxStr) + '…';
  return node;
}

// The reply minus its envelope. A command keeps the block it is named after (HoldSettings_Get keeps HoldSettings).
function contentOf(resp, command = '') {
  if (!resp || typeof resp !== 'object') return {};
  const r = resp.ResultData && typeof resp.ResultData === 'object' ? resp.ResultData : resp;
  return Object.fromEntries(Object.entries(r).filter(([k]) => !ENVELOPE.has(k) || command.startsWith(k)));
}
const hasValue = n => Array.isArray(n) ? n.some(hasValue) : n && typeof n === 'object' ? Object.values(n).some(hasValue) : n !== '' && n != null;
// A Val* command's answer is the success itself, so a bare reply still counts as data.
const isEmpty = rec => !rec.command.startsWith('Val') && !hasValue(contentOf(rec.response, rec.command));
// Best attempt: the fullest successful reply. Else "Permission denied", which PowerFab only says once the
// request itself is valid, else the failure with the most fields sent (the furthest we got).
const score = rec => rec.status === 200 ? 1e9 + JSON.stringify(contentOf(rec.response, rec.command)).length
  : (/Permission denied/.test(rec.response?.detail ?? '') ? 1e6 : 0) + JSON.stringify(rec.body).length;

// ---- field table ----
function fields(resp) {
  const stats = new Map();
  (function walk(node, p) {
    const kind = Array.isArray(node) ? 'list' : node && typeof node === 'object' ? 'object' : 'text';
    let s = stats.get(p);
    if (!s) stats.set(p, s = { kinds: new Set(), n: 0, ex: [], lens: [] });
    s.kinds.add(kind); s.n++;
    if (kind === 'list') { s.lens.push(node.length); node.forEach(x => walk(x, p + '[]')); }
    else if (kind === 'object') for (const [k, v] of Object.entries(node)) walk(v, p ? `${p}.${k}` : k);
    else if (s.ex.length < 2 && node !== '' && !s.ex.includes(node)) s.ex.push(node);
  })(resp, '');
  const rows = [];
  for (const [p, s] of stats) {
    if (!p || p === 'Successful' || p === 'CommandGUID' || isCommonPath(p)) continue;
    // "X[]" is the item of list X. Object items are described by their own fields, and text items
    // by X's row, so the item row itself is skipped.
    const base = p.replace(/\[\]$/, '');
    if (p.endsWith('[]')) continue;
    const items = stats.get(p + '[]');
    let type = [...s.kinds].join(' or ');
    if (s.kinds.has('list') && s.kinds.size === 1) type = `list (${Math.min(...s.lens)}–${Math.max(...s.lens)})${items?.kinds.has('text') ? ' of text' : ''}`;
    if (s.kinds.has('object') && s.kinds.has('list')) type = 'object or list';
    if (s.kinds.has('text') && s.kinds.has('list')) type = 'text or list';
    if (s.kinds.has('text') && s.ex.length && s.ex.every(v => /^-?\d+(\.\d+)?$/.test(v))) type = 'number (as text)';
    const shown = COMMON.includes(base.split('.').pop()) ? 'common block, see README' :
      (s.ex.length ? s.ex : items?.ex ?? []).map(v => '`' + String(sanitizeValue(p, v)).slice(0, 40).replace(/\|/g, '\\|').replace(/\n/g, '⏎') + '`').join(', ');
    rows.push(`| \`${base}\` | ${type} | ${s.n} | ${shown} |`);
  }
  const header = '| Field | Type | Times seen | Example |\n|---|---|---|---|\n';
  const max = 60;
  return header + rows.slice(0, max).join('\n') + (rows.length > max ? `\n| … | | | ${rows.length - max} more fields in the sample file |` : '');
}
function sanitizeValue(p, v) {
  const key = p.replace(/\[\]/g, '').split('.').pop();
  return PRIVATE_KEYS.has(key) || (key === 'Name' && /Contact/.test(p)) ? '<redacted>' : v;
}
const oneOrMany = resp => { // paths that appeared as object in one place and list in another
  const out = new Set();
  (function walk(node, p, seen) {
    if (Array.isArray(node)) { node.forEach(x => walk(x, p, seen)); return; }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      const q = p ? `${p}.${k}` : k;
      const kind = Array.isArray(v) ? 'list' : typeof v === 'object' ? 'object' : 'text';
      const prev = seen.get(q);
      if (prev && prev !== kind && !isCommonPath(q + '.x')) out.add(q);
      seen.set(q, kind);
      walk(v, q, seen);
    }
  })(resp, '', new Map());
  return [...out];
};

// ---- per command ----
const byCommand = new Map();
for (const r of records) (byCommand.get(r.command) ?? byCommand.set(r.command, []).get(r.command)).push(r);

const results = {};
for (const name of allNames.filter(isRead)) {
  const tries = byCommand.get(name) ?? [];
  const m = commands[name] ?? {};
  const best = (m.sample && tries.find(t => t.id === m.sample)) || [...tries].sort((a, b) => score(b) - score(a))[0];
  const state = !best ? 'not run' : best.status !== 200 ? (/Permission denied/.test(best.response?.detail ?? '') ? 'denied' : 'error') : isEmpty(best) ? 'empty' : 'data';
  results[name] = { tries, best, state };
  if (state === 'data' || state === 'empty') {
    const sample = trim(sanitize(best.response), 3);
    fs.writeFileSync(path.join(samplesDir, name + '.json'), JSON.stringify({
      command: name, request: best.body, status: best.status, bytes: best.bytes,
      note: 'Trimmed: lists keep their first 3 items. Names, phones and street addresses are masked.',
      response: sample,
    }, null, 2) + '\n');
  }
}

const badge = { data: '✅ data', empty: '⚪ empty', denied: '⛔ permission denied', error: '⚠️ refused', 'not run': '⏸ not run' };
const fence = (lang, s) => '```' + lang + '\n' + s + '\n```';
function shortSample(resp, name) {
  const lines = JSON.stringify(trim(sanitize(contentOf(resp, name)), 1, 60), null, 2).split('\n');
  return lines.length > 30 ? lines.slice(0, 30).join('\n') + '\n  …' : lines.join('\n');
}

function block(name) {
  const { tries, best, state } = results[name];
  const m = commands[name] ?? {};
  const out = [`### \`${name}\``, '', `**Status:** ${badge[state]}${m.unverified ? ' · purpose not confirmed by Tekla, inferred from the name and reply' : ''}`, ''];
  if (m.purpose) out.push(`**Purpose.** ${m.purpose}`, '');
  if (m.ask) out.push(`**Answers:** ${m.ask}`, '');
  if (best) {
    out.push(state === 'data' || state === 'empty' ? '**Request that worked:**' : '**Best attempt:**', '', fence('json', JSON.stringify(best.body)), '');
    const failed = tries.filter(t => t !== best && t.status !== 200);
    if (state !== 'data' && state !== 'empty' || failed.length) {
      out.push('**Attempts:**', '');
      for (const t of tries) out.push(`- \`${JSON.stringify(t.body)}\` → ${t.status}${t.status === 200 ? (isEmpty(t) ? ', empty' : `, ${t.bytes} bytes`) : `: ${t.response?.detail ?? t.error}`}`);
      out.push('');
    }
  }
  if (state === 'data' || state === 'empty') {
    out.push(`**Result:** HTTP ${best.status}, ${best.bytes.toLocaleString('en-US')} bytes${best.ms == null ? '' : `, ${best.ms} ms`}${state === 'empty' ? '. **Came back empty**: no data beyond the reply envelope.' : '.'}`, '');
    if (best.fromSample) out.push('_This reply is from an earlier run. The API user can no longer read this job, so the field table is built from the trimmed sample (first 3 items of each list)._', '');
    if (state === 'data') {
      out.push('**Response fields:**', '', fields(best.response), '');
      out.push(`**Sample** (trimmed; full trimmed sample in [samples/${name}.json](samples/${name}.json)):`, '', fence('json', shortSample(best.response, name)), '');
    }
  }
  const gotchas = [...(m.gotchas ?? [])];
  if (state === 'denied') gotchas.unshift('PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).');
  if (state === 'data') {
    const om = oneOrMany(best.response);
    if (om.length) gotchas.push(`One or many: ${om.map(p => '`' + p + '`').join(', ')} came back as an object in one place and a list in another. Always normalise to a list.`);
  }
  if (gotchas.length) out.push('**Gotchas:**', '', ...gotchas.map(g => '- ' + g), '');
  return out.join('\n');
}

// ---- group pages ----
const assigned = new Set();
for (const [file, g] of Object.entries(groups)) {
  const reads = g.reads.filter(n => results[n]);
  reads.forEach(n => assigned.add(n));
  const writes = g.writes ?? [];
  writes.forEach(n => assigned.add(n));
  const page = [
    `# ${g.title}`, '', g.intro, '',
    `[← Back to the index](README.md)`, '',
    '## Read commands', '',
    '| Command | Status | Answers |', '|---|---|---|',
    ...reads.map(n => `| [\`${n}\`](#${n.toLowerCase()}) | ${badge[results[n].state]} | ${commands[n]?.ask ?? ''} |`), '',
    ...reads.map(block),
  ];
  if (writes.length) {
    page.push('## Write commands (not run)', '',
      'These change PowerFab data, so they were not called. The service refuses them while `POWERFAB_ALLOW_WRITES` is off. Purposes come from the command name and Tekla\'s reference, not from a call.', '',
      '| Command | What it does |', '|---|---|',
      ...writes.map(n => `| \`${n}\` | ${writeNotes[n] ?? 'Not described; inferred from the name only.'} |`), '');
  }
  fs.writeFileSync(path.join(docs, file), page.join('\n'));
}
const missing = allNames.filter(n => !assigned.has(n));
if (missing.length) { console.error('Commands without a group:', missing.join(' ')); process.exitCode = 1; }

// ---- README ----
const fileOf = n => Object.entries(groups).find(([, g]) => g.reads.includes(n) || g.writes?.includes(n))?.[0];
const link = n => `[\`${n}\`](${fileOf(n)}#${n.toLowerCase()})`;
const readNames = allNames.filter(isRead);
const count = s => readNames.filter(n => results[n].state === s).length;
const lines = [
  readme.top, '',
  '## Run summary', '',
  `- Commands in the table: **${allNames.length}** (${readNames.length} read, ${allNames.length - readNames.length} write).`,
  `- Read commands called: **${readNames.filter(n => results[n].best).length}**, ${records.length} requests in all ([calls.json](../../tools/powerfab-wiki/calls.json)).`,
  `- ✅ returned data: **${count('data')}** · ⚪ empty: **${count('empty')}** · ⛔ permission denied: **${count('denied')}** · ⚠️ refused: **${count('error')}**.`,
  '- Write commands: none called. See "Write commands (not run)" on each page.', '',
  '## Pages', '',
  ...Object.entries(groups).map(([f, g]) => `- [${g.title}](${f}): ${g.blurb}`), '',
  readme.middle, '',
  '## Which command answers which question', '',
  '| Question | Command | Status |', '|---|---|---|',
  ...readNames.filter(n => commands[n]?.ask && results[n].state === 'data').map(n => `| ${commands[n].ask} | ${link(n)} | ${badge.data} |`), '',
  '## Empty, refused or not allowed', '',
  'Everything below came back with no data. Fix the cause in the last column and rerun to fill it in.', '',
  '| Command | Status | What PowerFab said |', '|---|---|---|',
  ...readNames.filter(n => results[n].state !== 'data').map(n => {
    const r = results[n];
    const said = r.state === 'empty' ? 'Successful, but nothing in the reply' : r.best ? r.best.response?.detail ?? r.best.error : 'not called';
    return `| ${link(n)} | ${badge[r.state]} | ${String(said).replace(/\|/g, '\\|')} |`;
  }), '',
  readme.bottom, '',
];
fs.writeFileSync(path.join(docs, 'README.md'), lines.join('\n'));
console.log(`data ${count('data')}, empty ${count('empty')}, denied ${count('denied')}, error ${count('error')}`);
