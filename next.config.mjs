/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfmake', 'pdfkit'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/pdfkit/js/data/**/*']
    }
  }
};

export default nextConfig;
