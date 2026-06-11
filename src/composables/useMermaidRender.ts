import mermaid from 'mermaid'
import { nextTick, onMounted, type Ref } from 'vue'

let initialized = false

function ensureMermaid() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { curve: 'basis' },
  })
  initialized = true
}

/** 将 Mermaid 源码渲染到占位节点 */
export async function renderMermaidDiagram(
  mountEl: HTMLElement,
  diagramId: string,
  source: string,
) {
  ensureMermaid()
  const { svg, bindFunctions } = await mermaid.render(diagramId, source.trim())
  mountEl.innerHTML = svg
  bindFunctions?.(mountEl)
}

/** 批量渲染文档内 Mermaid 图 */
export function useMermaidDiagrams(
  slotRefs: Ref<Partial<Record<string, HTMLElement | null>>>,
  diagrams: Record<string, string>,
) {
  onMounted(async () => {
    await nextTick()
    for (const [key, source] of Object.entries(diagrams)) {
      const el = slotRefs.value[key]
      if (!el) continue
      try {
        await renderMermaidDiagram(el, `vrrp-${key}`, source)
      } catch {
        el.innerHTML = `<pre class="mermaid-fallback">${source.trim()}</pre>`
      }
    }
  })
}
