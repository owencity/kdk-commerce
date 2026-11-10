<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Content, onContentUpdated, useData, withBase } from 'vitepress'

const documents = [
  { title: '소개', href: '/', page: 'index.md', source: 'README.md' },
  { title: '문제정의서', href: '/docs/01-problem', page: 'docs/01-problem.md' },
  { title: '요구사항', href: '/docs/02-requirements', page: 'docs/02-requirements.md' },
  { title: '프로젝트 지침', href: '/viewer/project-guide', page: 'viewer/project-guide.md', source: 'AGENTS.MD' }
]

const { page, site } = useData()
const currentDocument = computed(() => documents.find(document => document.page === page.value.relativePath))
const sourcePath = computed(() => currentDocument.value?.source ?? page.value.filePath)

interface Section {
  slug: string
  title: string
  link: string
  level: number
}

const sections = ref<Section[]>((page.value.headers ?? []).flatMap(heading => [heading, ...heading.children]))

const topBar = ref<HTMLElement | null>(null)
const sidebar = ref<HTMLElement | null>(null)
const outline = ref<HTMLElement | null>(null)
const article = ref<HTMLElement | null>(null)
const activeSection = ref('')
const compact = ref(false)
const navigationOpen = ref(false)
let compactScreen: MediaQueryList | undefined
let scrollFrame = 0
let headings: HTMLElement[] = []

function documentHref(path: string) {
  return withBase(path.endsWith('/') || site.value.cleanUrls ? path : path + '.html')
}

function openNavigation() {
  if (sidebar.value instanceof HTMLDialogElement) {
    sidebar.value.showModal()
    navigationOpen.value = true
    revealActiveSection()
  }
}

function closeNavigation() {
  if (sidebar.value instanceof HTMLDialogElement) {
    sidebar.value.close()
  }
}

function onNavigationClose() {
  navigationOpen.value = false
}

function updateViewport() {
  closeNavigation()
  navigationOpen.value = false
  compact.value = compactScreen?.matches ?? false
}

function refreshSections() {
  // Included Markdown can update the rendered headings without replacing VitePress page data.
  headings = Array.from(article.value?.querySelectorAll<HTMLElement>('h2[id], h3[id]') ?? [])
  sections.value = headings.map(heading => {
    const title = heading.cloneNode(true) as HTMLElement
    title.querySelector('.header-anchor')?.remove()
    return {
      slug: heading.id,
      title: title.textContent?.trim() ?? '',
      link: '#' + encodeURIComponent(heading.id),
      level: heading.tagName === 'H3' ? 3 : 2
    }
  })
  scheduleActiveSection()
}

function scheduleActiveSection() {
  if (!scrollFrame) {
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0
      const readingLine = (topBar.value?.getBoundingClientRect().bottom ?? 0) + 40
      let section = ''
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > readingLine) break
        section = heading.id
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        section = headings[headings.length - 1]?.id ?? section
      }
      activeSection.value = section
    })
  }
}

function revealActiveSection() {
  const list = outline.value
  const link = list?.querySelector('[aria-current="location"]')
  if (!list || !link || !list.clientHeight) return

  const listBounds = list.getBoundingClientRect()
  const linkBounds = link.getBoundingClientRect()
  if (linkBounds.top < listBounds.top) {
    list.scrollTop -= listBounds.top - linkBounds.top
  } else if (linkBounds.bottom > listBounds.bottom) {
    list.scrollTop += linkBounds.bottom - listBounds.bottom
  }
}

onMounted(() => {
  compactScreen = window.matchMedia('(max-width: 900px)')
  updateViewport()
  compactScreen.addEventListener('change', updateViewport)
  window.addEventListener('scroll', scheduleActiveSection, { passive: true })
  window.addEventListener('resize', scheduleActiveSection)
  refreshSections()
})

onUnmounted(() => {
  compactScreen?.removeEventListener('change', updateViewport)
  window.removeEventListener('scroll', scheduleActiveSection)
  window.removeEventListener('resize', scheduleActiveSection)
  cancelAnimationFrame(scrollFrame)
})

