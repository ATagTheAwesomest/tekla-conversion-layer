// Calls PowerFab commands through the conversion layer, one at a time, and saves each raw reply.
//
//   $env:PF_KEY = '<bearer token>'      # never put the token in a file
//   node tools/powerfab-wiki/probe.mjs tools/powerfab-wiki/calls.json <out dir>
//
// PF_URL defaults to the live service. Replies hold the full job data, so keep the out dir outside
// the repo; build.mjs turns it into the trimmed samples under docs/powerfab/samples/.
// Only send read commands: the service refuses writes unless POWERFAB_ALLOW_WRITES is on, and this
// tool should never be pointed at a server where it is.
import fs from 'node:fs';
import path from 'node:path';

const [, , callsFile, outDir] = process.argv;
const key = process.env.PF_KEY;
const base = (process.env.PF_URL ?? 'https://terra-api.helpiminthe.icu') + '/api/powerfab/';
if (!key || !callsFile || !outDir) {
  console.error('usage: PF_KEY=... node probe.mjs calls.json outDir');
  process.exit(1);
}
const calls = JSON.parse(fs.readFileSync(callsFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const c of calls) {
  const file = path.join(outDir, c.id + '.json');
  if (fs.existsSync(file)) continue; // rerun-safe: delete a file to call it again
  const started = Date.now();
  const rec = { id: c.id, command: c.command, body: c.body ?? {} };
  try {
    const res = await fetch(base + c.command, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(c.body ?? {}),
      signal: AbortSignal.timeout(c.timeout ?? 60000),
    });
    const text = await res.text();
    rec.status = res.status;
    rec.bytes = text.length;
    try { rec.response = JSON.parse(text); } catch { rec.responseText = text.slice(0, 5000); }
  } catch (e) {
    rec.status = 'error';
    rec.error = String(e);
  }
  rec.ms = Date.now() - started;
  fs.writeFileSync(file, JSON.stringify(rec, null, 2));
  console.log(`${c.id}\t${rec.status}\t${rec.bytes ?? ''}b\t${rec.ms}ms`);
  await sleep(300);
}
