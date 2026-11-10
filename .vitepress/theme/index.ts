import type { Theme } from 'vitepress'
import MermaidDiagram from './MermaidDiagram.vue'
import ReaderLayout from './ReaderLayout.vue'
import './style.css'

export default {
  Layout: ReaderLayout,
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram)
  }
} satisfies Theme
