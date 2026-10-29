// Checks every instrument in the collection: its name and place, that it is an MP4 with H.264 and AAC, and that the
// PoopTracker instrument in its metadata is valid; an instrument that doesn't say where its video comes from is warned about. The rules of the instrument line
// are PoopTracker's own (its src/ptformat.js), never copied here.
//   node tools/check.mjs [path to a PoopTracker checkout, default ../pooptracker]
// Errors and warnings are printed as GitHub annotations; the exit code is 1 when there is an error.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PT = path.resolve(process.argv[2] ?? path.join(ROOT, '../pooptracker'));
const load = f => import(pathToFileURL(path.join(PT, f)).href);
const { default: PTFormat } = await load('src/ptformat.js');
const { indexMp4, reader } = await load('src/mp4cut.js');
const { u32, fourcc } = await load('src/mp4.js');

const MAX_BYTES = 5 * 1024 * 1024; // a few seconds of video; jsDelivr serves files up to 20 MB
const MAX_REGION = 8;              // PoopTracker's MAX_SAMPLE_SEC
const MAX_LONGER = 1;              // seconds the video may run past its region: more means it wasn't trimmed
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// not instruments: the repository's own files
const SKIP = new Set(['.git', '.github', '.pooptracker', 'tools', 'node_modules', 'README.md', 'LICENSE', '.gitignore', 'index.json']);

let errors = 0, warnings = 0;
const error = (file, msg) => { errors++; console.log(`::error file=${file}::${file}: ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`::warning file=${file}::${file}: ${msg}`); };

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (dir === ROOT && SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield path.relative(ROOT, p);
  }
}

async function check(rel) {
  const parts = rel.split(path.sep), ext = path.extname(rel), stem = path.basename(rel, ext);
  if (parts.length < 2) return error(rel, 'an instrument goes in a folder for its kind of sound (snare/, lyrics/tr/…)');
  if (ext !== '.mp4') return error(rel, `only .mp4 files belong here (found '${ext || 'no extension'}')`);
  for (const p of [...parts.slice(0, -1), stem])
    if (!NAME.test(p)) error(rel, `'${p}' must be lowercase letters and digits joined by dashes (e.g. bir-seyler-calin)`);

  const b = new Uint8Array(fs.readFileSync(path.join(ROOT, rel)));
  if (b.length > MAX_BYTES) error(rel, `${(b.length / 1048576).toFixed(1)} MB; at most ${MAX_BYTES / 1048576} MB (Trim it to its region)`);
  let index;
  try { index = await indexMp4(reader(b), b.length); } catch (e) { return error(rel, `not a readable MP4: ${e.message}`); }
  const codec = kind => { const t = index.tracks.find(t => t.kind === kind); return t && fourcc(index.b, t.stsd.body + 12); };
  const [vc, ac] = [codec('vide'), codec('soun')];
  if (!['avc1', 'avc3'].includes(vc)) error(rel, `the picture must be H.264 (found ${vc ?? 'none'}): yt-dlp -S vcodec:h264,acodec:aac`);
  if (ac !== 'mp4a') error(rel, `the sound must be AAC (found ${ac ?? 'none'}): yt-dlp -S vcodec:h264,acodec:aac`);
  const { mvhd } = index, v1 = index.b[mvhd.body] === 1;
  const dur = (v1 ? u32(index.b, mvhd.body + 24) * 4294967296 + u32(index.b, mvhd.body + 28) : u32(index.b, mvhd.body + 16)) / index.movieScale;

  let line;
  try { line = PTFormat.mp4ReadTag(b); } catch (e) { return error(rel, e.message); }
  if (line == null) return error(rel, 'no PoopTracker instrument in its metadata: open it in PoopTracker, check it, and Save it from the instrument list');
  let I;
  try { I = PTFormat.parse(line); } catch (e) { return error(rel, e.message); }
  if ('video' in I) error(rel, "the instrument line can't have a 'video' field");
  if (!I.source) warn(rel, 'no source: fill in Source in PoopTracker (a link, or e.g. "own recording") and Save again');
  if (I.end - I.start > MAX_REGION + 0.001) error(rel, `the region is ${(I.end - I.start).toFixed(3)} s; at most ${MAX_REGION} s`);
  if (I.end > dur + 0.05) error(rel, `the region ends at ${I.end.toFixed(3)} s, after the video (${dur.toFixed(3)} s)`);
  if (dur > I.end + MAX_LONGER) error(rel, `the video is ${dur.toFixed(3)} s but its region ends at ${I.end.toFixed(3)} s: Trim it in PoopTracker`);
}

const files = [...walk(ROOT)];
for (const f of files) await check(f);
console.log(`${files.length} files, ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`);
process.exitCode = errors ? 1 : 0;
