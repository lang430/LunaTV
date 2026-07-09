# MoonTV

<div align="center">
  <img src="public/logo.png" alt="MoonTV Logo" width="120">
</div>

> 🎬 **MoonTV** 是一个开箱即用的、跨平台的影视聚合播放器。它基于 **Next.js 14** + **Tailwind&nbsp;CSS** + **TypeScript** 构建，支持多资源搜索、在线播放、收藏同步、播放记录、云端存储，让你可以随时随地畅享海量免费影视内容。

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178c6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Docker Ready](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

</div>

---

## ✨ 功能特性

- 🔍 **多源聚合搜索**：一次搜索立刻返回全源结果。
- 📄 **丰富详情页**：支持剧集列表、演员、年份、简介等完整信息展示。
- ▶️ **流畅在线播放**：集成 HLS.js & ArtPlayer。
- ❤️ **收藏 + 继续观看**：支持 Kvrocks/Redis/Upstash 存储，多端同步进度。
- 📱 **PWA**：离线缓存、安装到桌面/主屏，移动端原生体验。
- 🌗 **响应式布局**：桌面侧边栏 + 移动底部导航，自适应各种屏幕尺寸。
- 👿 **智能去广告**：自动跳过视频中的切片广告（实验性）。

### 注意：部署后项目为空壳项目，无内置播放源和直播源，需要自行收集

<details>
  <summary>点击查看项目截图</summary>
  <img src="public/screenshot1.png" alt="项目截图" style="max-width:600px">
  <img src="public/screenshot2.png" alt="项目截图" style="max-width:600px">
  <img src="public/screenshot3.png" alt="项目截图" style="max-width:600px">
</details>

### 请不要在 B 站、小红书、微信公众号、抖音、今日头条或其他中国大陆社交平台发布视频或文章宣传本项目，不授权任何“科技周刊/月刊”类项目或站点收录本项目。

## 🗺 目录

- [技术栈](#技术栈)
- [部署](#部署)
  - [一键部署](#zeabur-一键部署)
  - [Docker 部署](#Kvrocks-存储推荐)
- [配置文件](#配置文件)
- [订阅](#订阅)
- [自动更新](#自动更新)
- [环境变量](#环境变量)
- [客户端](#客户端)
- [AndroidTV 使用](#AndroidTV-使用)
- [Roadmap](#roadmap)
- [安全与隐私提醒](#安全与隐私提醒)
- [License](#license)
- [致谢](#致谢)

## 技术栈

| 分类      | 主要依赖                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------- |
| 前端框架  | [Next.js 14](https://nextjs.org/) · App Router                                                        |
| UI & 样式 | [Tailwind&nbsp;CSS 3](https://tailwindcss.com/)                                                       |
| 语言      | TypeScript 4                                                                                          |
| 播放器    | [ArtPlayer](https://github.com/zhw2590582/ArtPlayer) · [HLS.js](https://github.com/video-dev/hls.js/) |
| 代码质量  | ESLint · Prettier · Jest                                                                              |
| 部署      | Docker                                                                                                |

## 部署

本项目**仅支持 Docker 或其他基于 Docker 的平台** 部署。

### zeabur 一键部署

点击下方按钮即可一键部署，自动配置 LunaTV + Kvrocks 数据库：

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/8MPTQU/deploy)

**优势**：

- ✅ 无需配置，一键启动（自动部署完整环境）
- ✅ 自动 HTTPS 和全球 CDN 加速
- ✅ 持久化存储，数据永不丢失
- ✅ 免费额度足够个人使用

**⚠️ 重要提示**：部署完成后，需要在 Zeabur 中为 LunaTV 服务设置访问域名（Domain）才能在浏览器中访问。详见下方 [设置访问域名](#5-设置访问域名必须) 步骤。

### Kvrocks 存储（推荐）

```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=kvrocks
      - KVROCKS_URL=redis://moontv-kvrocks:6666
    networks:
      - moontv-network
    depends_on:
      - moontv-kvrocks
  moontv-kvrocks:
    image: apache/kvrocks
    container_name: moontv-kvrocks
    restart: unless-stopped
    volumes:
      - kvrocks-data:/var/lib/kvrocks
    networks:
      - moontv-network
networks:
  moontv-network:
    driver: bridge
volumes:
  kvrocks-data:
```

### Redis 存储（有一定的丢数据风险）

```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=redis
      - REDIS_URL=redis://moontv-redis:6379
    networks:
      - moontv-network
    depends_on:
      - moontv-redis
  moontv-redis:
    image: redis:alpine
    container_name: moontv-redis
    restart: unless-stopped
    networks:
      - moontv-network
    # 请开启持久化，否则升级/重启后数据丢失
    volumes:
      - ./data:/data
networks:
  moontv-network:
    driver: bridge
```

### Upstash 存储

1. 在 [upstash](https://upstash.com/) 注册账号并新建一个 Redis 实例，名称任意。
2. 复制新数据库的 **HTTPS ENDPOINT 和 TOKEN**
3. 使用如下 docker compose

```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=upstash
      - UPSTASH_URL=上面 https 开头的 HTTPS ENDPOINT
      - UPSTASH_TOKEN=上面的 TOKEN
```

### ☁️ Zeabur 部署（推荐）

Thanks to @SzeMeng76

Zeabur 是一站式云端部署平台，使用预构建的 Docker 镜像可以快速部署，无需等待构建。

**部署步骤：**

1. **添加 KVRocks 服务**（先添加数据库）

   - 点击 "Add Service" > "Docker Images"
   - 输入镜像名称：`apache/kvrocks`
   - 配置端口：`6666` (TCP)
   - **记住服务名称**（通常是 `apachekvrocks`）
   - **配置持久化卷（重要）**：
     - 在服务设置中找到 "Volumes" 部分
     - 点击 "Add Volume" 添加新卷
     - Volume ID: `kvrocks-data`（可自定义，仅支持字母、数字、连字符）
     - Path: `/var/lib/kvrocks/db`
     - 保存配置

   > 💡 **重要提示**：持久化卷路径必须设置为 `/var/lib/kvrocks/db`（KVRocks 数据目录），这样配置文件保留在容器内，数据库文件持久化，重启后数据不会丢失！

2. **添加 LunaTV 服务**

   - 点击 "Add Service" > "Docker Images"
   - 输入镜像名称：`ghcr.io/moontechlab/lunatv:latest`
   - 配置端口：`3000` (HTTP)

3. **配置环境变量**

   在 LunaTV 服务的环境变量中添加：

   ```env
   # 必填：管理员账号
   USERNAME=admin
   PASSWORD=your_secure_password

   # 必填：存储配置
   NEXT_PUBLIC_STORAGE_TYPE=kvrocks
   KVROCKS_URL=redis://apachekvrocks:6666

   # 可选：站点配置
   SITE_BASE=https://your-domain.zeabur.app
   NEXT_PUBLIC_SITE_NAME=LunaTV Enhanced
   ANNOUNCEMENT=欢迎使用 LunaTV Enhanced Edition

   # 可选：豆瓣代理配置（推荐）
   NEXT_PUBLIC_DOUBAN_PROXY_TYPE=cmliussss-cdn-tencent
   NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE=cmliussss-cdn-tencent
   ```

   **注意**：

   - 使用服务名称作为主机名：`redis://apachekvrocks:6666`
   - 如果服务名称不同，请替换为实际名称
   - 两个服务必须在同一个 Project 中

4. **部署完成**
   - Zeabur 会自动拉取镜像并启动服务
   - 等待服务就绪后，需要手动设置访问域名（见下一步）

#### 5. 设置访问域名（必须）

- 在 LunaTV 服务页面，点击 "Networking" 或 "网络" 标签
- 点击 "Generate Domain" 生成 Zeabur 提供的免费域名（如 `xxx.zeabur.app`）
- 或者绑定自定义域名：
  - 点击 "Add Domain" 添加你的域名
  - 按照提示配置 DNS CNAME 记录指向 Zeabur 提供的目标地址
- 设置完域名后即可通过域名访问 LunaTV

6. **绑定自定义域名（可选）**
   - 在服务设置中点击 "Domains"
   - 添加你的自定义域名
   - 配置 DNS CNAME 记录指向 Zeabur 提供的域名

#### 🔄 更新 Docker 镜像

当 Docker 镜像有新版本发布时，Zeabur 不会自动更新。需要手动触发更新。

**更新步骤：**

1. **进入服务页面**

   - 点击需要更新的服务（LunaTV 或 KVRocks）

2. **重启服务**
   - 点击 **"服务状态"** 页面，再点击 **"重启当前版本"** 按钮
   - Zeabur 会自动拉取最新的 `latest` 镜像并重新部署

> 💡 **提示**：
>
> - 使用 `latest` 标签时，Restart 会自动拉取最新镜像
> - 生产环境推荐使用固定版本标签（如 `v5.5.6`）避免意外更新

### Cloudflare 部署（Workers / Pages）

MoonTV 支持部署到 Cloudflare，提供两种方案。**在 Cloudflare 上无法使用 TCP Redis / Kvrocks**，必须使用 **Upstash（HTTP Redis）** 作为存储后端（本项目已内置支持，凭据变量为 `UPSTASH_URL` + `UPSTASH_TOKEN`）。

#### ⭐ Cloudflare Pages（Git 集成，控制台填写，最稳、推荐）

在 CF 控制台 **Workers & Pages → 创建 / 连接 GitHub 仓库**，构建设置**只填这 4 项**：

| 控制台字段                       | 填写值                                            |
| -------------------------------- | ------------------------------------------------- |
| **Build command（构建命令）**    | `CF_BUILD=1 pnpm dlx @cloudflare/next-on-pages@1` |
| **Output directory（输出目录）** | `.vercel/output/static`                           |
| **Deploy command（部署命令）**   | **留空**（⚠️ 千万不要写 `npx wrangler deploy`）   |
| Node 版本（可选）                | 20 即可；想保险可设 22                            |

> 🚨 **致命误区（已踩坑）**：Pages Git 集成**不要**用 `npx wrangler deploy` 作部署命令。
> 平台会**自动发布「输出目录」里的内容**；`wrangler deploy` 是 **Workers** 的部署方式，
> 它会去找一个不存在的 Worker 入口，且 wrangler 4 强制要求 Node ≥22（构建镜像默认 20）直接报错
> `Wrangler requires at least Node.js v22.0.0`。同样，构建命令**不要**用 `pnpm run build`
> ——那产出的是 `.next`（standalone，给 Docker/render 用），不是 CF 要的 `.vercel/output/static`。
>
> `CF_BUILD=1` 让 `next.config.js` 跳过 `output:'standalone'`、保留原生 `crypto`（供 `nodejs_compat` 使用）；
> `next-on-pages` 内部跑 `next build` 并把产物转成 `.vercel/output/static`，**全程不调用 wrangler**，Node 22 问题自然消失。
>
> 构建期必须内联的变量（**Build environment variables**）：`NEXT_PUBLIC_STORAGE_TYPE=upstash`
> 运行时密钥（**Environment variables / Secrets**）：`UPSTASH_URL`、`UPSTASH_TOKEN`、`USERNAME`、`PASSWORD`（见下方矩阵）。

> 🔧 **排查：构建成功但部署失败，报 `Wrangler requires at least Node.js v22.0.0` / `Failed: error occurred while running deploy command`**
> 这说明你的 **Deploy command（部署命令）里仍写着 `npx wrangler deploy`**。立刻把它**清空留空**，并把：
>
> - **Build command** 改为 `CF_BUILD=1 pnpm dlx @cloudflare/next-on-pages@1`
> - **Output directory** 改为 `.vercel/output/static`
>
> Pages Git 集成会**自动发布「输出目录」里的内容**，不需要、也不该用 `wrangler deploy`。`wrangler deploy` 是 **Workers** 的部署方式，会去找不存在的 Worker 入口，且 wrangler 4 强制 Node ≥22（构建镜像默认 20）直接报错。`next-on-pages` 内部跑 `next build` 并把产物转成 `.vercel/output/static`，**全程不调用 wrangler**，Node 22 问题自然消失。

下面两节是**本地 CLI 等价命令**（如果你更习惯本地构建后上传，而非 Git 集成），与上面控制台填写二选一即可。

#### 方案 A：Cloudflare Workers（推荐，使用 OpenNext）

```bash
# 1. 安装适配层（仅首次；会写入 package.json + pnpm-lock.yaml）
pnpm cf:workers:install
# 等价于：pnpm add -D open-next @opennextjs/cloudflare

# 2. 构建（CF_BUILD=1 让 next.config 关闭 standalone、保留原生 crypto）
pnpm cf:workers:build
# 等价于：CF_BUILD=1 pnpm build && open-next build
# 产物输出到 .open-next/（worker.js + assets/）

# 3. 注入密钥（敏感信息用加密 Secret，不要写进 wrangler.jsonc）
pnpm cf:secret:workers
# 等价于分别执行 wrangler secret put UPSTASH_URL / UPSTASH_TOKEN / USERNAME / PASSWORD

# 4. 部署
pnpm cf:workers:deploy
# 等价于：pnpm dlx wrangler deploy（读取 wrangler.jsonc）
```

配置见 `wrangler.jsonc` 与 `open-next.config.ts`。

#### 方案 B：Cloudflare Pages（使用 next-on-pages）

```bash
# 1. 安装适配层（仅首次）
pnpm cf:pages:install
# 等价于：pnpm add -D @cloudflare/next-on-pages

# 2. 构建
pnpm cf:pages:build
# 等价于：CF_BUILD=1 pnpm build && pnpm exec @cloudflare/next-on-pages
# 产物输出到 .vercel/output/static

# 3. 注入密钥
pnpm cf:secret:pages
# 等价于分别执行 wrangler pages secret put UPSTASH_URL / UPSTASH_TOKEN / USERNAME / PASSWORD

# 4. 部署
pnpm cf:pages:deploy
# 等价于：pnpm dlx wrangler pages deploy .vercel/output/static

# 本地预览：pnpm cf:pages:dev
```

配置见 `wrangler.toml`。

#### 环境变量矩阵

MoonTV 的变量分两类，处理方式不同：

| 变量                                    | 类别       | 必填 | 注入方式                       | 说明                                 |
| --------------------------------------- | ---------- | ---- | ------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_STORAGE_TYPE`              | 构建期内联 | ✅   | **构建环境**导出               | 固定 `upstash`                       |
| `NEXT_PUBLIC_SITE_NAME`                 | 构建期内联 | ❌   | 构建环境导出                   | 站点名，默认 `MoonTV`                |
| `NEXT_PUBLIC_SEARCH_MAX_PAGE`           | 构建期内联 | ❌   | 构建环境导出                   | 默认 `5`                             |
| `NEXT_PUBLIC_DOUBAN_PROXY(_TYPE)`       | 构建期内联 | ❌   | 构建环境导出                   | 豆瓣代理                             |
| `NEXT_PUBLIC_DOUBAN_IMAGE_PROXY(_TYPE)` | 构建期内联 | ❌   | 构建环境导出                   | 豆瓣图片代理                         |
| `NEXT_PUBLIC_DISABLE_YELLOW_FILTER`     | 构建期内联 | ❌   | 构建环境导出                   | 默认 `false`                         |
| `NEXT_PUBLIC_FLUID_SEARCH`              | 构建期内联 | ❌   | 构建环境导出                   | 默认 `true`（见下）                  |
| `UPSTASH_URL`                           | 运行时密钥 | ✅   | `wrangler secret put`          | Upstash REST 地址                    |
| `UPSTASH_TOKEN`                         | 运行时密钥 | ✅   | `wrangler secret put`          | Upstash Token                        |
| `USERNAME`                              | 运行时密钥 | ✅   | `wrangler secret put`          | 站长用户名；**不设置则后台裸奔**     |
| `PASSWORD`                              | 运行时密钥 | ✅   | `wrangler secret put`          | 站长密码；**不设置则任何人可进后台** |
| `ANNOUNCEMENT`                          | 运行时变量 | ❌   | `wrangler secret put` / `vars` | 公告文案                             |

> **`NEXT_PUBLIC_*` 是构建期内联变量**：必须在 `next build` / `open-next build` 阶段的**环境**中 export（CI 变量或本地 shell），仅写在 `wrangler.jsonc` 的 `vars` 里**不会**内联进客户端包，前端会回退到 `localstorage` 导致 Upstash 失效。可在 `wrangler.toml` / `wrangler.jsonc` 的 `vars` 里同时保留一份供服务端运行时读取。
>
> **`USERNAME` / `PASSWORD` 强烈建议必填**：代码中 `if (!process.env.PASSWORD)` 会直接放行鉴权，不设等于开放后台。

本地开发可复制 `.dev.vars.example` 为 `.dev.vars` 填入上述值（`wrangler dev` 会自动读取）。

#### 兼容性与注意事项

- **运行时**：所有 API route 声明 `runtime = 'nodejs'`，Cloudflare 通过 `compatibility_flags = ["nodejs_compat"]` 兼容；`next.config.js` 中 `output: 'standalone'` 与 `crypto: false` 仅在非 Cloudflare 构建（`CF_BUILD` 未设置）时生效，不影响现有 Docker / render 部署；Cloudflare 构建走原生 `node:crypto`（scrypt 密码哈希）无需改动。
- **存储**：务必使用 Upstash（HTTP Redis）；TCP Redis / Kvrocks 在 Cloudflare 上不可用。
- **流式搜索 `/api/search/ws`**：该路由使用的是 `ReadableStream` 流式 HTTP 响应（SSE 式），**并非** WebSocket 升级，Cloudflare Workers 原生支持流式响应，因此默认可用，无需关闭 `NEXT_PUBLIC_FLUID_SEARCH`。注意长耗时流受 Worker CPU 时长限制（免费版 10s / 付费可调至 30s+）。
- **代理类路由**：`/api/proxy/m3u8`、`/api/proxy/segment`、`/api/image-proxy` 等会在服务端转发外部流量，受 Worker CPU / 响应大小限制，超长直播切片转发可能触顶，必要时用更高套餐或自建代理。
- **定时任务（订阅自动更新）**：`/api/cron` 用于刷新订阅配置。Cloudflare 上可用 **Cron Triggers**（`wrangler.toml` 的 `[triggers] cron = [...]`，或控制台配置）定时调用该接口；当前路由无独立 token 鉴权，务必配合 `USERNAME/PASSWORD` 与平台访问控制使用。
- **PWA**：`next-pwa` 生成的 `public/sw.js` 会作为静态资源随构建发布，通常无需额外处理。
- **兼容性日期**：`compatibility_date` 设为 `2024-09-23`（可按需上调），确保 `nodejs_compat` 行为稳定。

## 配置文件

完成部署后为空壳应用，无播放源，需要站长在管理后台的配置文件设置中填写配置文件（后续会支持订阅）

配置文件示例如下：

```json
{
  "cache_time": 7200,
  "api_site": {
    "dyttzy": {
      "api": "http://xxx.com/api.php/provide/vod",
      "name": "示例资源",
      "detail": "http://xxx.com"
    }
    // ...更多站点
  },
  "custom_category": [
    {
      "name": "华语",
      "type": "movie",
      "query": "华语"
    }
  ]
}
```

- `cache_time`：接口缓存时间（秒）。
- `api_site`：你可以增删或替换任何资源站，字段说明：
  - `key`：唯一标识，保持小写字母/数字。
  - `api`：资源站提供的 `vod` JSON API 根地址。
  - `name`：在人机界面中展示的名称。
  - `detail`：（可选）部分无法通过 API 获取剧集详情的站点，需要提供网页详情根 URL，用于爬取。
- `custom_category`：自定义分类配置，用于在导航中添加个性化的影视分类。以 type + query 作为唯一标识。支持以下字段：
  - `name`：分类显示名称（可选，如不提供则使用 query 作为显示名）
  - `type`：分类类型，支持 `movie`（电影）或 `tv`（电视剧）
  - `query`：搜索关键词，用于在豆瓣 API 中搜索相关内容

custom_category 支持的自定义分类已知如下：

- movie：热门、最新、经典、豆瓣高分、冷门佳片、华语、欧美、韩国、日本、动作、喜剧、爱情、科幻、悬疑、恐怖、治愈
- tv：热门、美剧、英剧、韩剧、日剧、国产剧、港剧、日本动画、综艺、纪录片

也可输入如 "哈利波特" 效果等同于豆瓣搜索

MoonTV 支持标准的苹果 CMS V10 API 格式。

## 订阅

将完整的配置文件 base58 编码后提供 http 服务即为订阅链接，可在 MoonTV 后台/Helios 中使用。

此外，后台「配置订阅」现已兼容 **TVBox / 影视仓** 风格的标准 JSON 订阅（如 `tvbox.json`）。系统会自动将其转换为 MoonTV 配置：

- **视频源**：仅导入标准苹果 CMS 接口（`type` 为 0 / 1 / 4 且 `api` 为 `http(s)` 地址）；`type:3` 的爬虫源（`.py` / `csp_XBPQ` 等）与特殊解析源会被自动跳过，因为它们依赖影视仓自带的爬虫运行时，MoonTV 无法消费。
- **直播源**：`lives` 数组中的每个条目（支持一行多个 m3u 地址）会被拆分为独立的 MoonTV 直播源，并保留 `ua` / `epg` 字段。
- 转换在「解码边界」完成，原有配置文件结构与播放链路保持不变，风险可控。

> 注意：很多短剧类 TVBox 订阅几乎全为 `type:3` 爬虫源且 `lives` 为空，导入后 MoonTV 可能拿不到可用源——这属于格式兼容边界，并非程序异常。

## 自动更新

可借助 [watchtower](https://github.com/containrrr/watchtower) 自动更新镜像容器

dockge/komodo 等 docker compose UI 也有自动更新功能

## 环境变量

| 变量                                | 说明                     | 可选值                   | 默认值                                                                                                                     |
| ----------------------------------- | ------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| USERNAME                            | 站长账号                 | 任意字符串               | 无默认，必填字段                                                                                                           |
| PASSWORD                            | 站长密码                 | 任意字符串               | 无默认，必填字段                                                                                                           |
| SITE_BASE                           | 站点 url                 | 形如 https://example.com | 空                                                                                                                         |
| NEXT_PUBLIC_SITE_NAME               | 站点名称                 | 任意字符串               | MoonTV                                                                                                                     |
| ANNOUNCEMENT                        | 站点公告                 | 任意字符串               | 本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。 |
| NEXT_PUBLIC_STORAGE_TYPE            | 播放记录/收藏的存储方式  | redis、kvrocks、upstash  | 无默认，必填字段                                                                                                           |
| KVROCKS_URL                         | kvrocks 连接 url         | 连接 url                 | 空                                                                                                                         |
| REDIS_URL                           | redis 连接 url           | 连接 url                 | 空                                                                                                                         |
| UPSTASH_URL                         | upstash redis 连接 url   | 连接 url                 | 空                                                                                                                         |
| UPSTASH_TOKEN                       | upstash redis 连接 token | 连接 token               | 空                                                                                                                         |
| NEXT_PUBLIC_SEARCH_MAX_PAGE         | 搜索接口可拉取的最大页数 | 1-50                     | 5                                                                                                                          |
| NEXT_PUBLIC_DOUBAN_PROXY_TYPE       | 豆瓣数据源请求方式       | 见下方                   | direct                                                                                                                     |
| NEXT_PUBLIC_DOUBAN_PROXY            | 自定义豆瓣数据代理 URL   | url prefix               | (空)                                                                                                                       |
| NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE | 豆瓣图片代理类型         | 见下方                   | direct                                                                                                                     |
| NEXT_PUBLIC_DOUBAN_IMAGE_PROXY      | 自定义豆瓣图片代理 URL   | url prefix               | (空)                                                                                                                       |
| NEXT_PUBLIC_DISABLE_YELLOW_FILTER   | 关闭色情内容过滤         | true/false               | false                                                                                                                      |
| NEXT_PUBLIC_FLUID_SEARCH            | 是否开启搜索接口流式输出 | true/ false              | true                                                                                                                       |

NEXT_PUBLIC_DOUBAN_PROXY_TYPE 选项解释：

- direct: 由服务器直接请求豆瓣源站
- cors-proxy-zwei: 浏览器向 cors proxy 请求豆瓣数据，该 cors proxy 由 [Zwei](https://github.com/bestzwei) 搭建
- cmliussss-cdn-tencent: 浏览器向豆瓣 CDN 请求数据，该 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，并由腾讯云 cdn 提供加速
- cmliussss-cdn-ali: 浏览器向豆瓣 CDN 请求数据，该 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，并由阿里云 cdn 提供加速
- custom: 用户自定义 proxy，由 NEXT_PUBLIC_DOUBAN_PROXY 定义

NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE 选项解释：

- direct：由浏览器直接请求豆瓣分配的默认图片域名
- server：由服务器代理请求豆瓣分配的默认图片域名
- img3：由浏览器请求豆瓣官方的精品 cdn（阿里云）
- cmliussss-cdn-tencent：由浏览器请求豆瓣 CDN，该 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，并由腾讯云 cdn 提供加速
- cmliussss-cdn-ali：由浏览器请求豆瓣 CDN，该 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，并由阿里云 cdn 提供加速
- custom: 用户自定义 proxy，由 NEXT_PUBLIC_DOUBAN_IMAGE_PROXY 定义

## 客户端

v100.0.0 以上版本可配合 [Selene](https://github.com/MoonTechLab/Selene) 使用，移动端体验更加友好，数据完全同步

## AndroidTV 使用

目前该项目可以配合 [OrionTV](https://github.com/zimplexing/OrionTV) 在 Android TV 上使用，可以直接作为 OrionTV 后端

已实现播放记录和网页端同步

## 安全与隐私提醒

### 请设置密码保护并关闭公网注册

为了您的安全和避免潜在的法律风险，我们要求在部署时**强烈建议关闭公网注册**：

### 部署要求

1. **设置环境变量 `PASSWORD`**：为您的实例设置一个强密码
2. **仅供个人使用**：请勿将您的实例链接公开分享或传播
3. **遵守当地法律**：请确保您的使用行为符合当地法律法规

### 重要声明

- 本项目仅供学习和个人使用
- 请勿将部署的实例用于商业用途或公开服务
- 如因公开分享导致的任何法律问题，用户需自行承担责任
- 项目开发者不对用户的使用行为承担任何法律责任
- 本项目不在中国大陆地区提供服务。如有该项目在向中国大陆地区提供服务，属个人行为。在该地区使用所产生的法律风险及责任，属于用户个人行为，与本项目无关，须自行承担全部责任。特此声明

## License

[MIT](LICENSE) © 2025 MoonTV & Contributors

## 致谢

- [ts-nextjs-tailwind-starter](https://github.com/theodorusclarence/ts-nextjs-tailwind-starter) — 项目最初基于该脚手架。
- [LibreTV](https://github.com/LibreSpark/LibreTV) — 由此启发，站在巨人的肩膀上。
- [ArtPlayer](https://github.com/zhw2590582/ArtPlayer) — 提供强大的网页视频播放器。
- [HLS.js](https://github.com/video-dev/hls.js) — 实现 HLS 流媒体在浏览器中的播放支持。
- [Zwei](https://github.com/bestzwei) — 提供获取豆瓣数据的 cors proxy
- [CMLiussss](https://github.com/cmliu) — 提供豆瓣 CDN 服务
- 感谢所有提供免费影视接口的站点。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=MoonTechLab/LunaTV&type=Date)](https://www.star-history.com/#MoonTechLab/LunaTV&Date)
