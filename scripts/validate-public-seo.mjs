import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFile(path.join(root, 'public', file), 'utf8');

const [robots, sitemap, rss] = await Promise.all([
  read('robots.txt'),
  read('sitemap.xml'),
  read('rss.xml'),
]);

const errors = [];
if (!/^Sitemap:\s*https:\/\//mi.test(robots)) {
  errors.push('robots.txt must contain an HTTPS Sitemap URL');
}
if (!/<loc>https:\/\//i.test(sitemap) || /Generated during deployment/i.test(sitemap)) {
  errors.push('sitemap.xml is still a placeholder or contains no HTTPS URLs');
}
if (!/<link>https:\/\//i.test(rss) || /Generated during deployment/i.test(rss)) {
  errors.push('rss.xml is still a placeholder or contains no HTTPS link');
}

if (errors.length) {
  console.error('Public SEO validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Public SEO artifacts contain production HTTPS URLs.');
}
