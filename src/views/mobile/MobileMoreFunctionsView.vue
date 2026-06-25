<script setup lang="ts">
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { MINE_MORE_MENU_GROUPS, type MineMoreMenuItem } from '../../constants/mineMoreFunctions'
import '../../styles/mobile-app-shell.css'

const router = useRouter()

function openItem(item: MineMoreMenuItem) {
  router.push({
    name: item.routeName,
    query: item.query,
  })
}
</script>

<template>
  <div class="mh5-mine-more-page">
    <Mh5SubPageHeader title="更多功能" />

    <main class="mh5-mine-more-main">
      <section v-for="group in MINE_MORE_MENU_GROUPS" :key="group.key" class="mh5-mine-more-group">
        <h2 class="mh5-mine-more-group__title">{{ group.title }}</h2>
        <div class="mh5-mine-more-list">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="mh5-mine-more-item"
            @click="openItem(item)"
          >
            <span class="mh5-mine-more-item__icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="mh5-mine-more-item__body">
              <span class="mh5-mine-more-item__title">{{ item.title }}</span>
              <span v-if="item.desc" class="mh5-mine-more-item__desc">{{ item.desc }}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" class="mh5-mine-more-item__arrow" aria-hidden="true">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
