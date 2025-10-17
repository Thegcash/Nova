/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/experiments", permanent: true },
    ];
  },
};
module.exports = nextConfig;