<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  COMMUNITY_INVITE_CONTACTS,
  COMMUNITY_VERIFY_OPTIONS,
  communityMembers,
  communityProfileFor,
  type CommunityVerify,
} from '../../constants/mobileChatCommunity'
import { getChatRoomDemo } from '../../constants/mobileChatRoom'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const roomId = computed(() => String(route.params.id || 'group-demo'))
const room = computed(() => getChatRoomDemo(roomId.value))
const profile = computed(() => communityProfileFor(roomId.value, room.value.title))

const editingName = ref(false)
const nameDraft = ref('')
const introDraft = ref('')
const nicknameDraft = ref('')
const selectedInvites = ref<string[]>([])
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

type Sheet = 'qr' | 'intro' | 'invite' | 'nickname' | 'verify' | 'manage' | 'transfer' | 'dismiss' | null
const sheet = ref<Sheet>(null)

function showToast(text: string) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function startRename() {
  nameDraft.value = profile.value.name
  editingName.value = true
}

function saveName() {
  const next = nameDraft.value.trim()
  editingName.value = false
  if (!next) {
    showToast('群名不能为空')
    return
  }
  profile.value.name = next
}

function openIntro() {
  introDraft.value = profile.value.intro
  sheet.value = 'intro'
}

function saveIntro() {
  profile.value.intro = introDraft.value.trim() || '暂无群简介'
  sheet.value = null
}

function openNickname() {
  nicknameDraft.value = profile.value.nickname
  sheet.value = 'nickname'
}

function saveNickname() {
  profile.value.nickname = nicknameDraft.value.trim()
  sheet.value = null
  showToast(profile.value.nickname ? '群内昵称已保存' : '已清除群内昵称')
}

function toggleInvite(id: string) {
  const idx = selectedInvites.value.indexOf(id)
  if (idx >= 0) selectedInvites.value.splice(idx, 1)
  else selectedInvites.value.push(id)
}

function sendInvites() {
  if (!selectedInvites.value.length) return
  selectedInvites.value = []
  sheet.value = null
  showToast('已发送邀请')
}

function pickVerify(value: CommunityVerify) {
  profile.value.verify = value
  sheet.value = null
}

function transferTo(id: string) {
  const next = communityMembers.find((item) => item.id === id)
  const owner = communityMembers.find((item) => item.role === 'owner')
  if (!next || !owner || next.id === owner.id) return
  owner.role = 'admin'
  next.role = 'owner'
  const ownerIndex = communityMembers.indexOf(owner)
  const nextIndex = communityMembers.indexOf(next)
  if (ownerIndex >= 0 && nextIndex >= 0) {
    communityMembers.splice(nextIndex, 1)
    communityMembers.splice(0, 0, next)
  }
  sheet.value = null
  showToast(`已把群主转让给${next.name}`)
}

function dismissGroup() {
  sheet.value = null
  void router.replace({ name: 'mobile-chat' })
}

function sendMessage() {
  void router.push({ name: 'mobile-chat-room', params: { id: room.value.id } })
}
</script>

