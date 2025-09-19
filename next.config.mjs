/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false, // заглушка
    };
    return config;
  },
};
export default nextConfig;
