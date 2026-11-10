<script lang="ts">
let nextDiagramId = 0
let mermaidLoader: Promise<typeof import('mermaid')['default']> | undefined

function loadMermaid() {
  return mermaidLoader ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'neutral',
      fontFamily: 'Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
      flowchart: { useMaxWidth: false },
      sequence: { useMaxWidth: false }
    })
    return mermaid
  })
}
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ source: string }>()
const mounted = ref(false)
const svg = ref('')
const error = ref('')

onMounted(() => {
  mounted.value = true
})

watch([mounted, () => props.source], async ([ready, source], _previous, onCleanup) => {
  if (!ready) return

  let stale = false
  onCleanup(() => { stale = true })
  svg.value = ''
  error.value = ''

  try {
    const mermaid = await loadMermaid()
    if (stale) return

    const diagram = await mermaid.render(`reader-diagram-${++nextDiagramId}`, source)
    if (!stale) svg.value = diagram.svg
  } catch (failure) {
    if (!stale) error.value = failure instanceof Error ? failure.message : String(failure)
  }
})
</script>

<template>
  <div class="reader-diagram" role="region" aria-label="Mermaid 다이어그램" tabindex="0">
    <div v-if="svg" v-html="svg"></div>
    <div v-else-if="error">
      <p class="reader-diagram-error" role="status">다이어그램을 그리지 못했습니다.</p>
      <pre><code>{{ error }}</code></pre>
      <pre><code>{{ source }}</code></pre>
    </div>
    <p v-else class="reader-diagram-status" role="status">다이어그램을 그리는 중입니다.</p>
  </div>
</template>
