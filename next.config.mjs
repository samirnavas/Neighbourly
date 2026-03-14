/** @type {import('next').NextConfig} */
const nextConfig = {
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Optionally ignore TypeScript errors too, just to be safe
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;