<script setup lang="ts">
import type { BillingIconKind } from '../../constants/billingList'

withDefaults(
  defineProps<{
    kind: BillingIconKind
    size?: number
  }>(),
  { size: 36 },
)

const fill: Record<BillingIconKind, string> = {
  receive: '#34c759',
  withdraw: '#ff5a7a',
  transfer: '#3b82f6',
  redpacket: '#ff4d4f',
  purchase: '#8b5cf6',
  bonus: '#f5a623',
  consume: '#ff7a2b',
  xcoin: '#14b8a6',
  system: '#3b82f6',
}
</script>

<template>
  <svg
    class="mh5-billing-type-icon"
    :width="size"
    :height="size"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="18" cy="18" r="18" :fill="fill[kind]" />

    <!-- 收款：绿底钱包 -->
    <template v-if="kind === 'receive'">
      <rect x="8" y="15" width="20" height="13" rx="2.5" fill="#fff" />
      <path d="M8 18.5h20" stroke="#34c759" stroke-width="1.4" />
      <circle cx="23.5" cy="11.5" r="3.2" fill="#ffe08a" stroke="#fff" stroke-width="1.2" />
    </template>

    <!-- 提现：上箭头 -->
    <template v-else-if="kind === 'withdraw'">
      <path d="M18 25V12" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />
      <path d="M12 17.5L18 11.5l6 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- 转账：双向箭头 -->
    <template v-else-if="kind === 'transfer'">
      <path d="M9 14h13l-3.5-3.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M27 22H14l3.5 3.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- 红包 -->
    <template v-else-if="kind === 'redpacket'">
      <rect x="10" y="12" width="16" height="14" rx="2" fill="#fff" />
      <path d="M10 16.5c2.4 1.6 4.6 2.2 8 2.2s5.6-.6 8-2.2" stroke="#ff4d4f" stroke-width="1.4" stroke-linecap="round" />
      <circle cx="18" cy="17.2" r="1.6" fill="#ff4d4f" />
    </template>

    <!-- 购买 -->
    <template v-else-if="kind === 'purchase'">
      <path d="M13 15h10l-1 10H14l-1-10z" fill="#fff" />
      <path d="M14.5 15v-1.5a3.5 3.5 0 017 0V15" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
    </template>

    <!-- 奖金 -->
    <template v-else-if="kind === 'bonus'">
      <path
        d="M18 9.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L18 20.3 13.8 22.5l.8-4.7-3.4-3.3 4.7-.7L18 9.5z"
        fill="#fff"
      />
    </template>

    <!-- 消费 -->
    <template v-else-if="kind === 'consume'">
      <rect x="9" y="13" width="18" height="12" rx="2" fill="#fff" />
      <path d="M9 17h18" stroke="#ff7a2b" stroke-width="1.4" />
      <path d="M13 21h4" stroke="#ff7a2b" stroke-width="1.4" stroke-linecap="round" />
    </template>

    <!-- 上下分 -->
    <template v-else-if="kind === 'xcoin'">
      <path d="M14 11v10" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
      <path d="M11 14l3-3 3 3" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 25V15" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
      <path d="M19 22l3 3 3-3" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- 系统打款 -->
    <template v-else>
      <path d="M18 8v12" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />
      <path d="M12.5 15.5L18 21l5.5-5.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 27h16" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />
    </template>
  </svg>
</template>
