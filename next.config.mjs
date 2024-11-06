/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/umami.js",
        destination: "http://145.223.79.119:3000/script.js",
      },
    ];
  },
};

export default nextConfig;
