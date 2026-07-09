import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Cloudflare Workers 部署配置（OpenNext for Cloudflare）。
//
// - 默认即使用 nodejs_compat 运行时，原生支持 node:crypto（密码哈希 scrypt）
//   与流式 HTTP 响应（/api/search/ws 的 ReadableStream 流式搜索），
//   与现有所有 route 的 `runtime = 'nodejs'` 完全兼容。
// - 服务端存储已由代码内部按 NEXT_PUBLIC_STORAGE_TYPE=upstash 选择 Upstash
//   （HTTP Redis），无需在此额外配置。
//
// 如需拆分函数、自定义缓存或 image worker，可在此追加 override，
// 详见 https://opennext.js.org/cloudflare
export default defineCloudflareConfig({});
