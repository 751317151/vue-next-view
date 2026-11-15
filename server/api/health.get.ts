export default defineEventHandler(() => ({
  status: 'ok',
  service: 'blackstar-blog',
  timestamp: new Date().toISOString(),
}));
