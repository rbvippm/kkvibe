export type RevisionTableRow = {
  version: string
  content: string
  date: string
  author: string
}

const COLUMN_ALIASES: Record<keyof RevisionTableRow, string[]> = {
  version: ['版本号', '版本'],
  content: ['修订内容描述', '修订内容', '修订内容说明'],
  date: ['时间', '日期', '修订日期'],
  author: ['创建人/更新人', '创建人', '更新人', '作者', '修订人'],
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function mapHeaderIndex(headers: string[], field: keyof RevisionTableRow): number {
  const aliases = COLUMN_ALIASES[field]
  return headers.findIndex((header) => aliases.some((alias) => header.includes(alias)))
}

function formatContent(raw: string): string {
  return raw
    .split('；')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n')
}

/** 从 Markdown 表格解析修订记录（兼容左侧文档编辑） */
export function parseRevisionTable(markdown: string): RevisionTableRow[] {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))

  if (lines.length < 2) return []

  const headers = splitTableRow(lines[0]!)
  const versionIdx = mapHeaderIndex(headers, 'version')
  const contentIdx = mapHeaderIndex(headers, 'content')
  const dateIdx = mapHeaderIndex(headers, 'date')
  const authorIdx = mapHeaderIndex(headers, 'author')

  if (versionIdx < 0 || contentIdx < 0 || dateIdx < 0 || authorIdx < 0) return []

  const rows: RevisionTableRow[] = []

  for (const line of lines.slice(2)) {
    if (/^\|[\s\-:|]+\|$/.test(line.replace(/\s/g, ''))) continue
    const cells = splitTableRow(line)
    const version = cells[versionIdx]?.trim()
    const content = cells[contentIdx]?.trim()
    const date = cells[dateIdx]?.trim()
    const author = cells[authorIdx]?.trim()
    if (!version && !content) continue
    rows.push({
      version: version ?? '',
      content: formatContent(content ?? ''),
      date: date ?? '',
      author: author ?? '',
    })
  }

  return rows
}

function serializeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '；').trim()
}

function serializeContent(content: string): string {
  return content
    .split('\n')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('；')
}

/** 将修订记录行序列化为 Markdown 表格（写入 docContent / manifest） */
export function serializeRevisionTable(rows: RevisionTableRow[]): string {
  const header = '| 版本号 | 修订内容描述 | 时间 | 创建人/更新人 |'
  const divider = '|--------|--------------|------|---------------|'
  const body = rows.map(
    (row) =>
      `| ${serializeCell(row.version)} | ${serializeCell(serializeContent(row.content))} | ${serializeCell(row.date)} | ${serializeCell(row.author)} |`,
  )
  return [header, divider, ...body].join('\n')
}
