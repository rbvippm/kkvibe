<script setup lang="ts">
import { computed } from 'vue'
import { useLiveStartNotice, type TopNoticeKind } from '../composables/useLiveStartNotice'

const { visible, current, dismiss, enterRoom } = useLiveStartNotice()

type NoticeUi = {
  label: string
  cta: string
  badge: string
  labelClass: string
  ringClass: string
  badgeClass: string
  avatarClass: string
}

const UI_BY_KIND: Record<TopNoticeKind, NoticeUi> = {
  live_start: {
    label: '你关注的主播开播了',
    cta: '进入直播间',
    badge: 'LIVE',
    labelClass: 'text-rose-600 dark:text-rose-400',
    ringClass: 'from-rose-500 to-orange-400',
    badgeClass: 'bg-rose-500',
    avatarClass: 'from-violet-500 to-fuchsia-600',
  },
  voice_mic_on: {
    label: '你关注的大神在语聊房上麦了',
    cta: '进入语聊房',
    badge: '上麦',
    labelClass: 'text-sky-600 dark:text-sky-400',
    ringClass: 'from-sky-500 to-cyan-400',
    badgeClass: 'bg-sky-500',
    avatarClass: 'from-sky-500 to-indigo-600',
  },
}

const ui = computed(() => {
  const kind = current.value?.kind ?? 'live_start'
  return UI_BY_KIND[kind]
})

const subtitle = computed(() => {
  const c = current.value
  if (!c) return ''
  if (c.kind === 'voice_mic_on' && c.micIndex != null) {
    return `${c.roomTitle} · ${c.micIndex} 号麦`
  }
  return c.roomTitle
})
</script>

<template>
  <Teleport to="body">
    <Transition name="live-start-notice">
      <div
        v-if="visible && current"
        class="live-start-notice-root pointer-events-none fixed inset-x-0 top-0 z-[9999] flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]"
        role="alert"
        aria-live="polite"
      >
        <div
          class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-black/8 bg-white/95 p-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.28)] ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1c1d24]/95 dark:ring-white/10"
        >
          <div class="relative shrink-0">
            <span
              class="absolute -inset-0.5 animate-pulse rounded-full bg-gradient-to-tr opacity-80"
              :class="ui.ringClass"
              aria-hidden="true"
            />
            <span
              class="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white"
              :class="ui.avatarClass"
            >
              {{ current.hostAvatar }}
            </span>
            <span
              class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px text-[9px] font-bold leading-none text-white"
              :class="ui.badgeClass"
            >
              {{ ui.badge }}
            </span>
          </div>

          <button type="button" class="min-w-0 flex-1 text-left" @click="enterRoom()">
            <p class="text-[11px] font-medium" :class="ui.labelClass">{{ ui.label }}</p>
            <p class="truncate text-sm font-semibold text-[#111827] dark:text-[#f3f4f6]">
              {{ current.hostName }}
            </p>
            <p class="truncate text-xs text-[#6b7280] dark:text-[#9ca3af]">
              {{ subtitle }}
            </p>
          </button>

          <div class="flex shrink-0 flex-col items-end gap-1.5">
            <button
              type="button"
              class="rounded-full bg-[#111827] px-3.5 py-1.5 text-xs font-semibold text-white transition active:scale-[0.97] dark:bg-white dark:text-[#111827]"
              @click="enterRoom()"
            >
              {{ ui.cta }}
            </button>
            <button
              type="button"
              class="rounded-full p-1 text-[#9ca3af] transition hover:bg-black/5 hover:text-[#374151] dark:hover:bg-white/10 dark:hover:text-[#e5e7eb]"
              aria-label="关闭通知"
              @click="dismiss()"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
        </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.live-start-notice-enter-active,
.live-start-notice-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

.live-start-notice-enter-from,
.live-start-notice-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
