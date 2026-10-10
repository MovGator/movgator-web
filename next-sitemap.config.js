/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/server-sitemap.xml',
    '/api/*',
    '/_next/*',
    '/static/*',
    '/*.json',
    '/*.xml',
    '/*.txt',
    // Exclude auth-required app routes
    '/home',
    '/dice',
    '/movie-night',
    '/movie-night/*',
    '/onboarding',
    '/discover',
    '/watchlist',
    '/profile',
    '/title/*',
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/_next/', '/static/', '/auth/', '/profile', '/home', '/dice', '/movie-night', '/onboarding', '/discover', '/watchlist', '/title/'] },
    ],
    additionalSitemaps: [`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sitemap.xml`],
  },
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  lastmod: new Date().toISOString(),
  transform: async (config, path) => {
    const priorityMap = {
      '/': 1.0,
      '/features': 0.8,
      '/how-it-works': 0.8,
      '/use-cases': 0.7,
      '/about': 0.6,
      '/get-started': 0.8,
      '/faq': 0.6,
      '/contact': 0.5,
      '/privacy': 0.3,
      '/terms': 0.3,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorityMap[path] ?? config.priority,
      lastmod: config.lastmod,
    };
  },
};