<template>
  <div class="mh5-settings-page mh5-community-detail">
    <Mh5SubPageHeader :title="$t('群组资料')" />

    <main class="mh5-settings-main mh5-community-detail__main">
      <section class="mh5-community-hero">
        <img class="mh5-community-hero__avatar" :src="room.avatar" alt="" />
        <div class="mh5-community-hero__name">
          <input
            v-if="editingName"
            v-model="nameDraft"
            class="mh5-community-hero__input"
            maxlength="24"
            autofocus
            :aria-label="$t('群名')"
            @blur="saveName"
            @keydown.enter="saveName"
          />
          <template v-else>
            <strong>{{ profile.name }}</strong>
            <button type="button" class="mh5-community-hero__edit" :aria-label="$t('修改群名')" @click="startRename">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              </svg>
            </button>
          </template>
        </div>
        <button type="button" class="mh5-community-hero__qr" :aria-label="$t('群二维码')" @click="sheet = 'qr'">
          <img src="/images/mine/icon-qr.svg" alt="" width="22" height="22" />
        </button>
      </section>

      <section class="mh5-settings-group">
        <button type="button" class="mh5-community-row" @click="openIntro">
          <span class="mh5-community-row__copy">
            <span class="mh5-community-row__title">{{ $t('群简介') }}</span>
            <span class="mh5-community-row__desc">{{ profile.intro }}</span>
          </span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
      </section>

      <section class="mh5-settings-group">
        <button type="button" class="mh5-community-row" @click="router.push({ name: 'mobile-chat-community-members', params: { id: room.id } })">
          <span class="mh5-community-row__title">{{ $t('群组成员') }}</span>
          <span class="mh5-community-row__hint">{{ $t('设置管理员、删除成员') }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
        <button type="button" class="mh5-community-row" @click="sheet = 'invite'">
          <span class="mh5-community-row__title">{{ $t('添加成员') }}</span>
          <span class="mh5-community-row__hint">{{ $t('邀请联系人加入社群') }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
        <button type="button" class="mh5-community-row" @click="openNickname">
          <span class="mh5-community-row__title">{{ $t('群内昵称') }}</span>
          <span v-if="profile.nickname" class="mh5-community-row__hint">{{ profile.nickname }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
      </section>

      <section class="mh5-settings-group">
        <button type="button" class="mh5-community-row" @click="showToast('暂无可添加的机器人')">
          <span class="mh5-community-row__title">{{ $t('添加机器人') }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
        <button type="button" class="mh5-community-row" @click="sheet = 'verify'">
          <span class="mh5-community-row__title">{{ $t('入群验证方式') }}</span>
          <span class="mh5-community-row__hint">{{ profile.verify }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
      </section>

      <section class="mh5-settings-group">
        <button type="button" class="mh5-community-row" @click="showToast('已复制群组链接')">
          <span class="mh5-community-row__title">{{ $t('分享群组') }}</span>
        </button>
        <button type="button" class="mh5-community-row" @click="sheet = 'manage'">
          <span class="mh5-community-row__title">{{ $t('管理群组') }}</span>
          <span class="mh5-community-row__hint">{{ $t('禁言、禁私聊、转让群组、解散群组') }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
      </section>
    </main>

    <footer class="mh5-community-detail__footer">
      <button type="button" class="mh5-community-send" @click="sendMessage">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12l15-7-4 16-3.2-6.2L4 12z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        </svg>
        {{ $t('发消息') }}
      </button>
    </footer>

    <div v-if="sheet" class="mh5-community-mask" @click.self="sheet = null">
      <section v-if="sheet === 'qr'" class="mh5-community-dialog" role="dialog" aria-modal="true" :aria-label="$t('群二维码')">
        <img class="mh5-community-dialog__qr" src="/images/mine/icon-qr.svg" alt="" />
        <strong>{{ profile.name }}</strong>
        <button type="button" class="mh5-community-send" @click="showToast('已保存到相册'); sheet = null">{{ $t('保存图片') }}</button>
      </section>

      <section v-else-if="sheet === 'intro'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('群简介')">
        <h2>{{ $t('群简介') }}</h2>
        <textarea v-model="introDraft" class="mh5-community-field" rows="4" maxlength="80" :placeholder="$t('介绍一下这个群')" />
        <button type="button" class="mh5-community-send" @click="saveIntro">{{ $t('保存') }}</button>
      </section>

      <section v-else-if="sheet === 'nickname'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('群内昵称')">
        <h2>{{ $t('群内昵称') }}</h2>
        <input v-model="nicknameDraft" class="mh5-community-field" maxlength="20" :placeholder="$t('仅在本群显示')" />
        <button type="button" class="mh5-community-send" @click="saveNickname">{{ $t('保存') }}</button>
      </section>

      <section v-else-if="sheet === 'invite'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('添加成员')">
        <h2>{{ $t('邀请联系人加入社群') }}</h2>
        <button
          v-for="person in COMMUNITY_INVITE_CONTACTS"
          :key="person.id"
          type="button"
          class="mh5-community-member"
          @click="toggleInvite(person.id)"
        >
          <img :src="person.avatar" alt="" />
          <span>{{ person.name }}</span>
          <span class="mh5-community-check" :class="{ 'is-on': selectedInvites.includes(person.id) }" />
        </button>
        <button type="button" class="mh5-community-send" :disabled="!selectedInvites.length" @click="sendInvites">
          {{ $t('邀请') }}
        </button>
      </section>

      <section v-else-if="sheet === 'verify'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('入群验证方式')">
        <h2>{{ $t('入群验证方式') }}</h2>
        <button
          v-for="item in COMMUNITY_VERIFY_OPTIONS"
          :key="item"
          type="button"
          class="mh5-community-row"
          @click="pickVerify(item)"
        >
          <span class="mh5-community-row__title">{{ item }}</span>
          <span v-if="profile.verify === item" class="mh5-community-check is-on" />
        </button>
      </section>

      <section v-else-if="sheet === 'manage'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('管理群组')">
        <h2>{{ $t('管理群组') }}</h2>
        <button type="button" class="mh5-community-row" @click="profile.muted = !profile.muted">
          <span class="mh5-community-row__title">{{ $t('全员禁言') }}</span>
          <span class="mh5-community-row__hint">{{ profile.muted ? $t('已开启') : $t('未开启') }}</span>
        </button>
        <button type="button" class="mh5-community-row" @click="profile.privateLocked = !profile.privateLocked">
          <span class="mh5-community-row__title">{{ $t('禁止私聊') }}</span>
          <span class="mh5-community-row__hint">{{ profile.privateLocked ? $t('已禁止') : $t('未禁止') }}</span>
        </button>
        <button type="button" class="mh5-community-row" @click="sheet = 'transfer'">
          <span class="mh5-community-row__title">{{ $t('转让群组') }}</span>
          <span class="mh5-settings-item__arrow" aria-hidden="true">›</span>
        </button>
        <button type="button" class="mh5-community-row mh5-community-row--danger" @click="sheet = 'dismiss'">
          <span class="mh5-community-row__title">{{ $t('解散群组') }}</span>
        </button>
      </section>

      <section v-else-if="sheet === 'transfer'" class="mh5-community-sheet" role="dialog" aria-modal="true" :aria-label="$t('转让群组')">
        <h2>{{ $t('选择新群主') }}</h2>
        <button
          v-for="member in communityMembers.filter((item) => item.role !== 'owner')"
          :key="member.id"
          type="button"
          class="mh5-community-member"
          @click="transferTo(member.id)"
        >
          <img v-if="member.avatar" :src="member.avatar" alt="" />
          <span v-else class="mh5-community-member__ph" aria-hidden="true" />
          <span>{{ member.name }}</span>
        </button>
      </section>

      <section v-else class="mh5-community-dialog" role="dialog" aria-modal="true" :aria-label="$t('解散群组')">
        <strong>{{ $t('解散群组') }}</strong>
        <p>{{ $t('解散后所有成员将退出，且不可恢复') }}</p>
        <div class="mh5-community-dialog__actions">
          <button type="button" @click="sheet = 'manage'">{{ $t('取消') }}</button>
          <button type="button" class="is-danger" @click="dismissGroup">{{ $t('解散') }}</button>
        </div>
      </section>
    </div>

    <p v-if="toast" class="mh5-community-toast">{{ toast }}</p>
  </div>
</template>
