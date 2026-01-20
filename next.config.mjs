const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https://cdnjs.cloudflare.com; frame-src 'self' blob: data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
