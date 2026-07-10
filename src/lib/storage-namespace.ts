/* eslint-disable no-console, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

/**
 * 部署命名空间（Storage Namespace）
 * ------------------------------------------------------------------
 * 用于隔离不同部署环境（如 Cloudflare Workers 与 Render）的数据。
 *
 * 问题背景：
 *   - Cloudflare 部署只能使用 Upstash（HTTP Redis），其 storage 实现在 `upstash.db.ts`。
 *   - Render（Docker）部署可使用 Kvrocks / Redis / Upstash，实现在 `redis-base.db.ts` / `upstash.db.ts`。
 *   两套实现使用的是【完全相同】的 key 方案（`u:用户名:pr` / `sys:users` / `admin:config` …）。
 *   如果它们指向【同一个】Redis / Upstash 实例，所有 key 会直接相撞：同名用户、同一份收藏与
 *   播放记录互相串台，且管理员配置互相覆盖。
 *
 * 解决方案：
 *   读取环境变量 `STORAGE_NAMESPACE`，给所有业务 key 统一加上 `<namespace>:` 前缀：
 *     Cloudflare 部署：STORAGE_NAMESPACE=cf    → key 形如 `cf:u:admin:pr` / `cf:sys:users`
 *     Render     部署：STORAGE_NAMESPACE=render → key 形如 `render:u:admin:pr` / `render:sys:users`
 *   即使共用一个数据库，也能实现数据隔离与清晰区分。
 *
 * 向后兼容：
 *   不设置（空）时等同于旧行为（无前缀），不影响已有数据。
 *   注意：对【已存在数据】的部署启用本变量属于破坏性变更（旧 key 无前缀，新代码读带前缀 key），
 *   需要按 README 的「启用命名空间迁移」做一次 key 重命名，或直接使用独立数据库。
 */

export const STORAGE_NAMESPACE = (() => {
  const raw = process.env.STORAGE_NAMESPACE?.trim();
  if (!raw) return '';
  // 去掉首尾多余冒号，统一以单个冒号作为分隔结尾
  const normalized = raw.replace(/^:+|:+$/g, '');
  return normalized ? `${normalized}:` : '';
})();

/** 给业务 key 加上部署命名空间前缀 */
export function withNS(key: string): string {
  return STORAGE_NAMESPACE + key;
}

/** 给迁移扫描用的 KEYS 模式加上命名空间前缀 */
export function withNSPattern(pattern: string): string {
  return STORAGE_NAMESPACE + pattern;
}

/**
 * 生成「可选命名空间前缀」的正则片段，供数据迁移时兼容新旧 key：
 *   - 未设置命名空间 → 返回空字符串；
 *   - 已设置（如 `cf:`）→ 返回 `(?:cf:)?`，使正则既能匹配旧的无前缀 key，
 *     也能匹配（理论上）已带前缀的遗留 key。
 */
export function optionalNSRegexSource(): string {
  const escaped = STORAGE_NAMESPACE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped ? `(?:${escaped})?` : '';
}
