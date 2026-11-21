import { spawnSync } from 'node:child_process';

/**
 * 同一个仓库挂着两个 Cloudflare Pages 项目：
 *
 * - `vue-next-view`      → 线上主站，跑 Nuxt 4（SSR + Nitro）。
 * - `vue-next-view-spa`  → 旧版 Vite 单页应用，仅作历史对照。
 *
 * 两个项目都执行 `npm run build`、都发布 `dist/`。迁移时把 `build` 换成
 * Nuxt 之后，旧 SPA 项目每次也跟着构建 Nuxt，于是它的域名也被覆盖成了新站。
 *
 * 这里按部署目标分流：Pages 在构建时会注入 `CF_PAGES_URL`（当前部署地址），
 * 主机名里就带着项目名，因此不需要在控制台额外配置变量。想显式指定时，
 * 设置 `PAGES_TARGET=spa` 或 `PAGES_TARGET=nuxt` 即可覆盖自动判断。
 */
const DRY_RUN = process.argv.includes('--dry-run');

const detectTarget = () => {
  const explicit = (process.env.PAGES_TARGET || '').trim().toLowerCase();
  if (explicit === 'spa' || explicit === 'nuxt') return { target: explicit, reason: 'PAGES_TARGET' };

  // CF_PAGES_URL 形如 https://<hash>.vue-next-view-spa.pages.dev
  const deploymentUrl = process.env.CF_PAGES_URL || '';
  const projectName = process.env.CF_PAGES_PROJECT_NAME || '';
  let hostname = '';
  try {
    hostname = deploymentUrl ? new URL(deploymentUrl).hostname : '';
  } catch {
    hostname = '';
  }
  const isSpaProject = projectName === 'vue-next-view-spa'
    || hostname === 'vue-next-view-spa.pages.dev'
    || hostname.endsWith('.vue-next-view-spa.pages.dev');
  if (isSpaProject) {
    return { target: 'spa', reason: projectName ? `CF_PAGES_PROJECT_NAME=${projectName}` : `CF_PAGES_URL=${deploymentUrl}` };
  }
  if (hostname) return { target: 'nuxt', reason: `CF_PAGES_URL=${deploymentUrl}` };
  return { target: 'nuxt', reason: 'local build' };
};

const { target, reason } = detectTarget();
const script = target === 'spa' ? 'build:vite' : 'build:cf';

console.log(`[pages-build] target=${target} (${reason}) → npm run ${script}`);

if (DRY_RUN) process.exit(0);

// 在 Windows 上 npm 是 .cmd，必须经由 shell 启动；传整条命令可避开
// Node 对 `shell: true` + 参数数组的弃用警告。
const result = spawnSync(`npm run ${script}`, { stdio: 'inherit', shell: true });
if (result.error) {
  console.error(`[pages-build] failed to start npm: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
