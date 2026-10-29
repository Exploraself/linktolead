// Builds a single self-contained page from the programme, for previewing
// where a module graph cannot be served. Concatenates the modules in
// dependency order and removes the import/export syntax — there is no
// bundler here and the programme does not need one.
//
// Run: node scripts/bundle.mjs <output.html>
import { readFile, writeFile } from 'node:fs/promises';

const ORDER = ['levels-build.js', 'levels-grow.js', 'levels-scale.js', 'frameworks.js',
  'fw-build.js', 'fw-grow.js', 'fw-scale.js', 'content.js', 'feedback.js', 'account.js', 'home.js', 'app.js'];

const here = (p) => new URL('../public/' + p, import.meta.url);

/** `import { result as fwResult }` loses the alias once the import line goes,
 *  so each alias is re-declared instead. */
function aliases(src) {
  const out = [];
  for (const m of src.matchAll(/^\s*import\s*\{([^}]*)\}\s*from\s*'[^']+';/gm)) {
    for (const piece of m[1].split(',')) {
      const a = /^\s*([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)\s*$/.exec(piece);
      if (a) out.push(`const ${a[2]} = ${a[1]};`);
    }
  }
  return out;
}

/** `import * as account from './account.js'` has no meaning once concatenated,
 *  so the namespace is rebuilt from that file's own exports. */
function namespaces(src, exportsOf) {
  const out = [];
  for (const m of src.matchAll(/^\s*import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s*from\s*'\.\/([^']+)';/gm)) {
    const names = exportsOf(m[2]);
    if (!names.length) throw new Error(`namespace import of ${m[2]} found no exports to rebuild`);
    out.push(`const ${m[1]} = { ${names.join(', ')} };`);
  }
  return out;
}

/** The names a module exports, read off its own source. */
function exportedNames(src) {
  const names = new Set();
  for (const m of src.matchAll(/^\s*export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
  for (const m of src.matchAll(/^\s*export\s*\{([^}]*)\};/gm))
    for (const piece of m[1].split(',')) {
      const n = piece.trim().split(/\s+as\s+/).pop().trim();
      if (n) names.add(n);
    }
  return [...names];
}

const strip = (src) => src
  .replace(/^\s*import[\s\S]*?from\s+'[^']+';\s*$/gm, '')
  .replace(/^\s*export\s+(?=(?:async\s+)?(?:const|function|class|let|var)\b)/gm, '')
  .replace(/^\s*export\s*\{[^}]*\};\s*$/gm, '');

// Read every module once first, so a namespace import can be rebuilt from the
// exports of the file it names.
const sources = new Map();
for (const f of ORDER) sources.set(f, await readFile(here(f), 'utf8'));
const exportsOf = (name) => {
  const src = sources.get(name) || sources.get(name.replace(/^\.\//, ''));
  return src ? exportedNames(src) : [];
};

const parts = [];
const seen = new Map();
for (const f of ORDER) {
  const raw = sources.get(f);
  const pre = [...aliases(raw), ...namespaces(raw, exportsOf)];
  const src = pre.join('\n') + (pre.length ? '\n' : '') + strip(raw);
  // Two modules may each have a private `SHEETS`; concatenated, one shadows
  // the other and the page dies at load. Catch it here rather than in a
  // browser console.
  for (const m of src.matchAll(/^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    const name = m[1];
    if (seen.has(name)) throw new Error(`name collision: '${name}' is declared in both ${seen.get(name)} and ${f}. Rename one before bundling.`);
    seen.set(name, f);
  }
  parts.push(`/* ── ${f} ───────────────────────────────── */\n` + src);
  // On the site each stage loads when needed; in one file all three are here.
  if (f === 'content.js') parts.push("registerStage('build', BUILD, FW_BUILD); registerStage('grow', GROW, FW_GROW); registerStage('scale', SCALE, FW_SCALE);");
}

const html = (await readFile(here('start/index.html'), 'utf8'))
  .replace('<link rel="stylesheet" href="/style.css">', `<style>\n${await readFile(here('style.css'), 'utf8')}\n</style>`)
  .replace('<script src="/app.js" type="module"></script>', `<script type="module">\n${parts.join('\n\n')}\n</script>`)
  .replace('<link rel="icon" href="/assets/icon.svg">', '')
  .replace('<script src="/compass/engine.js" defer></script>', `<script>\n${await readFile(here('compass/engine.js'), 'utf8')}\n</script>`);

const out = process.argv[2] || 'preview.html';
await writeFile(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + 'KB');
