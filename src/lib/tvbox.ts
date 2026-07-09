/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TVBox / 影视仓 订阅兼容层
 *
 * 目标：在不改动 MoonTV 原有配置结构（ConfigFileStruct）与 refineConfig 的前提下，
 * 让「订阅」既能导入原生 MoonTV 订阅（Base58 编码的 JSON），也能导入 TVBox / 影视仓
 * 风格的纯 JSON 配置。所有转换都在「解码边界」完成：外部订阅 → 规范化后的 MoonTV
 * 配置文件 JSON（api_site / lives / custom_category），下游消费方无需任何改动。
 *
 * 兼容性边界（务必知悉）：
 * - TVBox 的 `sites` 中，仅 `type` 为 0 / 1 / 4 且 `api` 为绝对 http(s) URL 的标准
 *   苹果 CMS 类接口可被 MoonTV 直接消费；`type:3`（py / js / csp_XBPQ 爬虫源）、
 *   `type:2`（豆瓣等特殊源）以及 `api` 为相对字符串（如 csp_XBPQ）的源无法被 MoonTV
 *   的视频搜索侧消费，会被自动跳过。
 * - TVBox 的 `lives` 为数组（每个条目可能含多行 m3u 地址），会拆分成多条 MoonTV 直播源。
 * - `spider` / `rules` / `parses` / `ijk` / `ads` / `wallpaper` 等 TVBox 专属字段与
 *   视频解析器无关，直接忽略。
 */

export type SubFormat = 'moontv' | 'tvbox' | 'unknown';

export interface TvboxSite {
  key?: string;
  name?: string;
  type?: number;
  api?: string;
  detail?: string;
  [k: string]: any;
}

export interface TvboxLive {
  name?: string;
  url?: string; // 允许包含多行 m3u 地址，每行一个
  ua?: string;
  epg?: string;
  type?: number;
  [k: string]: any;
}

export interface TvboxConfig {
  spider?: string;
  sites?: TvboxSite[];
  lives?: TvboxLive[];
  [k: string]: any;
}

export interface DecodeSummary {
  sitesConverted: number;
  sitesSkipped: number;
  livesConverted: number;
  message: string;
}

export interface DecodeResult {
  ok: boolean;
  /** 规范化后的 MoonTV 配置文件 JSON 字符串 */
  configFile?: string;
  format?: SubFormat;
  summary?: DecodeSummary;
  error?: string;
}

function isUrl(s?: string): boolean {
  return !!s && /^https?:\/\//i.test(s.trim());
}

/**
 * 生成合法的 MoonTV 资源 key：小写字母/数字/下划线，去除首尾下划线，并保证唯一。
 */
