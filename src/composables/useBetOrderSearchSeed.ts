import { ref } from 'vue'

/** 代理中心级单例：团队「注单查询」带入关键词（不因子页 Strict 双挂载丢失） */
const betOrderSearchSeed = ref('')

export function setBetOrderSearchSeed(keyword: string) {
  betOrderSearchSeed.value = keyword.trim()
}

export function useBetOrderSearchSeed() {
  return { betOrderSearchSeed, setBetOrderSearchSeed }
}
