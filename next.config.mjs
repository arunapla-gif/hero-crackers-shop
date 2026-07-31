/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfmake', 'pdfkit'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/pdfkit/js/data/**/*']
  }
};

export default nextConfig;
