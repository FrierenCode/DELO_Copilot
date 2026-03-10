/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress Sentry/OpenTelemetry "Critical dependency" warnings from
      // dynamic require() calls inside @opentelemetry/instrumentation.
      config.ignoreWarnings = [
        ...(config.ignoreWarnings ?? []),
        { module: /@opentelemetry\/instrumentation/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
