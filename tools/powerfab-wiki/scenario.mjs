// Runs a write scenario against the test job only, step by step, and saves every reply.
//
//   $env:PF_KEY = '<bearer token>'
//   node tools/powerfab-wiki/scenario.mjs tools/powerfab-wiki/writes/round2.json <out dir>
//
// A scenario is a list of sections; each section is a list of steps run in order:
//   { "id", "command", "body", "save": { "LOAD": { "key": "ProductionControlLoadID", "where": { "LoadNumber": "WIKI-1" }, "nth": 0 } },
//     "always": true }
// "{{LOAD}}" in a body is replaced with a value saved by an earlier step: save looks through the
// reply for the nth object (default first) holding `key` and matching `where`, and keeps its value. A step whose
// variables are missing is skipped. Steps marked "always" (cleanup) run even after a failure.
// Guard: any body naming another job (JobNumber, ProductionControlID or ProjectID) is refused here.
// ProductionControlLoadID and similar IDs are not checked: scenarios must take them from a reply for
// the test job, or name them after reading that job's loads.
import fs from 'node:fs';
import path from 'node:path';

// The only jobs a scenario may touch: the PowerFab test jobs EPM-001 and TESTTEST.
const TEST_JOBS = { JobNumber: ['EPM-001', 'TESTTEST'], ProductionControlID: ['13', '90'], ProjectID: ['4', '29'] };
const [, , file, outDir] = process.argv;
const key = process.env.PF_KEY;
const base = (process.env.PF_URL ?? 'https://terra-api.helpiminthe.icu') + '/api/powerfab/';
if (!key || !file || !outDir) { console.error('usage: PF_KEY=... node scenario.mjs scenario.json outDir'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const sections = JSON.parse(fs.readFileSync(file, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fill(node, vars, missing) {
  if (typeof node === 'string') {
    const m = node.match(/^\{\{(\w+)\}\}$/);
    if (m) { if (!(m[1] in vars)) missing.add(m[1]); return vars[m[1]]; }
    return node;
  }
  if (Array.isArray(node)) return node.map(x => fill(x, vars, missing));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fill(v, vars, missing)]));
  return node;
}
function otherJob(node) {
  if (Array.isArray(node)) return node.some(otherJob);
  if (!node || typeof node !== 'object') return false;
  return Object.entries(node).some(([k, v]) =>
    (k in TEST_JOBS && typeof v !== 'object' && !TEST_JOBS[k].includes(String(v))) || otherJob(v));
}
// The nth object (depth first) holding keyName and matching where. A where value ">0" means a number above 0.
function find(node, keyName, where = {}, nth = 0) {
  const hits = [];
  const ok = n => Object.entries(where).every(([k, v]) => v === '>0' ? Number(n[k]) > 0 : String(n[k]) === String(v));
  (function walk(n) {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;
    if (keyName in n && ok(n)) hits.push(n[keyName]);
    Object.values(n).forEach(walk);
  })(node);
  return hits[nth];
}

const vars = {};
for (const [s, steps] of sections.entries()) {
  let failed = false;
  for (const step of steps) {
    const rec = { id: step.id, command: step.command, section: s };
    const missing = new Set();
    rec.body = fill(step.body ?? {}, vars, missing);
    if ((failed && !step.always) || missing.size || otherJob(rec.body)) {
      rec.status = 'skipped';
      rec.reason = otherJob(rec.body) ? 'body names another job' : missing.size ? `missing ${[...missing].join(', ')}` : 'earlier step failed';
    } else {
      const t0 = Date.now();
      try {
        const res = await fetch(base + step.command, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify(rec.body),
          signal: AbortSignal.timeout(step.timeout ?? 60000),
        });
        const text = await res.text();
        rec.status = res.status;
        rec.bytes = text.length;
        try { rec.response = JSON.parse(text); } catch { rec.responseText = text.slice(0, 2000); }
      } catch (e) { rec.status = 'error'; rec.error = String(e); }
      rec.ms = Date.now() - t0;
      if (rec.status !== 200 && step.required) failed = true;
      for (const [name, spec] of Object.entries(step.save ?? {})) {
        const v = find(rec.response, spec.key, fill(spec.where ?? {}, vars, new Set()), spec.nth);
        if (v !== undefined && v !== '') vars[name] = v;
      }
      await sleep(400);
    }
    fs.writeFileSync(path.join(outDir, `${String(s).padStart(2, '0')}_${step.id}.json`), JSON.stringify(rec, null, 2));
    console.log(`${step.id}\t${rec.status}\t${rec.reason ?? rec.response?.detail ?? ''}`);
  }
}
console.log('saved values:', JSON.stringify(vars));
