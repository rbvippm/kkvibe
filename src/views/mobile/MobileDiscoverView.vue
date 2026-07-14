<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useDiscoverChannels } from '../../composables/useDiscoverChannels'
import {
  DISCOVER_ASSETS,
  DISCOVER_CATEGORY_ICON,
  DISCOVER_LIVE_FILTERS,
  DISCOVER_MAIN_TABS,
  filterDiscoverLiveCards,
  type DiscoverLiveCard,
  type DiscoverLiveFilter,
  type DiscoverMainTab,
} from '../../constants/mobileDiscover'
import {
  DISCOVER_FEED_ASSETS,
  MOCK_DISCOVER_FEED_POSTS,
  splitFeedContent,
  type DiscoverFeedPost,
} from '../../constants/mobileDiscoverFeed'
import {
  DISCOVER_SHORT_ACTIONS,
  DISCOVER_SHORT_ASSETS,
  MOCK_DISCOVER_SHORT_VIDEO,
} from '../../constants/mobileDiscoverShort'

const DISCOVER_TAB_STORAGE_KEY = 'mh5-discover-main-tab'
const DISCOVER_FILTER_STORAGE_KEY = 'mh5-discover-live-filter'
const DISCOVER_SCROLL_STORAGE_KEY = 'mh5-discover-live-scroll'

function readStoredMainTab(tabs: { key: DiscoverMainTab }[]): DiscoverMainTab {
  try {
    const saved = sessionStorage.getItem(DISCOVER_TAB_STORAGE_KEY)
    if (saved && tabs.some((tab) => tab.key === saved)) {
      return saved as DiscoverMainTab
    }
  } catch {
    /* ignore */
  }
  return tabs[0]?.key || 'live'
}

function readStoredLiveFilter(): DiscoverLiveFilter {
  try {
    const saved = sessionStorage.getItem(DISCOVER_FILTER_STORAGE_KEY)
    if (saved && DISCOVER_LIVE_FILTERS.some((item) => item.key === saved)) {
      return saved as DiscoverLiveFilter
    }
  } catch {
    /* ignore */
  }
  return 'all'
}

const router = useRouter()
const { visibleTabs } = useDiscoverChannels()
const mainTab = ref<DiscoverMainTab>(readStoredMainTab(visibleTabs.value))
const liveFilter = ref<DiscoverLiveFilter>(readStoredLiveFilter())
const shortFollowed = ref(MOCK_DISCOVER_SHORT_VIDEO.followed ?? false)
const mainRef = ref<HTMLElement | null>(null)

watch(
  visibleTabs,
  (tabs) => {
    if (!tabs.length) return
    if (!tabs.some((tab) => tab.key === mainTab.value)) {
      mainTab.value = tabs[0].key
    }
  },
  { immediate: true },
)

watch(mainTab, (tab, prev) => {
  if (prev === 'live') saveLiveScroll()
  try {
    sessionStorage.setItem(DISCOVER_TAB_STORAGE_KEY, tab)
  } catch {
    /* ignore */
  }
  if (tab === 'live') restoreLiveScroll()
})

watch(liveFilter, (filter) => {
  try {
    sessionStorage.setItem(DISCOVER_FILTER_STORAGE_KEY, filter)
  } catch {
    /* ignore */
  }
})

const liveCards = computed(() => filterDiscoverLiveCards(liveFilter.value))
const feedPosts = MOCK_DISCOVER_FEED_POSTS
const shortVideo = MOCK_DISCOVER_SHORT_VIDEO
const isShortTab = computed(() => mainTab.value === 'short')

function saveLiveScroll() {
  if (!mainRef.value || mainTab.value !== 'live') return
  try {
    sessionStorage.setItem(DISCOVER_SCROLL_STORAGE_KEY, String(mainRef.value.scrollTop))
  } catch {
    /* ignore */
  }
}

