<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { getPcBreadcrumb, pcMenuTree, type PcMenuItem } from '../config/pcMenu'
import { usePcTagsView } from '../composables/usePcTagsView'
import '../styles/pc-admin-layout.css'

const route = useRoute()
const sidebarCollapsed = ref(false)
const { visitedTags, closeTag, activateTag } = usePcTagsView()

const breadcrumbs = computed(() => {
  const name = route.name
  if (typeof name !== 'string') return [{ title: '首页', path: '/pc' }]
  return getPcBreadcrumb(name)
})

const activeRouteName = computed(() => route.name as string)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function isMenuActive(item: PcMenuItem) {
  return item.routeName === activeRouteName.value
}

</script>

<template>
  <div class="pc-admin-layout">
    <aside
      class="pc-admin-sidebar"
      :class="{ 'pc-admin-sidebar--collapsed': sidebarCollapsed }"
    >
      <div class="pc-admin-sidebar__brand">
        <span class="pc-admin-sidebar__brand-mark">K</span>
        <span v-show="!sidebarCollapsed">KK 管理后台</span>
      </div>

      <nav class="pc-admin-sidebar__nav" aria-label="PC 后台菜单">
        <template v-for="group in pcMenuTree" :key="group.key">
          <!-- 首页等单级菜单 -->
          <RouterLink
            v-if="group.path && !group.children?.length"
            :to="group.path"
            class="pc-admin-menu-item"
            :class="{ 'pc-admin-menu-item--active': isMenuActive(group) }"
          >
            <span class="pc-admin-menu-item__icon">{{ group.icon }}</span>
            <span class="pc-admin-menu-item__label">{{ group.title }}</span>
          </RouterLink>

          <!-- 分组菜单 -->
          <div v-else-if="group.children?.length" class="pc-admin-menu-group">
            <p v-show="!sidebarCollapsed" class="pc-admin-menu-group__title">
              {{ group.title }}
            </p>
            <RouterLink
              v-for="child in group.children"
              :key="child.key"
              :to="child.path!"
              class="pc-admin-menu-item"
              :class="{
                'pc-admin-menu-item--active': isMenuActive(child),
                'pc-admin-menu-item--in-group': !sidebarCollapsed,
              }"
              :title="sidebarCollapsed ? child.title : undefined"
            >
              <span class="pc-admin-menu-item__icon">{{ group.icon }}</span>
              <span class="pc-admin-menu-item__label">{{ child.title }}</span>
            </RouterLink>
          </div>
        </template>
      </nav>
    </aside>

    <div class="pc-admin-main">
      <header class="pc-admin-header">
        <div class="pc-admin-breadcrumb-row">
          <button
            type="button"
            class="pc-admin-collapse-btn"
            aria-label="折叠侧栏"
            @click="toggleSidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="3" width="14" height="1.5" rx="0.5" />
              <rect x="1" y="7.25" width="14" height="1.5" rx="0.5" />
              <rect x="1" y="11.5" width="14" height="1.5" rx="0.5" />
            </svg>
          </button>

          <nav aria-label="面包屑">
            <ol class="pc-admin-breadcrumb">
              <li
                v-for="(item, index) in breadcrumbs"
                :key="`${item.title}-${index}`"
                class="pc-admin-breadcrumb__item"
              >
                <span v-if="index > 0" class="pc-admin-breadcrumb__sep">/</span>
                <RouterLink
                  v-if="item.path && index < breadcrumbs.length - 1"
                  :to="item.path"
                  class="pc-admin-breadcrumb__link"
                >
                  {{ item.title }}
                </RouterLink>
                <span v-else class="pc-admin-breadcrumb__current">{{ item.title }}</span>
              </li>
            </ol>
          </nav>
        </div>

        <div class="pc-admin-tags" role="tablist" aria-label="已打开页面">
          <button
            v-for="tag in visitedTags"
            :key="tag.routeName"
            type="button"
            role="tab"
            class="pc-admin-tag"
            :class="{ 'pc-admin-tag--active': tag.routeName === activeRouteName }"
            :aria-selected="tag.routeName === activeRouteName"
            @click="activateTag(tag)"
          >
            <span>{{ tag.title }}</span>
            <span
              v-if="!tag.affix"
              class="pc-admin-tag__close"
              role="button"
              aria-label="关闭标签"
              @click="closeTag(tag.routeName, $event)"
            >
              ×
            </span>
          </button>
        </div>
      </header>

      <main class="pc-admin-content">
        <RouterView v-slot="{ Component }">
          <Transition name="pc-page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.pc-page-enter-active,
.pc-page-leave-active {
  transition: opacity 0.15s ease;
}

.pc-page-enter-from,
.pc-page-leave-to {
  opacity: 0;
}
</style>
