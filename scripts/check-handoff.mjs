// Specification QA only. Not a production financial engine or application test suite.
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'fixtures/financial-cases.json'), 'utf8'));
const schema = JSON.parse(readFileSync(join(root, 'contracts/core.schema.json'), 'utf8'));
assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');

function roundRatio(n, d) {
  assert(d > 0n);
  const sign = n < 0n ? -1n : 1n;
  const abs = n < 0n ? -n : n;
  return sign * ((abs + d / 2n) / d);
}

for (const c of data.rounding_cases) {
  assert.equal(roundRatio(BigInt(c.numerator), BigInt(c.denominator)).toString(), c.expected);
}

for (const c of data.cases) {
  const input = structuredClone({...data.base, ...c.override});
  input.costs.push(...(c.append_costs ?? []));
  let company = 0n, direct = 0n;
  const bases = new Map();
  for (const row of input.costs) {
    if (row.status !== 'approved') continue;
    const signed = BigInt(row.amount_minor) * (row.kind === 'refund' ? -1n : 1n);
    if (row.payer === 'company') company += signed;
    else direct += signed;
    if (row.fee_eligible && !(c.set_direct_ineligible && row.payer === 'client_direct')) {
      bases.set(row.rule, (bases.get(row.rule) ?? 0n) + signed);
    }
  }
  let fee = 0n;
  for (const [rule, base] of bases) fee += roundRatio(base * BigInt(input.rules[rule]), 10000n);
  const funding = BigInt(input.funding_minor);
  const complete = input.cash_history_complete && input.withdrawals_minor !== null;
  const result = {
    company_minor: company.toString(), direct_minor: direct.toString(), fee_minor: fee.toString(),
    remaining_minor: (funding - company - fee).toString(), total_minor: (company + direct + fee).toString(),
    cash_proxy_minor: complete ? (funding - company - BigInt(input.withdrawals_minor)).toString() : null,
    fee_balance_minor: complete ? (fee - BigInt(input.withdrawals_minor)).toString() : null
  };
  assert.deepEqual(result, c.expected, c.id);
}

const SKIP = new Set(['node_modules', '.next', '.git', 'test-results', 'playwright-report', 'coverage']);
function files(dir) {
  return readdirSync(dir).filter(name => !SKIP.has(name) && !(name === '.temp' && dir.endsWith('supabase'))).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
let markdownCount = 0;
for (const path of files(root)) {
  if (!path.endsWith('.md')) continue;
  markdownCount++;
  const text = readFileSync(path, 'utf8');
  // MASTER-SPEC is generated with links rewritten to repository-root paths.
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^(https?:|mailto:|#)/.test(link)) continue;
    const target = resolve(dirname(path), link.split('#')[0]);
    assert(statSync(target).isFile(), `Missing local link in ${path}: ${link}`);
  }
  const fences = [...text.matchAll(/^```/gm)].length;
  assert.equal(fences % 2, 0, `Unclosed code fence in ${path}`);
}
console.log(`PASS: ${data.cases.length} financial cases, ${data.rounding_cases.length} rounding cases, JSON parsing, ${markdownCount} Markdown files and local links.`);
console.log('NOT TESTED: future app, SQL/RLS, schema runtime validation, devices, uploads, billing or deployment.');
