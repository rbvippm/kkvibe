<script setup lang="ts">
import { computed, ref } from 'vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  canViewCommunityLastSeen,
  communityMembers,
  communityRoleLabel,
  formatCommunityPresence,
  type CommunityMember,
} from '../../constants/mobileChatCommunity'
import { COMMUNITY_MEMBER_PRESENCE_SPEC } from '../../constants/mobileChatCommunitySpec'
import '../../styles/mobile-app-shell.css'

const searching = ref(false)
const keyword = ref('')
const pickingAdmin = ref(false)
const menuMember = ref<CommunityMember | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showLastSeen = computed(() => canViewCommunityLastSeen())

const visibleMembers = computed(() => {
  const text = keyword.value.trim()
  if (!searching.value) return communityMembers
  if (!text) return []
  return communityMembers.filter((item) => item.name.includes(text))
})

function showToast(text: string) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function cancelSearch() {
  searching.value = false
  keyword.value = ''
}

function togglePick() {
  pickingAdmin.value = !pickingAdmin.value
  if (pickingAdmin.value) showToast('点选成员设为管理员')
}

function onMember(member: CommunityMember) {
  if (!pickingAdmin.value || member.role === 'owner') return
  member.role = member.role === 'admin' ? 'member' : 'admin'
  showToast(member.role === 'admin' ? `已将${member.name}设为管理员` : `已取消${member.name}的管理员`)
}

function openMenu(member: CommunityMember) {
  if (member.role === 'owner' || pickingAdmin.value) return
  menuMember.value = member
}

function setAdmin(member: CommunityMember, admin: boolean) {
  member.role = admin ? 'admin' : 'member'
  menuMember.value = null
  showToast(admin ? `已将${member.name}设为管理员` : `已取消${member.name}的管理员`)
}

function removeMember(member: CommunityMember) {
  const idx = communityMembers.findIndex((item) => item.id === member.id)
  if (idx >= 0) communityMembers.splice(idx, 1)
  menuMember.value = null
  showToast(`已将${member.name}移出群组`)
}
</script>

<template>
  <div class="mh5-settings-page mh5-community-members">
    <Mh5SubPageHeader v-if="!searching" :title="$t('群组成员')">
      <template #right>
        <button type="button" class="mh5-community-icon-btn" :aria-label="$t('搜索')" @click="searching = true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
            <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </template>
    </Mh5SubPageHeader>
    <header v-else class="mh5-community-searchbar">
      <label class="mh5-community-searchbar__field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input v-model="keyword" autofocus :placeholder="$t('搜索')" :aria-label="$t('搜索群成员')" />
        <button v-if="keyword" type="button" :aria-label="$t('清空')" @click="keyword = ''">×</button>
      </label>
      <button type="button" class="mh5-community-searchbar__cancel" @click="cancelSearch">{{ $t('取消') }}</button>
    </header>

    <main class="mh5-settings-main">
      <button
        v-if="!searching"
        type="button"
        class="mh5-community-admin-entry"
        :class="{ 'is-on': pickingAdmin }"
        @click="togglePick"
      >
        {{ pickingAdmin ? $t('完成') : $t('设置管理员') }}
      </button>

      <p class="mh5-community-section">
        <span>{{ searching ? $t('搜索结果') : $t('群组成员') }}</span>
        <Mh5SpecAnnot v-if="!searching" :spec="COMMUNITY_MEMBER_PRESENCE_SPEC" placement="bottom" />
      </p>

      <p v-if="searching && !keyword.trim()" class="mh5-community-empty">{{ $t('输入昵称查找成员') }}</p>
      <p v-else-if="searching && !visibleMembers.length" class="mh5-community-empty">{{ $t('没有找到相关成员') }}</p>
      <p v-else-if="!visibleMembers.length" class="mh5-community-empty">{{ $t('暂无群组成员') }}</p>

      <section v-else class="mh5-settings-group">
        <div v-for="member in visibleMembers" :key="member.id" class="mh5-community-member">
          <button type="button" class="mh5-community-member__main" @click="onMember(member)">
            <img v-if="member.avatar" :src="member.avatar" alt="" />
            <span v-else class="mh5-community-member__ph" aria-hidden="true" />
            <span class="mh5-community-member__body">
              <span class="mh5-community-member__line">
                <span v-if="communityRoleLabel(member.role)" class="mh5-community-role" :class="`is-${member.role}`">
                  {{ communityRoleLabel(member.role) }}
                </span>
                <span class="mh5-community-member__name">{{ member.name }}</span>
              </span>
              <span
                v-if="showLastSeen && formatCommunityPresence(member)"
                class="mh5-community-member__seen"
                :class="{ 'is-online': member.online }"
              >
                {{ formatCommunityPresence(member) }}
              </span>
            </span>
          </button>
          <button
            v-if="member.role !== 'owner'"
            type="button"
            class="mh5-community-icon-btn"
            :aria-label="$t('更多操作')"
            @click="openMenu(member)"
          >
            ···
          </button>
        </div>
      </section>
    </main>

    <div v-if="menuMember" class="mh5-community-mask" @click.self="menuMember = null">
      <section class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="menuMember.name">
        <h2>{{ menuMember.name }}</h2>
        <button v-if="menuMember.role !== 'admin'" type="button" class="mh5-community-row" @click="setAdmin(menuMember, true)">
          <span class="mh5-community-row__title">{{ $t('设为管理员') }}</span>
        </button>
        <button v-else type="button" class="mh5-community-row" @click="setAdmin(menuMember, false)">
          <span class="mh5-community-row__title">{{ $t('取消管理员') }}</span>
        </button>
        <button type="button" class="mh5-community-row mh5-community-row--danger" @click="removeMember(menuMember)">
          <span class="mh5-community-row__title">{{ $t('移出群组') }}</span>
        </button>
      </section>
    </div>

    <p v-if="toast" class="mh5-community-toast">{{ toast }}</p>
  </div>
</template>
