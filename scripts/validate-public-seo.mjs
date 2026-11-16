import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'public-seo');

const read = async (file) => {
  try {
    return await fs.readFile(path.join(dir, file), 'utf8');
  } catch {
    throw new Error(`public-seo/${file} is missing. Run "SITE_URL=https://your-domain npm run generate:seo" first.`);
  }
};

let robots = '';
let sitemap = '';
let rss = '';
let llms = '';
try {
  [robots, sitemap, rss, llms] = await Promise.all([
    read('robots.txt'),
    read('sitemap.xml'),
    read('rss.xml'),
    read('llms.txt'),
  ]);
} catch (error) {
  console.error('Public SEO validation failed:');
  console.error(`- ${error.message}`);
  process.exit(1);
}

const errors = [];
if (!/^Sitemap:\s*https:\/\//mi.test(robots)) {
  errors.push('robots.txt must contain an HTTPS Sitemap URL');
}
if (!/User-agent:\s*OAI-SearchBot/im.test(robots)) {
  errors.push('robots.txt should explicitly allow OAI-SearchBot');
}
if (!/<loc>https:\/\//i.test(sitemap) || /Generated during deployment/i.test(sitemap)) {
  errors.push('sitemap.xml is still a placeholder or contains no HTTPS URLs');
}
if (!/<link>https:\/\//i.test(rss) || /Generated during deployment/i.test(rss)) {
  errors.push('rss.xml is still a placeholder or contains no HTTPS link');
}
if (!/^#\s+/m.test(llms) || !/https:\/\//i.test(llms)) {
  errors.push('llms.txt must contain a heading and absolute HTTPS links');
}

if (errors.length) {
  console.error('Public SEO validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Public SEO artifacts contain production HTTPS URLs.');
}
