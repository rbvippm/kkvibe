<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  DISCOVER_ASSETS,
  DISCOVER_CATEGORY_ICON,
  DISCOVER_LIVE_FILTERS,
  filterDiscoverLiveCards,
  formatLivePreviewStartAt,
  isLivePreviewCard,
  type DiscoverLiveCard,
  type DiscoverLiveFilter,
} from '../../constants/mobileDiscover'

const COMMUNITY_FILTER_STORAGE_KEY = 'mh5-community-live-filter'
const COMMUNITY_SCROLL_STORAGE_KEY = 'mh5-community-live-scroll'

function readStoredLiveFilter(): DiscoverLiveFilter {
  try {
    const saved = sessionStorage.getItem(COMMUNITY_FILTER_STORAGE_KEY)
    if (saved && DISCOVER_LIVE_FILTERS.some((item) => item.key === saved)) {
      return saved as DiscoverLiveFilter
    }
  } catch {
    /* ignore */
  }
  return 'all'
}

const route = useRoute()
const router = useRouter()
const liveFilter = ref<DiscoverLiveFilter>(readStoredLiveFilter())
const mainRef = ref<HTMLElement | null>(null)
const nowMs = ref(Date.now())
const liveCards = computed(() => filterDiscoverLiveCards(liveFilter.value, nowMs.value))
const fromCommunity = computed(() =>
  route.path.startsWith('/mobile/vip-club') ? 'vip-club-community' : 'community',
)

let previewTick: number | undefined

onMounted(() => {
  restoreLiveScroll()
  previewTick = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  saveLiveScroll()
  if (previewTick) window.clearInterval(previewTick)
})

watch(liveFilter, (filter) => {
  try {
    sessionStorage.setItem(COMMUNITY_FILTER_STORAGE_KEY, filter)
  } catch {
    /* ignore */
  }
})

function saveLiveScroll() {
  if (!mainRef.value) return
  try {
    sessionStorage.setItem(COMMUNITY_SCROLL_STORAGE_KEY, String(mainRef.value.scrollTop))
  } catch {
    /* ignore */
  }
}

function restoreLiveScroll() {
  let saved = 0
  try {
    saved = Number(sessionStorage.getItem(COMMUNITY_SCROLL_STORAGE_KEY) || 0)
  } catch {
    saved = 0
  }
  if (!saved) return
  nextTick(() => {
    requestAnimationFrame(() => {
      if (mainRef.value) mainRef.value.scrollTop = saved
    })
  })
}

onBeforeRouteLeave(() => {
  saveLiveScroll()
})

function enterLivePromo() {
  saveLiveScroll()
  router.push({ name: 'mobile-live', query: { from: fromCommunity.value } })
}

function enterLiveRoom(card: DiscoverLiveCard) {
  saveLiveScroll()
  if (isLivePreviewCard(card)) {
    router.replace({
      name: 'mobile-live-preview',
      query: {
        id: card.id,
        from: fromCommunity.value,
      },
    })
    return
  }
  if (card.voiceRoom) {
    router.replace({
      name: 'mobile-voice-room',
      query: {
        id: card.id,
        host: card.hostName,
        cover: card.cover,
        heat: card.heat,
        title: card.roomTitle,
        from: fromCommunity.value,
      },
    })
    return
  }

  router.replace({
    name: 'mobile-live-stream',
    query: {
      id: card.id,
      host: card.hostName,
      cover: card.cover,
      heat: card.heat,
      title: card.roomTitle,
      from: fromCommunity.value,
    },
  })
}
</script>

