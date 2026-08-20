<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import { CREDIT_NAME_MAX_LEN, formatCreditWalletBalance } from '../../constants/walletCatalog'
import Mh5VipCreditAccountSheet from './Mh5VipCreditAccountSheet.vue'
import '../../styles/mobile-app-shell.css'

const emit = defineEmits<{
  go: [routeName: string]
}>()

defineProps<{
  actions: { key: string; label: string; icon: string; route?: string }[]
}>()

const { selectedWallet, updateDisplayName } = useVipCreditAccounts()
const balanceHidden = ref(false)
const refreshing = ref(false)
const accountSheetOpen = ref(false)
const nameEditorOpen = ref(false)
const nameDraft = ref('')
const nameError = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

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

function openNameEditor() {
  nameDraft.value = selectedWallet.value?.displayName ?? ''
  nameError.value = ''
  nameEditorOpen.value = true
  void nextTick(() => nameInputRef.value?.focus())
}

function closeNameEditor() {
  nameEditorOpen.value = false
  nameError.value = ''
}

function saveDisplayName() {
  const next = nameDraft.value.trim()
  if (!next) {
    nameError.value = '请输入名称'
    return
  }
  if (next.length > CREDIT_NAME_MAX_LEN) {
    nameError.value = '输入的名称不超过12个字符。'
    return
  }
  updateDisplayName(next)
  closeNameEditor()
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
  <section v-if="selectedWallet" class="mh5-mine-credit">
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
          @click.stop="openNameEditor"
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
    @close="closeAccountSheet"
  />

  <Teleport to="#mh5-mine-overlays" defer>
  <Transition name="mh5-confirm">
    <div v-if="nameEditorOpen" class="mh5-mine-prompt-mask" @click.self="closeNameEditor">
      <div class="mh5-mine-prompt mh5-mine-prompt--vip" role="dialog" aria-modal="true" aria-labelledby="mh5-credit-name-title">
        <h2 id="mh5-credit-name-title" class="mh5-mine-prompt__title">{{ $t('钱包名称') }}</h2>
        <p class="mh5-mine-prompt__hint">{{ $t('输入的名称不超过12个字符。') }}</p>
        <input
          ref="nameInputRef"
          v-model="nameDraft"
          class="mh5-mine-prompt__input"
          type="text"
          :maxlength="CREDIT_NAME_MAX_LEN"
          :placeholder="selectedWallet?.accountCode"
        />
        <p v-if="nameError" class="mh5-mine-prompt__error">{{ $t(nameError) }}</p>
        <div class="mh5-mine-prompt__actions">
          <button type="button" class="mh5-mine-prompt__btn" @click="closeNameEditor">{{ $t('取消') }}</button>
          <button type="button" class="mh5-mine-prompt__btn mh5-mine-prompt__btn--primary" @click="saveDisplayName">
            {{ $t('确认') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>
