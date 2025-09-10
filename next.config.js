const path = require('path');
const isVercel = !!process.env.VERCEL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // В локалке можно трейсить за пределы пакета, на Vercel отключаем — иначе дублируется /path0/path0
  ...(isVercel ? {} : { outputFileTracingRoot: path.resolve(__dirname, '..') }),
};

module.exports = nextConfig;
