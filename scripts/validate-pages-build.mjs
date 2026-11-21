import { spawnSync } from 'node:child_process';

const cases = [
  {
    name: 'local defaults to Nuxt',
    env: {},
    expected: 'target=nuxt',
  },
  {
    name: 'legacy SPA project',
    env: { CF_PAGES_URL: 'https://abc123.vue-next-view-spa.pages.dev' },
    expected: 'target=spa',
  },
  {
    name: 'main Nuxt project',
    env: { CF_PAGES_URL: 'https://abc123.vue-next-view.pages.dev' },
    expected: 'target=nuxt',
  },
  {
    name: 'explicit override',
    env: { CF_PAGES_URL: 'https://abc123.vue-next-view.pages.dev', PAGES_TARGET: 'spa' },
    expected: 'target=spa',
  },
];

let failed = false;
for (const testCase of cases) {
  const result = spawnSync(process.execPath, ['scripts/pages-build.mjs', '--dry-run'], {
    cwd: process.cwd(),
    env: { ...process.env, ...testCase.env },
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  const passed = result.status === 0 && output.includes(testCase.expected);
  console.log(`${passed ? '✓' : '✗'} ${testCase.name}: ${output}`);
  if (!passed) failed = true;
}

if (failed) {
  console.error('Pages build routing validation failed.');
  process.exitCode = 1;
} else {
  console.log(`Pages build routing looks correct (${cases.length} cases checked).`);
}