function restoreLiveScroll() {
  if (mainTab.value !== 'live') return
  let saved = 0
  try {
    saved = Number(sessionStorage.getItem(DISCOVER_SCROLL_STORAGE_KEY) || 0)
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

onMounted(restoreLiveScroll)
onBeforeUnmount(saveLiveScroll)
onBeforeRouteLeave(() => {
  saveLiveScroll()
})

function goBack() {
  router.replace({ name: 'mobile-chat' })
}

function enterLivePromo() {
  saveLiveScroll()
  router.push({ name: 'mobile-live' })
}

function enterLiveRoom(card: DiscoverLiveCard) {
  saveLiveScroll()
  if (card.voiceRoom) {
    router.replace({
      name: 'mobile-voice-room',
      query: {
        id: card.id,
        host: card.hostName,
        cover: card.cover,
        heat: card.heat,
        title: card.roomTitle,
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
    },
  })
}

function contentParts(post: DiscoverFeedPost) {
  return splitFeedContent(post.content, post.topics)
}

function toggleShortFollow() {
  shortFollowed.value = !shortFollowed.value
}

function openChannelSettings() {
  saveLiveScroll()
  router.replace({ name: 'mobile-discover-channel' })
}
</script>

<template>
  <div
    class="mh5-discover-page mh5-route-view"
    :class="{ 'mh5-discover-page--short': isShortTab }"
  >
    <div v-if="isShortTab" class="mh5-discover-short-bg" aria-hidden="true">
      <img class="mh5-discover-short-bg__img" :src="shortVideo.cover" alt="" />
    </div>

    <header class="mh5-discover-header">
      <div class="mh5-discover-nav">
        <button type="button" class="mh5-discover-nav__back" aria-label="返回" @click="goBack">
          <img
            v-if="isShortTab"
            :src="DISCOVER_SHORT_ASSETS.back"
            alt=""
            width="24"
            height="24"
          />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5 8 12l7 7" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="mh5-discover-tabs" role="tablist" aria-label="发现分类">
          <button
            v-for="tab in visibleTabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-discover-tab"
            :class="{ 'mh5-discover-tab--active': mainTab === tab.key }"
            :aria-selected="mainTab === tab.key"
            @click="mainTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="mh5-discover-nav__actions" :class="{ 'mh5-discover-nav__actions--short': isShortTab }">
          <button
            type="button"
            class="mh5-discover-nav__icon"
            aria-label="频道设置"
            @click="openChannelSettings"
          >
            <img
              :src="isShortTab ? DISCOVER_SHORT_ASSETS.menu : DISCOVER_ASSETS.menu"
              alt=""
              width="24"
              height="24"
            />
          </button>
          <button v-if="!isShortTab" type="button" class="mh5-discover-nav__icon" aria-label="搜索">
            <img :src="DISCOVER_ASSETS.search" alt="" width="24" height="24" />
          </button>
        </div>
      </div>

      <div v-if="isShortTab" class="mh5-discover-short-search">
        <button type="button" class="mh5-discover-nav__icon" aria-label="搜索">
          <img :src="DISCOVER_SHORT_ASSETS.search" alt="" width="24" height="24" />
        </button>
      </div>

      <div v-if="mainTab === 'live'" class="mh5-discover-filters">
        <div class="mh5-discover-filters__scroll" role="tablist" aria-label="直播筛选">
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
            {{ item.label }}
          </button>
        </div>
        <button type="button" class="mh5-discover-filters__layer" aria-label="分层筛选">
          <img :src="DISCOVER_ASSETS.layer" alt="" width="24" height="24" />
        </button>
      </div>
    </header>

    <main
      ref="mainRef"
      class="mh5-discover-main"
      :class="{
        'mh5-discover-main--feed': mainTab === 'feed',
        'mh5-discover-main--short': isShortTab,
      }"
    >
      <template v-if="mainTab === 'live'">
        <section class="mh5-discover-banner" aria-label="直播推广">
          <img class="mh5-discover-banner__bg" :src="DISCOVER_ASSETS.bannerBg" alt="" />
          <div class="mh5-discover-banner__shade" aria-hidden="true" />
          <img class="mh5-discover-banner__person" :src="DISCOVER_ASSETS.bannerPerson" alt="" />
          <img class="mh5-discover-banner__mic" :src="DISCOVER_ASSETS.micDeco" alt="" />
          <div class="mh5-discover-banner__copy">
            <p class="mh5-discover-banner__sub">交朋友 看直播 秀美女</p>
            <h2 class="mh5-discover-banner__title">真人现场直播</h2>
            <button type="button" class="mh5-discover-banner__cta" @click="enterLivePromo">
              立即进入直播间
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
              <div v-if="card.voiceRoom" class="mh5-discover-card__voice">
                <img :src="DISCOVER_ASSETS.mic" alt="" width="12" height="12" />
                <span>语聊房</span>
              </div>
              <div class="mh5-discover-card__meta">
                <span class="mh5-discover-card__host">{{ card.hostName }}</span>
                <span class="mh5-discover-card__heat">
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

        <p class="mh5-discover-end">没有更多的数据了</p>
      </template>

      <template v-else-if="mainTab === 'feed'">
        <section class="mh5-discover-feed" aria-label="动态信息流">
          <article v-for="post in feedPosts" :key="post.id" class="mh5-discover-post">
            <img class="mh5-discover-post__avatar" :src="post.avatar" :alt="post.userName" />

            <div class="mh5-discover-post__body">
              <div class="mh5-discover-post__head">
                <div class="mh5-discover-post__user">
                  <span class="mh5-discover-post__name">{{ post.userName }}</span>
                  <span class="mh5-discover-post__time">{{ post.time }}</span>
                </div>
                <button type="button" class="mh5-discover-post__more" aria-label="更多">
                  <img :src="DISCOVER_FEED_ASSETS.more" alt="" width="16" height="16" />
                </button>
              </div>

              <p class="mh5-discover-post__text">
                <template v-for="(part, idx) in contentParts(post)" :key="`${post.id}-${idx}`">
                  <span :class="{ 'mh5-discover-post__topic': part.topic }">{{ part.text }}</span>
                </template>
              </p>

              <div v-if="post.mediaType === 'video' && post.videoCover" class="mh5-discover-post__video">
                <img class="mh5-discover-post__video-cover" :src="post.videoCover" alt="" />
                <div class="mh5-discover-post__controls" aria-hidden="true">
                  <img class="mh5-discover-post__controls-bg" :src="DISCOVER_FEED_ASSETS.controlBarBg" alt="" />
                  <button type="button" class="mh5-discover-post__ctrl" aria-label="暂停">
                    <img :src="DISCOVER_FEED_ASSETS.pause" alt="" width="20" height="20" />
                  </button>
                  <div class="mh5-discover-post__progress">
                    <div class="mh5-discover-post__bar">
                      <div class="mh5-discover-post__bar-fill" />
                    </div>
                    <span class="mh5-discover-post__duration">{{ post.videoDuration }}</span>
                  </div>
                  <button type="button" class="mh5-discover-post__ctrl" aria-label="静音">
                    <img :src="DISCOVER_FEED_ASSETS.mute" alt="" width="20" height="20" />
                  </button>
                  <button type="button" class="mh5-discover-post__ctrl" aria-label="全屏">
                    <img :src="DISCOVER_FEED_ASSETS.fullscreen" alt="" width="20" height="20" />
                  </button>
                </div>
              </div>

              <div v-else-if="post.mediaType === 'images' && post.images?.length" class="mh5-discover-post__gallery">
                <div class="mh5-discover-post__gallery-scroll">
                  <img
                    v-for="(img, i) in post.images"
                    :key="`${post.id}-img-${i}`"
                    class="mh5-discover-post__gallery-img"
                    :src="img"
                    alt=""
                  />
                </div>
              </div>

              <p v-if="post.mention" class="mh5-discover-post__mention">{{ post.mention }}</p>

              <div class="mh5-discover-post__actions">
                <button type="button" class="mh5-discover-post__action">
                  <img :src="DISCOVER_FEED_ASSETS.like" alt="" width="20" height="20" />
                  <span>{{ post.likes }}</span>
                </button>
                <button type="button" class="mh5-discover-post__action">
                  <img :src="DISCOVER_FEED_ASSETS.heart" alt="" width="20" height="20" />
                  <span>{{ post.favorites }}</span>
                </button>
                <button type="button" class="mh5-discover-post__action">
                  <img :src="DISCOVER_FEED_ASSETS.comment" alt="" width="20" height="20" />
                  <span>{{ post.comments }}</span>
                </button>
              </div>
            </div>
          </article>
        </section>
      </template>

      <template v-else-if="mainTab === 'short'">
        <section class="mh5-discover-short" aria-label="短视频">
          <aside class="mh5-discover-short__side" aria-label="互动">
            <button
              v-for="action in DISCOVER_SHORT_ACTIONS"
              :key="action.key"
              type="button"
              class="mh5-discover-short__side-item"
              :aria-label="action.ariaLabel"
            >
              <img :src="action.icon" alt="" width="20" height="20" />
              <span>{{ action.label }}</span>
            </button>
          </aside>

          <div class="mh5-discover-short__meta">
            <div class="mh5-discover-short__user-row">
              <div class="mh5-discover-short__user">
                <img class="mh5-discover-short__avatar" :src="shortVideo.avatar" :alt="shortVideo.userName" />
                <span class="mh5-discover-short__name">{{ shortVideo.userName }}</span>
              </div>
              <button
                type="button"
                class="mh5-discover-short__follow"
                :class="{ 'mh5-discover-short__follow--on': shortFollowed }"
                @click="toggleShortFollow"
              >
                {{ shortFollowed ? '已关注' : '关注' }}
              </button>
            </div>
            <p class="mh5-discover-short__caption">{{ shortVideo.caption }}</p>
          </div>
        </section>
      </template>

      <div v-else class="mh5-discover-empty">
        <p>{{ visibleTabs.find((t) => t.key === mainTab)?.label || DISCOVER_MAIN_TABS.find((t) => t.key === mainTab)?.label }}内容建设中</p>
      </div>
    </main>
  </div>
</template>
