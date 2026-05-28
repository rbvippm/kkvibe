<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import '../../styles/mobile-app-shell.css'

type TabKey = '动态' | '短视频' | '直播记录' | '评论和@' | '收藏'

const router = useRouter()

const user = ref({
  name: 'EZ1',
  avatar: 'E',
  vipLevel: 1,
  following: 0,
  followers: 0,
})

const tabs: { key: TabKey; label: string }[] = [
  { key: '动态', label: '动态' },
  { key: '短视频', label: '短视频' },
  { key: '直播记录', label: '直播记录' },
  { key: '评论和@', label: '评论和@' },
  { key: '收藏', label: '收藏' },
]

const activeTab = ref<TabKey>('动态')
const postFilter = ref<'已发布' | '待发布' | '审核中' | '已拒绝'>('已发布')

const posts = ref([
  { id: 'p1', author: 'EZ1', time: '昨天', content: 'OK', like: 1, fav: 1, comment: 0, status: '已发布' as const },
])

const visiblePosts = computed(() => {
  if (activeTab.value !== '动态') return []
  return posts.value.filter((p) => p.status === postFilter.value)
})

function goBack() {
  router.back()
}

function goVip() {
  router.push({ name: 'mobile-vip' })
}
</script>

<template>
  <div class="mh5-userhome-page">
    <header class="mh5-userhome-head">
      <button type="button" class="mh5-userhome-back" aria-label="返回" @click="goBack">←</button>
      <div class="mh5-userhome-profile">
        <div class="mh5-userhome-avatar">{{ user.avatar }}</div>
        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 items-center gap-2">
            <h1 class="mh5-userhome-name">{{ user.name }}</h1>
            <button type="button" class="mh5-vip-badge" @click="goVip" aria-label="进入 VIP 详情">
              <span class="mh5-vip-badge__crown" aria-hidden="true">♛</span>
              VIP{{ user.vipLevel }}
            </button>
          </div>
          <div class="mh5-userhome-metrics">
            <span><b>{{ user.following }}</b> 关注</span>
            <span><b>{{ user.followers }}</b> 粉丝</span>
          </div>
        </div>
        <button type="button" class="mh5-userhome-edit">编辑资料</button>
      </div>
    </header>

    <div class="mh5-userhome-tabs" role="tablist" aria-label="个人主页导航">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="mh5-userhome-tab"
        :class="{ 'mh5-userhome-tab--active': activeTab === t.key }"
        :aria-selected="activeTab === t.key"
        role="tab"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <main class="mh5-userhome-body">
      <template v-if="activeTab === '动态'">
        <div class="mh5-userhome-filters" role="tablist" aria-label="动态筛选">
          <button
            v-for="f in ['已发布', '待发布', '审核中', '已拒绝']"
            :key="f"
            type="button"
            class="mh5-userhome-filter"
            :class="{ 'mh5-userhome-filter--active': postFilter === f }"
            @click="postFilter = f as any"
          >
            {{ f }}
          </button>
        </div>

        <section v-if="visiblePosts.length" class="mh5-userhome-feed">
          <article v-for="p in visiblePosts" :key="p.id" class="mh5-userhome-post">
            <div class="mh5-userhome-post__row">
              <div class="mh5-userhome-post__avatar">{{ user.avatar }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <div class="font-semibold text-[var(--mh5-app-text)]">{{ p.author }}</div>
                  <div class="text-xs text-[var(--mh5-app-text-secondary)]">{{ p.time }}</div>
                </div>
                <div class="mt-1 text-sm text-[var(--mh5-app-text)]">{{ p.content }}</div>
              </div>
              <button type="button" class="mh5-userhome-post__more" aria-label="更多">···</button>
            </div>
            <div class="mh5-userhome-post__actions">
              <span>👍 {{ p.like }}</span>
              <span>⭐ {{ p.fav }}</span>
              <span>💬 {{ p.comment }}</span>
            </div>
          </article>
        </section>

        <p v-else class="mh5-userhome-empty">点击加载更多</p>
      </template>

      <template v-else>
        <div class="mh5-userhome-empty">
          暂无内容
        </div>
      </template>
    </main>

    <button type="button" class="mh5-userhome-fab" aria-label="发布">
      <span aria-hidden="true">＋</span>
    </button>
  </div>
</template>

