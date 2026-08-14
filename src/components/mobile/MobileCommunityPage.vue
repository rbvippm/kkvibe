<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  COMMUNITY_BANNER,
  COMMUNITY_TABS,
  groupsForTab,
  type CommunityTab,
} from '../../constants/mobileCommunity'
import { COMMUNITY_ASSETS } from '../../constants/mobileCommunityAssets'

const activeTab = ref<CommunityTab>('service')
const joinedIds = ref<Set<string>>(new Set(['brand', 's2']))

const groups = computed(() => groupsForTab(activeTab.value))

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
</script>

<template>
  <div class="mh5-community-page">
    <header class="mh5-community-header">
      <div class="mh5-community-tabs" role="tablist" :aria-label="$t('社区分类')">
        <button
          v-for="tab in COMMUNITY_TABS"
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
      <button type="button" class="mh5-community-menu" :aria-label="$t('更多菜单')">
        <img :src="COMMUNITY_ASSETS.menu" alt="" width="20" height="20" />
      </button>
    </header>

    <main class="mh5-community-main">
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
