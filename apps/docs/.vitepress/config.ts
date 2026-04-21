import { defineConfig } from 'vitepress';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let typedocSidebar: { text: string; link?: string; items?: unknown[] }[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  typedocSidebar = require('../../api/typedoc-sidebar.json') as typeof typedocSidebar;
} catch {
  // sidebar not yet generated — first run
}

export default defineConfig({
  title: 'kettle-mcp',
  description: 'MCP server for Pentaho Kettle job and transformation management',
  base: '/kettle-mcp/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { property: 'og:title', content: 'kettle-mcp' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'MCP server for Pentaho Kettle job and transformation management'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://pradeepmouli.github.io/kettle-mcp/' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'kettle-mcp' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'MCP server for Pentaho Kettle job and transformation management'
      }
    ]
  ],
  sitemap: {
    hostname: 'https://pradeepmouli.github.io/kettle-mcp'
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/pradeepmouli/kettle-mcp' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' }
          ]
        }
      ],
      '/api/': [{ text: 'API Reference', items: typedocSidebar }]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/pradeepmouli/kettle-mcp' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Pradeep Mouli'
    },
    search: { provider: 'local' }
  }
});
