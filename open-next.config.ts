// OpenNext 配置 —— 用于部署到 Cloudflare Workers（@opennextjs/cloudflare）
// 文档：https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// 默认 wrapper 为 cloudflare-node，可直接兼容本项目 route 的 `runtime = 'nodejs'`。
// 如需调整（例如改用 edge runtime 或自定义缓存/标签），在此扩展即可。
export default defineCloudflareConfig({
  // 例：覆盖默认 wrapper
  // default: { override: { wrapper: 'cloudflare-node' } },
});
