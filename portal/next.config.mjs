/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Server components call backends directly via internal Docker hostnames.
  // Client components use NEXT_PUBLIC_ vars pointing to localhost ports.
};

export default nextConfig;
