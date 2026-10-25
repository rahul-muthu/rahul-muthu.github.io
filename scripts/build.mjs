import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const source = resolve('site');
const output = resolve('dist');

rmSync(output, { recursive: true, force: true });
cpSync(source, output, { recursive: true });

const htmlFiles = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
walk(output);

const missing = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    const absolute = clean.startsWith('/')
      ? join(output, clean)
      : resolve(dirname(file), clean);
    if (!existsSync(absolute) && !existsSync(join(absolute, 'index.html'))) {
      missing.push(`${file.replace(`${output}/`, '')}: ${target}`);
    }
  }
}

if (missing.length) {
  console.error(`Broken internal links:\n${missing.join('\n')}`);
  process.exit(1);
}

console.log(`Built ${htmlFiles.length} pages in dist/ with no broken internal links.`);

// The existing GitHub Pages site serves the repository root. Keep that
// publishing layout while retaining editable source in site/.
if (process.argv.includes('--github-pages')) {
  for (const entry of readdirSync(output)) {
    cpSync(join(output, entry), resolve(entry), { recursive: true });
  }
  writeFileSync(resolve('.nojekyll'), '');
  console.log('Updated repository-root files for GitHub Pages.');
}