<template>
  <div class="mh5-community-live">
    <div class="mh5-discover-filters">
      <div class="mh5-discover-filters__scroll" role="tablist" :aria-label="$t('直播筛选')">
        <button
          v-for="item in DISCOVER_LIVE_FILTERS"
          :key="item.key"
          type="button"
          role="tab"
          class="mh5-discover-filter"
          :class="{ 'mh5-discover-filter--active': liveFilter === item.key }"
          :aria-selected="liveFilter === item.key"
          @click="liveFilter = item.key"
        >
          {{ $t(item.label) }}
        </button>
      </div>
      <button type="button" class="mh5-discover-filters__layer" :aria-label="$t('分层筛选')">
        <img :src="DISCOVER_ASSETS.layer" alt="" width="24" height="24" />
      </button>
    </div>

    <div ref="mainRef" class="mh5-discover-main">
      <section class="mh5-discover-banner" :aria-label="$t('直播推广')">
        <img class="mh5-discover-banner__bg" :src="DISCOVER_ASSETS.bannerBg" alt="" />
        <div class="mh5-discover-banner__shade" aria-hidden="true" />
        <img class="mh5-discover-banner__person" :src="DISCOVER_ASSETS.bannerPerson" alt="" />
        <img class="mh5-discover-banner__mic" :src="DISCOVER_ASSETS.micDeco" alt="" />
        <div class="mh5-discover-banner__copy">
          <p class="mh5-discover-banner__sub">{{ $t('交朋友 看直播 秀美女') }}</p>
          <h2 class="mh5-discover-banner__title">{{ $t('真人现场直播') }}</h2>
          <button type="button" class="mh5-discover-banner__cta" @click="enterLivePromo">
            {{ $t('立即进入直播间') }}
          </button>
        </div>
      </section>

      <div class="mh5-discover-grid">
        <article
          v-for="card in liveCards"
          :key="card.id"
          class="mh5-discover-card"
          role="button"
          tabindex="0"
          @click="enterLiveRoom(card)"
          @keydown.enter="enterLiveRoom(card)"
        >
          <div class="mh5-discover-card__cover">
            <img class="mh5-discover-card__img" :src="card.cover" :alt="card.roomTitle" />
            <div class="mh5-discover-card__cat">
              <img :src="DISCOVER_CATEGORY_ICON[card.category]" alt="" width="16" height="16" />
              <span>{{ card.categoryLabel }}</span>
            </div>
            <div
              class="mh5-discover-card__status"
              :class="
                isLivePreviewCard(card)
                  ? 'mh5-discover-card__status--preview'
                  : 'mh5-discover-card__status--live'
              "
              :aria-label="isLivePreviewCard(card) ? $t('预告') : $t('直播中')"
            >
              <span v-if="isLivePreviewCard(card)">{{ $t('预告') }}</span>
              <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="7" width="2.2" height="4" rx="0.5" fill="#fff" />
                <rect x="4.9" y="4.2" width="2.2" height="6.8" rx="0.5" fill="#fff" />
                <rect x="8.8" y="1.2" width="2.2" height="9.8" rx="0.5" fill="#fff" />
              </svg>
            </div>
            <div v-if="card.voiceRoom" class="mh5-discover-card__voice">
              <img :src="DISCOVER_ASSETS.mic" alt="" width="12" height="12" />
              <span>{{ $t('语聊房') }}</span>
            </div>
            <div class="mh5-discover-card__meta">
              <span class="mh5-discover-card__host">{{ card.hostName }}</span>
              <span v-if="isLivePreviewCard(card) && card.startAt" class="mh5-discover-card__time">
                {{ formatLivePreviewStartAt(card.startAt) }}
              </span>
              <span v-else class="mh5-discover-card__heat">
                <img :src="DISCOVER_ASSETS.fire" alt="" width="16" height="16" />
                {{ card.heat }}
              </span>
            </div>
          </div>
          <div class="mh5-discover-card__body">
            <h3 class="mh5-discover-card__title">{{ card.roomTitle }}</h3>
            <span class="mh5-discover-card__tag">{{ card.tag }}</span>
          </div>
        </article>
      </div>

      <p v-if="liveCards.length" class="mh5-discover-end">{{ $t('没有更多的数据了') }}</p>
      <div v-else class="mh5-discover-empty">
        <p>暂无直播</p>
      </div>
    </div>
  </div>
</template>
