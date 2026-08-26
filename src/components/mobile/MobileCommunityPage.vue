<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunityChannels } from '../../composables/useCommunityChannels'
import {
  COMMUNITY_BANNER,
  COMMUNITY_TABS,
  groupsForTab,
  type CommunityTab,
} from '../../constants/mobileCommunity'
import { COMMUNITY_ASSETS } from '../../constants/mobileCommunityAssets'
import MobileCommunityLivePanel from './MobileCommunityLivePanel.vue'

const COMMUNITY_TAB_STORAGE_KEY = 'mh5-community-main-tab'

function readStoredTab(): CommunityTab {
  try {
    const saved = sessionStorage.getItem(COMMUNITY_TAB_STORAGE_KEY)
    if (saved && COMMUNITY_TABS.some((tab) => tab.key === saved)) {
      return saved as CommunityTab
    }
  } catch {
    /* ignore */
  }
  return 'service'
}

const route = useRoute()
const router = useRouter()
const { visibleTabs } = useCommunityChannels()
const activeTab = ref<CommunityTab>(readStoredTab())
const joinedIds = ref<Set<string>>(new Set(['brand', 's2']))

watch(
  visibleTabs,
  (tabs) => {
    if (!tabs.length) return
    if (!tabs.some((tab) => tab.key === activeTab.value)) {
      activeTab.value = tabs[0].key
    }
  },
  { immediate: true },
)

watch(activeTab, (tab) => {
  try {
    sessionStorage.setItem(COMMUNITY_TAB_STORAGE_KEY, tab)
  } catch {
    /* ignore */
  }
})

const groups = computed(() => groupsForTab(activeTab.value))
const isLiveTab = computed(() => activeTab.value === 'live')

function toggleJoin(id: string) {
  const next = new Set(joinedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  joinedIds.value = next
}

function isJoined(group: { id: string; joined: boolean }) {
  return group.joined || joinedIds.value.has(group.id)
}

const showBanner = computed(() => activeTab.value === 'service')
const showMemberCount = computed(() => activeTab.value !== 'news')

function openChannelSettings() {
  router.push({
    name: 'mobile-community-channel',
    query: route.path.startsWith('/mobile/vip-club') ? { from: 'vip-club-community' } : {},
  })
}
</script>

<template>
  <div class="mh5-community-page">
    <header class="mh5-community-header">
      <div class="mh5-community-tabs" role="tablist" :aria-label="$t('社区分类')">
        <button
          v-for="tab in visibleTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-community-tab"
          :class="{ 'mh5-community-tab--active': activeTab === tab.key }"
          :aria-selected="activeTab === tab.key"
          @click="activeTab = tab.key"
        >
          {{ $t(tab.label) }}
        </button>
      </div>
      <button type="button" class="mh5-community-menu" :aria-label="$t('频道设置')" @click="openChannelSettings">
        <img :src="COMMUNITY_ASSETS.menu" alt="" width="20" height="20" />
      </button>
    </header>

    <p v-if="!visibleTabs.length" class="mh5-community-empty">{{ $t('暂无频道，请在频道设置中开启') }}</p>

    <MobileCommunityLivePanel v-else-if="isLiveTab" />

    <main v-else class="mh5-community-main">
      <section v-if="showBanner" class="mh5-community-banner" :aria-label="$t('创业推广')">
        <img
          class="mh5-community-banner__img"
          :src="COMMUNITY_BANNER.image"
          :alt="COMMUNITY_BANNER.title"
          width="343"
          height="120"
        />
      </section>

      <ul class="mh5-community-list" role="list">
        <li v-for="group in groups" :key="group.id" class="mh5-community-item">
          <img class="mh5-community-item__icon" :src="group.icon" :alt="group.title" width="48" height="48" />

          <div class="mh5-community-item__body">
            <h3 class="mh5-community-item__title">{{ $t(group.title) }}</h3>
            <p v-if="group.desc" class="mh5-community-item__desc">{{ group.desc }}</p>
          </div>

          <div class="mh5-community-item__actions">
            <button
              type="button"
              class="mh5-community-item__btn"
              :class="{
                'mh5-community-item__btn--joined': isJoined(group),
                'mh5-community-item__btn--join': !isJoined(group),
              }"
              @click="toggleJoin(group.id)"
            >
              {{ isJoined(group) ? '已加入' : '加入' }}
            </button>
            <p v-if="showMemberCount && group.memberCount > 0" class="mh5-community-item__count">
              <img :src="COMMUNITY_ASSETS.member" alt="" width="12" height="12" />
              <span>{{ group.memberCount }}</span>
            </p>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>
