const path = require('path');
const isVercel = !!process.env.VERCEL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // В локалке можно трейсить за пределы пакета, на Vercel отключаем — иначе дублируется /path0/path0
  ...(isVercel ? {} : { outputFileTracingRoot: path.resolve(__dirname, '..') }),
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    return config;
  },
};

module.exports = nextConfig;
