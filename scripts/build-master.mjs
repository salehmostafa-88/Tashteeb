// Mechanically assemble a reading copy. Canonical specification remains in docs/design.
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {dirname, resolve, join, posix} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const parts = readdirSync(join(root, 'docs')).filter(n => /^\d\d-.*\.md$/.test(n)).sort().map(n => `docs/${n}`);
parts.push('design/screen-layouts.md', 'prompts/00-start.md', 'prompts/phase-prompts.md');
let result = '# Studio Project Portal complete system specification\n\nVersion 1.0 · 1 October 2026\n\nRepository-ready product, domain, UX, architecture, data, API, security, mobile, migration, delivery and operations specification. This is a proposed build plan, not an implemented or production-validated system. All repository examples are synthetic. Read README.md for usage.\n\n';
result += '## Contents\n\n' + parts.map((p,i) => `${i+1}. [${readFileSync(join(root,p),'utf8').split('\n')[0].replace(/^# /,'')}](${p})`).join('\n') + '\n\n';
for (const path of parts) {
  let content = readFileSync(join(root, path), 'utf8');
  content = content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (whole, label, link) => {
    if (/^(https?:|mailto:|#)/.test(link)) return whole;
    return `[${label}](${posix.normalize(posix.join(posix.dirname(path), link))})`;
  });
  result += `\n---\n\nSource document: ${path}\n\n${content}\n`;
}
writeFileSync(join(root, 'MASTER-SPEC.md'), result);
console.log(`Assembled ${parts.length} source documents into MASTER-SPEC.md.`);
