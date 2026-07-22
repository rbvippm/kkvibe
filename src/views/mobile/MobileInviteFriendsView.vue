<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { countClaimableInviteRebates, INVITE_PROFILE } from '../../constants/inviteFriends'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const toast = ref('')
const posterIndex = ref(2)

const posters = [
  { id: 'p1', tone: '#c62828' },
  { id: 'p2', tone: '#ad1457' },
  { id: 'p3', tone: '#b71c1c' },
]

function showToast(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1600)
}

async function copyInviteCode() {
  try {
    await navigator.clipboard.writeText(INVITE_PROFILE.inviteCode)
    showToast('邀请码已复制')
  } catch {
    showToast(`邀请码：${INVITE_PROFILE.inviteCode}`)
  }
}

function shareInvite() {
  showToast('已唤起分享（原型）')
}

function saveImage() {
  showToast('海报已保存到相册（原型）')
}

function openContacts() {
  showToast('打开通讯录邀请（原型）')
}

function goRecords() {
  router.push({ name: 'mobile-invite-records' })
}

function goInviteRebate() {
  router.push({ name: 'mobile-invite-rebate' })
}

function goBackToMine() {
  router.push({ name: 'mobile-mine' })
}

/** 有代理身份时不展示邀请返利入口 */
const showInviteRebateEntry = computed(() => !memberAgentMembershipJoined.value)

/** 邀请返利入口角标：可领取笔数 */
const claimableRebateCount = computed(() =>
  showInviteRebateEntry.value ? countClaimableInviteRebates() : 0,
)
</script>

<template>
  <div class="mh5-invite-page">
    <Mh5SubPageHeader title="邀请" :on-back="goBackToMine" />

    <main class="mh5-invite-page__main">
      <section class="mh5-invite-card" aria-label="邀请海报">
        <div class="mh5-invite-card__poster" :style="{ background: posters[posterIndex].tone }">
          <div class="mh5-invite-card__qr-wrap" aria-hidden="true">
            <div class="mh5-invite-card__qr">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div class="mh5-invite-card__body">
          <div class="mh5-invite-card__user">
            <img :src="INVITE_PROFILE.avatar" alt="" class="mh5-invite-card__avatar" />
            <div>
              <p class="mh5-invite-card__name">{{ INVITE_PROFILE.username }}</p>
              <p class="mh5-invite-card__slogan">{{ INVITE_PROFILE.slogan }}</p>
            </div>
          </div>
          <button type="button" class="mh5-invite-card__share" @click="shareInvite">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 7V4l7 7-7 7v-3.2C8.5 14.8 5.5 16.2 3 19c1-5 4-9.2 11-12z"
                fill="currentColor"
              />
            </svg>
            邀请好友
          </button>
        </div>

        <div class="mh5-invite-card__code">
          <span>邀请码</span>
          <button type="button" class="mh5-invite-card__code-btn" @click="copyInviteCode">
            {{ INVITE_PROFILE.inviteCode }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="8"
                y="8"
                width="11"
                height="11"
                rx="2"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <path
                d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </section>

      <div class="mh5-invite-dots" role="tablist" aria-label="海报切换">
        <button
          v-for="(item, index) in posters"
          :key="item.id"
          type="button"
          class="mh5-invite-dots__item"
          :class="{ 'mh5-invite-dots__item--active': posterIndex === index }"
          :aria-selected="posterIndex === index"
          @click="posterIndex = index"
        />
      </div>

      <section
        class="mh5-invite-actions"
        :class="{ 'mh5-invite-actions--with-rebate': showInviteRebateEntry }"
        aria-label="邀请操作"
      >
        <button type="button" class="mh5-invite-actions__item" @click="saveImage">
          <span class="mh5-invite-actions__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v10m0 0l3.5-3.5M12 14l-3.5-3.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5 17.5V19a2 2 0 002 2h10a2 2 0 002-2v-1.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>保存图片</span>
        </button>
        <button type="button" class="mh5-invite-actions__item" @click="openContacts">
          <span class="mh5-invite-actions__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M4 18c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <circle cx="17" cy="9" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M16 14.2c1.8.3 3.2 1.5 3.2 3.3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>通讯录</span>
        </button>
        <button type="button" class="mh5-invite-actions__item" @click="goRecords">
          <span class="mh5-invite-actions__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M6.5 18c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <circle cx="17.5" cy="7.5" r="3" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M17.5 6.2v1.5l1 .6"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>邀请记录</span>
        </button>
        <button
          v-if="showInviteRebateEntry"
          type="button"
          class="mh5-invite-actions__item"
          @click="goInviteRebate"
        >
          <span class="mh5-invite-actions__icon-wrap">
            <span class="mh5-invite-actions__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" />
                <path
                  d="M12 7v10M9.5 9.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 2-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span
              v-if="claimableRebateCount > 0"
              class="mh5-invite-actions__badge"
              :aria-label="`${claimableRebateCount}笔可领取返利`"
            >
              {{ claimableRebateCount > 99 ? '99+' : claimableRebateCount }}
            </span>
          </span>
          <span>邀请返利</span>
        </button>
      </section>
    </main>

    <p v-if="toast" class="mh5-invite-toast" role="status">{{ toast }}</p>
  </div>
</template>

<style scoped>
.mh5-invite-page {
  min-height: 100%;
  background: #f5f6f8;
}

.mh5-invite-page__main {
  padding: 12px 16px 28px;
}

.mh5-invite-card {
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.mh5-invite-card__poster {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.12), transparent 45%);
}

