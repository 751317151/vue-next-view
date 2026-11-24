import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'nuxt.config.ts',
  'nuxt/app.vue',
  'nuxt/layouts/default.vue',
  'nuxt/pages/index.vue',
  'nuxt/pages/article/[slug].vue',
  'nuxt/pages/search.vue',
  'nuxt/pages/explore.vue',
  'nuxt/pages/glints/index.vue',
  'nuxt/pages/glints/[slug].vue',
  'nuxt/pages/desk.vue',
  'nuxt/components/GlintStrip.vue',
  'nuxt/components/GlintCalendar.vue',
  'nuxt/components/GrowthRings.vue',
  'nuxt/components/DeskFirstSteps.vue',
  'server/api/articles/index.get.ts',
  'server/api/articles/[slug].get.ts',
  'server/api/glints/index.get.ts',
  'server/api/glints/[slug].get.ts',
  'server/repositories/glint-repository.ts',
  'server/routes/robots.txt.ts',
  'server/routes/sitemap.xml.ts',
  'server/routes/rss.xml.ts',
  'server/routes/llms.txt.ts',
  'server/routes/llms-full.txt.ts',
  'scripts/pages-build.mjs',
  'scripts/validate-pages-build.mjs',
  'nuxt/composables/useFocusTrap.ts',
  'nuxt/components/StarCompass.vue',
  'nuxt/composables/useSiteSignals.ts',
  'nuxt/composables/useReadingTrail.ts',
  'nuxt/composables/useReadingPrefs.ts',
  'nuxt/composables/useExcerpts.ts',
  'nuxt/components/ExcerptShelf.vue',
  'nuxt/components/ReadingConstellation.vue',
  'src/seo/metadata.ts',
];

const missing = [];
for (const file of requiredFiles) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    missing.push(file);
  }
}

const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const hasNuxt = Boolean(packageJson.dependencies?.nuxt || packageJson.devDependencies?.nuxt);
if (!hasNuxt) missing.push('package.json:nuxt dependency');

if (missing.length) {
  console.error('Nuxt scaffold validation failed:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log(`Nuxt scaffold looks complete (${requiredFiles.length} required files checked).`);
}