onContentUpdated(refreshSections)
watch(() => page.value.relativePath, () => {
  if (outline.value) outline.value.scrollTop = 0
})
watch([activeSection, sections], revealActiveSection, { flush: 'post' })
</script>

<template>
  <a class="reader-skip" href="#reader-main" target="_self">본문으로 건너뛰기</a>
  <header ref="topBar" class="reader-header">
    <a class="reader-brand" :href="withBase('/')" aria-label="kdk-commerce 문서 홈">
      <span class="reader-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3.5 5.5h4.25A4.25 4.25 0 0 1 12 9.75V20a4.25 4.25 0 0 0-4.25-4.25H3.5zM20.5 5.5h-4.25A4.25 4.25 0 0 0 12 9.75V20a4.25 4.25 0 0 1 4.25-4.25h4.25z" />
        </svg>
      </span>
      <span>kdk-commerce</span>
    </a>
    <span class="reader-header-label">프로젝트 문서</span>
    <span class="reader-local"><span aria-hidden="true"></span>로컬 문서</span>
    <button
      v-if="compact"
      class="reader-button reader-menu"
      type="button"
      aria-haspopup="dialog"
      aria-controls="reader-navigation"
      :aria-expanded="navigationOpen"
      @click="openNavigation"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true">
        <path d="M3.5 5h13m-13 5h13m-13 5h13" />
      </svg>
      <span>목차</span>
    </button>
  </header>

  <div class="reader-layout">
    <component
      :is="compact ? 'dialog' : 'aside'"
      id="reader-navigation"
      ref="sidebar"
      class="reader-sidebar"
      :aria-labelledby="compact ? 'reader-drawer-title' : undefined"
      @click.self="closeNavigation"
      @close="onNavigationClose"
    >
      <div class="reader-sidebar-content">
        <div v-if="compact" class="reader-drawer-header">
          <strong id="reader-drawer-title">문서 탐색</strong>
          <button class="reader-button" type="button" aria-label="목차 닫기" autofocus @click="closeNavigation">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        <nav class="reader-documents" aria-labelledby="reader-documents-label">
          <p id="reader-documents-label" class="reader-sidebar-label">문서</p>
          <ul>
            <li v-for="entry in documents" :key="entry.href">
              <a :href="documentHref(entry.href)" :aria-current="entry === currentDocument ? 'page' : undefined" @click="closeNavigation">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 2.75H5A1.25 1.25 0 0 0 3.75 4v12A1.25 1.25 0 0 0 5 17.25h10A1.25 1.25 0 0 0 16.25 16V8z" />
                  <path d="M11 2.75V8h5.25M7 11h6m-6 3h6" />
                </svg>
                {{ entry.title }}
              </a>
            </li>
          </ul>
        </nav>

        <nav v-if="sections.length" class="reader-outline" aria-labelledby="reader-outline-label">
          <p id="reader-outline-label" class="reader-sidebar-label">이 문서의 목차</p>
          <ul ref="outline">
            <li v-for="section in sections" :key="section.slug" :class="{ 'reader-subsection': section.level === 3 }">
              <a :href="section.link" :aria-current="section.slug === activeSection ? 'location' : undefined" @click="closeNavigation">{{ section.title }}</a>
            </li>
          </ul>
        </nav>
      </div>
    </component>

    <main id="reader-main" class="reader-main" tabindex="-1">
      <article ref="article" class="reader-article">
        <template v-if="!page.isNotFound">
          <p class="reader-source">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m6.5 6.5-3.5 3.5 3.5 3.5m7-7 3.5 3.5-3.5 3.5m-2-9-3 11" />
            </svg>
            <span>{{ sourcePath }}</span>
          </p>
          <Content class="reader-prose" />
        </template>
        <div v-else class="reader-prose">
          <h1>문서를 찾을 수 없습니다</h1>
          <p><a :href="withBase('/')">프로젝트 소개로 돌아가기</a></p>
        </div>
      </article>
    </main>
  </div>
</template>
