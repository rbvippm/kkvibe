<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import {
  CREDIT_NAME_MAX_LEN,
  formatCreditWalletBalance,
  type CreditWalletItem,
} from '../../constants/walletCatalog'
import Mh5VipCreditAccountSheet from './Mh5VipCreditAccountSheet.vue'
import '../../styles/mobile-app-shell.css'

const emit = defineEmits<{
  go: [routeName: string]
  toast: [message: string]
}>()

defineProps<{
  actions: { key: string; label: string; icon: string; route?: string }[]
}>()

const { wallets, hasCreditWallet, selectedWallet, updateDisplayName } = useVipCreditAccounts()
const balanceHidden = ref(false)
const refreshing = ref(false)
const accountSheetOpen = ref(false)
const nameEditorOpen = ref(false)
const nameTargetId = ref('')
const nameDraft = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

const nameTarget = computed(
  () => wallets.value.find((item) => item.id === nameTargetId.value) ?? null,
)
const nameDraftTrimmed = computed(() => nameDraft.value.trim())
const nameDraftLength = computed(() => nameDraft.value.length)

const amountText = computed(() => {
  const wallet = selectedWallet.value
  if (!wallet) return ''
  const amount = formatCreditWalletBalance(wallet.balance)
  return balanceHidden.value ? `${wallet.symbol}\u00A0****` : `${wallet.symbol}\u00A0${amount}`
})

function openAccountSheet() {
  accountSheetOpen.value = true
}

function closeAccountSheet() {
  accountSheetOpen.value = false
}

/** 余额卡箭头改当前账户；信用额度弹层铅笔改对应账户，均不切换选中项 */
function openNameEditor(item: CreditWalletItem | undefined = selectedWallet.value) {
  if (!item) return
  nameTargetId.value = item.id
  nameDraft.value = item.displayName
  nameEditorOpen.value = true
  void nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

function closeNameEditor() {
  nameEditorOpen.value = false
}

function saveDisplayName() {
  const next = nameDraftTrimmed.value
  const target = nameTarget.value
  if (!next || !target) return
  if (next === target.displayName) {
    closeNameEditor()
    return
  }
  updateDisplayName(next, target.id)
  closeNameEditor()
  emit('toast', '已修改')
}

function handleRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
  }, 800)
}

function goAction(route?: string) {
  if (route) emit('go', route)
}
</script>

<template>
  <section class="mh5-mine-credit">
    <div v-if="!hasCreditWallet || !selectedWallet" class="mh5-mine-credit__card mh5-mine-credit__blank">
      <span class="mh5-mine-credit__blank-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6" />
          <path d="M3 10h18" stroke="currentColor" stroke-width="1.6" />
          <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span class="mh5-mine-credit__blank-text">
        <strong>{{ $t('暂无信用钱包') }}</strong>
        <em>{{ $t('通过会员邀请注册的账号，需由代理开通信用钱包后才能进入贵宾厅游戏。') }}</em>
      </span>
    </div>

    <template v-else>
    <div class="mh5-mine-credit__head">
      <button
        type="button"
        class="mh5-mine-credit__switch"
        :aria-label="$t('选择账户')"
        @click.stop="openAccountSheet"
      >
        <img
          class="mh5-mine-credit__avatar"
          :src="selectedWallet.icon"
          alt=""
          width="32"
          height="32"
        />
        <span class="mh5-mine-credit__switch-meta">
          <span class="mh5-mine-credit__code">
            <span class="mh5-mine-credit__name">{{ selectedWallet.displayName }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </span>
        </span>
      </button>
      <button
        type="button"
        class="mh5-mine-credit__refresh"
        :class="{ 'mh5-mine-credit__refresh--spin': refreshing }"
        :aria-label="$t('刷新余额')"
        @click="handleRefresh"
      >
        <img src="/images/mine/icon-refresh.svg" alt="" class="mh5-mine-icon mh5-mine-icon--20" />
        <span>{{ $t('刷新余额') }}</span>
      </button>
    </div>

    <div class="mh5-mine-credit__card">
      <div class="mh5-mine-wallet__balance">
        <span class="mh5-mine-wallet__amount mh5-mine-credit__amount">{{ amountText }}</span>
        <button
          type="button"
          class="mh5-mine-wallet__icon-btn"
          :aria-label="balanceHidden ? '显示余额' : '隐藏余额'"
          @click="balanceHidden = !balanceHidden"
        >
          <svg v-if="!balanceHidden" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 3l18 18M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M6.7 6.7C4.6 8.1 3 10 3 10s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8M17.3 17.3C19.4 15.9 21 14 21 14s-3.5-6-10-6c-1.1 0-2.1.2-3 .5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <div class="mh5-mine-credit__tools">
        <span class="mh5-mine-credit__name-pill">{{ $t('代理名称') }}</span>
        <button
          type="button"
          class="mh5-mine-credit__name-arrow"
          :aria-label="$t('钱包名称')"
          @click.stop="openNameEditor()"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
    </template>

    <div class="mh5-mine-credit__actions">
      <button
        v-for="item in actions"
        :key="item.key"
        type="button"
        class="mh5-mine-credit__action"
        @click="goAction(item.route)"
      >
        <span class="mh5-mine-credit__action-icon">
          <img :src="item.icon" alt="" class="mh5-mine-icon mh5-mine-icon--32" />
        </span>
        {{ $t(item.label) }}
      </button>
    </div>
  </section>

  <Mh5VipCreditAccountSheet
    :open="accountSheetOpen"
    teleport-to="#mh5-mine-overlays"
    mask-class="mh5-wallet-sheet-mask"
    editable-name
    @close="closeAccountSheet"
    @edit-name="openNameEditor"
  />

  <Teleport to="#mh5-mine-overlays" defer>
  <Transition name="mh5-confirm">
    <div v-if="nameEditorOpen" class="mh5-mine-prompt-mask" @click.self="closeNameEditor">
      <div class="mh5-mine-prompt mh5-mine-prompt--vip" role="dialog" aria-modal="true" aria-labelledby="mh5-credit-name-title">
        <h2 id="mh5-credit-name-title" class="mh5-mine-prompt__title">{{ $t('修改钱包名称') }}</h2>
        <p class="mh5-mine-prompt__hint">{{ $t('输入的名称不超过12个字符。') }}</p>
        <div class="mh5-mine-prompt__field">
          <input
            ref="nameInputRef"
            v-model="nameDraft"
            class="mh5-mine-prompt__input"
            type="text"
            :maxlength="CREDIT_NAME_MAX_LEN"
            :placeholder="$t('请输入钱包名称')"
            @keydown.enter.prevent="saveDisplayName"
          />
          <span class="mh5-mine-prompt__count" aria-hidden="true">{{ nameDraftLength }}/{{ CREDIT_NAME_MAX_LEN }}</span>
        </div>
        <div class="mh5-mine-prompt__actions">
          <button type="button" class="mh5-mine-prompt__btn" @click="closeNameEditor">{{ $t('取消') }}</button>
          <button
            type="button"
            class="mh5-mine-prompt__btn mh5-mine-prompt__btn--primary"
            :disabled="!nameDraftTrimmed"
            @click="saveDisplayName"
          >
            {{ $t('确认') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>