.mh5-invite-card__qr-wrap {
  padding: 10px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.mh5-invite-card__qr {
  position: relative;
  width: 112px;
  height: 112px;
  background:
    linear-gradient(#111 0 0) 0 0 / 28% 28%,
    linear-gradient(#111 0 0) 100% 0 / 28% 28%,
    linear-gradient(#111 0 0) 0 100% / 28% 28%,
    repeating-linear-gradient(90deg, #111 0 4px, transparent 4px 8px) 34% 34% / 32% 32%,
    repeating-linear-gradient(#111 0 4px, transparent 4px 8px) 34% 34% / 32% 32%,
    #fff;
  background-repeat: no-repeat;
}

.mh5-invite-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 10px;
}

.mh5-invite-card__user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mh5-invite-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  object-fit: cover;
}

.mh5-invite-card__name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mh5-invite-card__slogan {
  margin: 2px 0 0;
  font-size: 12px;
  color: #999;
}

.mh5-invite-card__share {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: #ff8a1f;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.mh5-invite-card__share:active {
  opacity: 0.88;
}

.mh5-invite-card__code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 14px 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f7f8fa;
  color: #666;
  font-size: 13px;
}

.mh5-invite-card__code-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #222;
  font-size: 15px;
  font-weight: 600;
}

.mh5-invite-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 14px 0 20px;
}

.mh5-invite-dots__item {
  width: 6px;
  height: 6px;
  border: none;
  border-radius: 50%;
  background: #d0d3d8;
  padding: 0;
}

.mh5-invite-dots__item--active {
  width: 14px;
  border-radius: 999px;
  background: #ff8a1f;
}

.mh5-invite-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mh5-invite-actions--with-rebate {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.mh5-invite-actions__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border: none;
  border-radius: 12px;
  background: #fff;
  color: #333;
  font-size: 12px;
}

.mh5-invite-actions__item:active {
  background: #f3f4f6;
}

.mh5-invite-actions__icon-wrap {
  position: relative;
  display: inline-flex;
}

.mh5-invite-actions__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f7f8fa;
  color: #555;
}

.mh5-invite-actions__badge {
  position: absolute;
  top: -4px;
  right: -6px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.mh5-invite-toast {
  position: fixed;
  left: 50%;
  bottom: 88px;
  z-index: 40;
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  font-size: 13px;
  transform: translateX(-50%);
  white-space: nowrap;
}
</style>
