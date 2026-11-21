import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Nitro serves files that already exist in the output directory before it runs
 * a route handler. A leftover `dist/rss.xml` therefore shadows the live RSS
 * route during prerendering, and the build keeps publishing last week's feed.
 * Clearing the target first makes every build describe the current content.
 *
 * Only the repository's own build directories are removed; anything that
 * resolves outside the project (or is the project root itself) is refused.
 */
const root = path.resolve(process.cwd());
// `dist` is what Cloudflare publishes; `.output` is Nitro's staging directory.
// The Cloudflare preset copies `.output/public` into `dist`, so a stale staging
// directory re-publishes old crawler files even when `dist` was just emptied.
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['dist', '.output'];

for (const target of targets) {
  const resolved = path.resolve(root, target);
  if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Refusing to remove ${resolved}: outside the project build directories.`);
  }
  await fs.rm(resolved, { recursive: true, force: true });
  console.log(`Cleaned ${path.relative(root, resolved) || '.'}`);
}