function sanitizeKey(input: string, used: Set<string>): string {
  const base =
    (input || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'src';
  let key = base;
  let i = 1;
  while (used.has(key)) {
    key = `${base}_${i++}`;
  }
  used.add(key);
  return key;
}

export function isTvboxConfig(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (Array.isArray(obj.sites)) return true;
  if (Array.isArray(obj.lives)) return true;
  if ('spider' in obj || 'parses' in obj || 'rules' in obj || 'ijk' in obj) {
    return true;
  }
  return false;
}

export function isMoonTvConfig(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (obj.api_site && typeof obj.api_site === 'object' && !Array.isArray(obj.api_site)) {
    return true;
  }
  // MoonTV 的 lives 是对象（map）；TVBox 的 lives 是数组，已在 isTvboxConfig 拦截
  if (obj.lives && typeof obj.lives === 'object' && !Array.isArray(obj.lives)) {
    return true;
  }
  if (Array.isArray(obj.custom_category)) return true;
  if (typeof obj.cache_time === 'number') return true;
  return false;
}

/**
 * 将 TVBox / 影视仓 配置转换为 MoonTV 配置文件结构。
 * 仅映射可兼容的视频源与直播源；其余字段忽略。
 */
export function tvboxToConfigFileStruct(tvbox: TvboxConfig): {
  config: Record<string, any>;
  summary: DecodeSummary;
} {
  const used = new Set<string>();
  const api_site: Record<string, any> = {};
  let sitesConverted = 0;
  let sitesSkipped = 0;

  (tvbox.sites || []).forEach((site) => {
    const api = (site.api || '').trim();
    const type = site.type;
    // 仅标准苹果 CMS 类接口（type 0/1/4）且 api 为绝对 http(s) URL 可兼容
    const compatibleType = type === 0 || type === 1 || type === 4;
    if (compatibleType && isUrl(api)) {
      const key = sanitizeKey(site.key || site.name || api, used);
      api_site[key] = {
        key,
        name: site.name || site.key || api,
        api,
        detail: site.detail || undefined,
      };
      sitesConverted++;
    } else {
      sitesSkipped++;
    }
  });

  const lives: Record<string, any> = {};
  let livesConverted = 0;
  (tvbox.lives || []).forEach((live, idx) => {
    const name = live.name || `直播源${idx + 1}`;
    const urls = (live.url || '')
      .split(/\r?\n/)
      .map((u: string) => u.trim())
      .filter((u: string) => isUrl(u));
    urls.forEach((u: string, j: number) => {
      const key = sanitizeKey(`${live.name || 'live'}_${idx}_${j}`, used);
      lives[key] = {
        name: urls.length > 1 ? `${name} (${j + 1})` : name,
        url: u,
        ua: live.ua || undefined,
        epg: live.epg || undefined,
      };
      livesConverted++;
    });
  });

  const config: Record<string, any> = {};
  if (typeof tvbox.cache_time === 'number') {
    config.cache_time = tvbox.cache_time;
  }
  if (sitesConverted > 0) config.api_site = api_site;
  if (livesConverted > 0) config.lives = lives;

  const message = `已识别为 TVBox / 影视仓 配置：转换视频源 ${sitesConverted} 个（跳过 ${sitesSkipped} 个爬虫/特殊源），直播源 ${livesConverted} 个。`;
  return { config, summary: { sitesConverted, sitesSkipped, livesConverted, message } };
}

async function tryBs58Decode(text: string): Promise<string | null> {
  try {
    const bs58Mod = await import('bs58');
    const bs58 = (bs58Mod as any).default || bs58Mod;
    const bytes = bs58.decode(text.trim());
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function tryParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 统一解析订阅内容。
 * 1) 先尝试直接当作 JSON 解析（TVBox 订阅 / 明文 MoonTV 配置）；
 * 2) 否则尝试 Base58 解码（原生 MoonTV 订阅），再解析 JSON；
 * 3) 根据结构判断为 TVBox 还是 MoonTV，并归一化为 MoonTV 配置文件 JSON。
 *
 * 返回归一化后的 ConfigFile JSON 字符串（不论何种来源，下游 refineConfig 都能直接消费）。
 */
export async function decodeSubscription(raw: string): Promise<DecodeResult> {
  const text = (raw || '').trim();
  if (!text) {
    return { ok: false, error: '订阅内容为空' };
  }

  let parsed: any = tryParseJson(text);
  if (!parsed) {
    const decoded = await tryBs58Decode(text);
    if (decoded) parsed = tryParseJson(decoded);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      error: '无法解析订阅内容：既不是合法 JSON，也不是 Base58 编码的 JSON',
    };
  }

  if (isTvboxConfig(parsed)) {
    const { config, summary } = tvboxToConfigFileStruct(parsed as TvboxConfig);
    return {
      ok: true,
      format: 'tvbox',
      configFile: JSON.stringify(config, null, 2),
      summary,
    };
  }

  if (isMoonTvConfig(parsed)) {
    const sites = Object.keys((parsed.api_site as any) || {}).length;
    const lives = Object.keys((parsed.lives as any) || {}).length;
    return {
      ok: true,
      format: 'moontv',
      configFile: JSON.stringify(parsed, null, 2),
      summary: {
        sitesConverted: sites,
        sitesSkipped: 0,
        livesConverted: lives,
        message: '已识别为 MoonTV 原生配置。',
      },
    };
  }

  return {
    ok: false,
    error: '无法识别的配置格式（未找到 sites / api_site / lives）',
  };
}
