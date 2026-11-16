import fs from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('public-seo');
const target = path.resolve('dist');
const files = ['robots.txt', 'sitemap.xml', 'rss.xml', 'llms.txt'];

await fs.mkdir(target, { recursive: true });

for (const file of files) {
  try {
    await fs.copyFile(path.join(source, file), path.join(target, file));
  } catch {
    throw new Error(`Missing public-seo/${file}. Run "SITE_URL=https://your-domain npm run generate:seo" first.`);
  }
}

console.log(`Copied ${files.length} SEO files into dist/`);
