/** 是否允许工作台写入（仅本机 localhost / 127.0.0.1 开发环境） */
export function isWorkspaceEditable(hostname?: string): boolean {
  if (typeof window === 'undefined') return false
  const host = (hostname ?? window.location.hostname).trim().toLowerCase()
  if (!host) return false
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.localhost')
  )
}
