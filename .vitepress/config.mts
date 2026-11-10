import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: 'kdk-commerce · 프로젝트 문서',
  description: '요구사항과 설계를 읽고 검토하는 문서 화면',
  cleanUrls: true,
  appearance: false,
  srcExclude: ['node_modules/**', 'output/**', 'tmp/**'],
  rewrites: { 'README.md': 'index.md' },
  scrollOffset: { selector: '.reader-header', padding: 24 },
  markdown: {
    headers: { level: [2, 3] },
    config(markdown) {
      const renderLink = markdown.renderer.rules.link_open
      markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
        const href = tokens[index].attrGet('href')
        if (href && /(?:^|\/)AGENTS\.MD(?:#|$)/.test(href)) {
          const fragment = href.includes('#') ? href.slice(href.indexOf('#')) : ''
          tokens[index].attrSet('href', `/viewer/project-guide${fragment}`)
        }
        return renderLink
          ? renderLink(tokens, index, options, environment, renderer)
          : renderer.renderToken(tokens, index, options)
      }

      markdown.renderer.rules.table_open = () =>
        '<div class="table-scroll" tabindex="0" role="region" aria-label="표"><table>\n'
      markdown.renderer.rules.table_close = () => '</table></div>\n'

      const renderFence = markdown.renderer.rules.fence!
      markdown.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
        if (tokens[index].info.trim() === 'mermaid') {
          const source = markdown.utils.escapeHtml(JSON.stringify(tokens[index].content))
          return `<MermaidDiagram :source="${source}" />\n`
        }
        return renderFence(tokens, index, options, environment, renderer)
      }
    }
  }
})
