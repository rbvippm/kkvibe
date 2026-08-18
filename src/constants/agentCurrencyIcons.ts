/** 代理端币种图标（Figma 1433:25596 切图 + 信用额度货币单位） */

export type AgentCurrencyIconLayer = {
  src: string
  inset: string
}

export type AgentCurrencyUnitIcon = {
  unit: string
  color: string
}

export const AGENT_CURRENCY_ICON_LAYERS: Record<string, AgentCurrencyIconLayer[]> = {
  KKC: [{ src: '/images/currency/icon-kkc.svg', inset: '0' }],
  KKV: [
    { src: '/images/currency/icon-kkv-hex.svg', inset: '0 4.69% 0 5.08%' },
    { src: '/images/currency/icon-kkv-mark.svg', inset: '25.39% 27.53% 23.44% 28.91%' },
    { src: '/images/currency/icon-kkv-label.svg', inset: '0 4.8% 0 5.11%' },
  ],
  USDT: [
    { src: '/images/currency/icon-usdt-a.svg', inset: '0.23% 0.09% 0.27% 0.41%' },
    { src: '/images/currency/icon-usdt-b.svg', inset: '25.32% 26.49% 46.59% 26.4%' },
    { src: '/images/currency/icon-usdt-c.svg', inset: '44.1% 19.89% 18.56% 20.01%' },
  ],
}

export const AGENT_CURRENCY_UNIT_ICONS: Record<string, AgentCurrencyUnitIcon> = {
  '信用额度-CNY': { unit: '¥', color: '#ff7a2b' },
  '信用额度-USD': { unit: '$', color: '#0ea5e9' },
}

export function resolveAgentCurrencyIconCode(code: string) {
  if (code.includes('USDT')) return 'USDT'
  return code
}

export function getAgentCurrencyIconLayers(code: string) {
  return AGENT_CURRENCY_ICON_LAYERS[resolveAgentCurrencyIconCode(code)] ?? null
}

export function getAgentCurrencyUnitIcon(code: string) {
  return AGENT_CURRENCY_UNIT_ICONS[code] ?? null
}

export function formatAgentCurrencyLabel(code: string) {
  if (code === 'USDT-TRON') return 'USDT'
  return code
}

export function isSameAgentCurrency(left: string, right: string) {
  return formatAgentCurrencyLabel(left) === formatAgentCurrencyLabel(right)
}
