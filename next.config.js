/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */

// Cloudflare 部署（OpenNext / next-on-pages）构建时，CI/脚本会注入 CF_BUILD=1：
// - 不产出 standalone 服务器（交由 Cloudflare 适配器处理输出）
// - 不把 node:crypto 兜底为 false（Cloudflare nodejs_compat 需要原生 crypto）
// 未设置时保持原行为，render / Docker 部署完全不受影响。
const isCloudflare = process.env.CF_BUILD === '1';

const nextConfig = {
  ...(isCloudflare ? {} : { output: 'standalone' }),
  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: false,
  swcMinify: false,

  experimental: {
    instrumentationHook: process.env.NODE_ENV === 'production',
  },

  // Uncoment to add domain whitelist
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
          titleProp: true,
        },
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
    };
    // Cloudflare（nodejs_compat）需原生 crypto，不能置为 false；其余平台保持原兜底
    if (!isCloudflare) {
      config.resolve.fallback.crypto = false;
    }

    return config;
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
