-- 留言板表。放在 D1 上，让访客看到彼此写下的内容，而不是各存各的浏览器。
--
-- 设计取舍：
--   * `delete_hash` 存的是删除令牌的 SHA-256，删留言时用它校验所有权，
--     数据库里不出现明文令牌；令牌只发给发布者本人。
--   * `ip_hash` 同样只存哈希，仅用于按来源限流。
--   * `status` 保留字段：将来要加审核时，把 'visible' 之外的记录过滤掉即可，
--     不必改表结构。
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TEXT NOT NULL,
  delete_hash TEXT NOT NULL,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'visible'
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ip_created ON messages (ip_hash, created_at DESC);
