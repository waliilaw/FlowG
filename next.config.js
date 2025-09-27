/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    if (!isServer) {
      // Disable Node.js modules in browser
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: false,
        'fs/promises': false,
        child_process: false,
      };
      
      // Provide fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        fs: false,
        'fs/promises': false,
        child_process: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;