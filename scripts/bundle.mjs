// Builds a single self-contained page from the programme, for previewing
// where a module graph cannot be served. Concatenates the modules in
// dependency order and removes the import/export syntax — there is no
// bundler here and the programme does not need one.
//
// Run: node scripts/bundle.mjs <output.html>
import { readFile, writeFile } from 'node:fs/promises';

const ORDER = ['levels-build.js', 'levels-grow.js', 'levels-scale.js', 'frameworks.js',
  'fw-build.js', 'fw-grow.js', 'fw-scale.js', 'content.js', 'feedback.js', 'app.js'];

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

const strip = (src) => src
  .replace(/^\s*import[\s\S]*?from\s+'[^']+';\s*$/gm, '')
  .replace(/^\s*export\s+(?=(const|function|class|let|var)\b)/gm, '')
  .replace(/^\s*export\s*\{[^}]*\};\s*$/gm, '');

const parts = [];
const seen = new Map();
for (const f of ORDER) {
  const raw = await readFile(here(f), 'utf8');
  const src = aliases(raw).join('\n') + (aliases(raw).length ? '\n' : '') + strip(raw);
  // Two modules may each have a private `SHEETS`; concatenated, one shadows
  // the other and the page dies at load. Catch it here rather than in a
  // browser console.
  for (const m of src.matchAll(/^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    const name = m[1];
    if (seen.has(name)) throw new Error(`name collision: '${name}' is declared in both ${seen.get(name)} and ${f}. Rename one before bundling.`);
    seen.set(name, f);
  }
  parts.push(`/* ── ${f} ───────────────────────────────── */\n` + src);
}

const html = (await readFile(here('index.html'), 'utf8'))
  .replace('<link rel="stylesheet" href="/style.css">', `<style>\n${await readFile(here('style.css'), 'utf8')}\n</style>`)
  .replace('<script src="/app.js" type="module"></script>', `<script type="module">\n${parts.join('\n\n')}\n</script>`)
  .replace('<link rel="icon" href="/assets/icon.svg">', '');

const out = process.argv[2] || 'preview.html';
await writeFile(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + 'KB');
