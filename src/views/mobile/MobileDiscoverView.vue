<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDiscoverChannels } from '../../composables/useDiscoverChannels'
import {
  DISCOVER_ASSETS,
  DISCOVER_MAIN_TABS,
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

function readStoredMainTab(tabs: { key: DiscoverMainTab }[]): DiscoverMainTab {
  try {
    const saved = sessionStorage.getItem(DISCOVER_TAB_STORAGE_KEY)
    if (saved && tabs.some((tab) => tab.key === saved)) {
      return saved as DiscoverMainTab
    }
  } catch {
    /* ignore */
  }
  return tabs[0]?.key || 'feed'
}

const router = useRouter()
const { visibleTabs } = useDiscoverChannels()
const mainTab = ref<DiscoverMainTab>(readStoredMainTab(visibleTabs.value))
const shortFollowed = ref(MOCK_DISCOVER_SHORT_VIDEO.followed ?? false)

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

watch(mainTab, (tab) => {
  try {
    sessionStorage.setItem(DISCOVER_TAB_STORAGE_KEY, tab)
  } catch {
    /* ignore */
  }
})

const feedPosts = MOCK_DISCOVER_FEED_POSTS
const shortVideo = MOCK_DISCOVER_SHORT_VIDEO
const isShortTab = computed(() => mainTab.value === 'short')

function goBack() {
  router.replace({ name: 'mobile-chat' })
}

function contentParts(post: DiscoverFeedPost) {
  return splitFeedContent(post.content, post.topics)
}

function toggleShortFollow() {
  shortFollowed.value = !shortFollowed.value
}

function openChannelSettings() {
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
        <button type="button" class="mh5-discover-nav__back" :aria-label="$t('返回')" @click="goBack">
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

        <div class="mh5-discover-tabs" role="tablist" :aria-label="$t('发现分类')">
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
            {{ $t(tab.label) }}
          </button>
        </div>

        <div class="mh5-discover-nav__actions" :class="{ 'mh5-discover-nav__actions--short': isShortTab }">
          <button
            type="button"
            class="mh5-discover-nav__icon"
            :aria-label="$t('频道设置')"
            @click="openChannelSettings"
          >
            <img
              :src="isShortTab ? DISCOVER_SHORT_ASSETS.menu : DISCOVER_ASSETS.menu"
              alt=""
              width="24"
              height="24"
            />
          </button>
          <button v-if="!isShortTab" type="button" class="mh5-discover-nav__icon" :aria-label="$t('搜索')">
            <img :src="DISCOVER_ASSETS.search" alt="" width="24" height="24" />
          </button>
        </div>
      </div>

      <div v-if="isShortTab" class="mh5-discover-short-search">
        <button type="button" class="mh5-discover-nav__icon" :aria-label="$t('搜索')">
          <img :src="DISCOVER_SHORT_ASSETS.search" alt="" width="24" height="24" />
        </button>
      </div>

    </header>

    <main
      class="mh5-discover-main"
      :class="{
        'mh5-discover-main--feed': mainTab === 'feed',
        'mh5-discover-main--short': isShortTab,
      }"
    >
      <template v-if="mainTab === 'feed'">
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
