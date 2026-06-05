<script setup lang="ts">
import { computed, ref } from 'vue'
import WfUserTurnoverAdjustAnnot from '../../components/wireframe/WfUserTurnoverAdjustAnnot.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  getTurnoverPairCurrencies,
  getTurnoverPairDisplayLabel,
  isPairedTurnoverCurrency,
  USER_ACTIVITY_GOLD_CURRENCIES,
} from '../../constants/userAssetCurrency'
import '../../styles/pc-wireframe.css'

type TurnoverAdjustMethod = 'increase' | 'decrease' | ''

const TURNOVER_ADJUST_METHOD_OPTIONS = [
  { value: 'increase' as const, label: '后台增加' },
  { value: 'decrease' as const, label: '后台减少' },
]

type AccountTab = 'crypto' | 'fiat'
type AssetTab = 'wallet' | 'bank'

type WalletRow = {
  id: string
  currency: string
  tradable: number
  frozen: number
  address: string
}

const accountTab = ref<AccountTab>('crypto')
const assetTab = ref<AssetTab>('wallet')
const fiatUnit = ref('cny')
const lastUpdatedAt = ref('2026-06-05 16:34:16')
const refreshing = ref(false)
const turnoverByCurrency = ref<Record<string, number>>({
  'USDT-TRON': 800,
  'USDT-SOL': 0,
  KKC: 1500,
  KKV: 350,
  ETH: 0,
  BTC: 0,
  TRX: 0,
  SOL: 0,
  '活动金-USDT-TRON': 800,
  '活动金-KKC': 1500,
  '活动金-KKV': 350,
  CNY: 120.5,
  USD: 200,
})
const turnoverModalVisible = ref(false)
const turnoverAdjustCurrency = ref('')
const turnoverAdjustMethod = ref<TurnoverAdjustMethod>('')
const turnoverAdjustAmount = ref('')
const turnoverAdjustReason = ref('')
const turnoverSubmitHint = ref('')

const cryptoWalletRows = ref<WalletRow[]>([
  {
    id: 'w1',
    currency: 'USDT-TRON',
    tradable: 0,
    frozen: 0,
    address: 'TQn9Y2khEsLMWDmP8xKm9Y2khEsLMWDmP8xKm',
  },
  {
    id: 'w2',
    currency: 'USDT-SOL',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  {
    id: 'w3',
    currency: 'KKC',
    tradable: 1000,
    frozen: 0,
    address: 'KKC8xKm9Y2khEsLMWDmP8xKm9Y2khEsLM',
  },
  {
    id: 'w3b',
    currency: 'KKV',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  {
    id: 'w4',
    currency: 'ETH',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  {
    id: 'w5',
    currency: 'BTC',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  {
    id: 'w6',
    currency: 'TRX',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  {
    id: 'w7',
    currency: 'SOL',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  ...USER_ACTIVITY_GOLD_CURRENCIES.map((currency, index) => ({
    id: `w-activity-${index + 1}`,
    currency,
    tradable: currency === '活动金-USDT-TRON' ? 500 : currency === '活动金-KKV' ? 200 : 0,
    frozen: 0,
    address: '',
  })),
])

const fiatWalletRows = ref<WalletRow[]>([
  {
    id: 'f1',
    currency: 'CNY',
    tradable: 677.38,
    frozen: 0,
    address: '',
  },
  {
    id: 'f2',
    currency: 'USD',
    tradable: 1000,
    frozen: 0,
    address: '',
  },
])

const bankRows = ref([
  { id: 'b1', bankName: '中国工商银行', cardNo: '6222 **** **** 1234', balance: 5000, currency: 'CNY' },
])

const totalAssetCny = computed(() => {
  if (accountTab.value === 'fiat') return '1677.38'
  return '1677.38'
})

const displayRows = computed(() => {
  if (assetTab.value === 'bank') return []
  return accountTab.value === 'crypto' ? cryptoWalletRows.value : fiatWalletRows.value
})

const allCurrencyOptions = computed(() => {
  const currencies = new Set<string>()
  for (const row of cryptoWalletRows.value) currencies.add(row.currency)
  return [...currencies]
})

function formatAmount(value: number) {
  if (value === 0) return '0.000000'
  if (Number.isInteger(value)) return value.toFixed(2)
  return value.toFixed(6)
}

function totalAmount(row: WalletRow) {
  return row.tradable + row.frozen
}

function syncPairedTurnover(currency: string, value: number) {
  const rounded = Math.round(value * 100) / 100
  for (const item of getTurnoverPairCurrencies(currency)) {
    turnoverByCurrency.value[item] = rounded
  }
  return rounded
}

function getRemainingTurnover(currency: string) {
  const [primary] = getTurnoverPairCurrencies(currency)
  return turnoverByCurrency.value[primary] ?? 0
}

function formatRemainingWithdrawTurnover(row: WalletRow) {
  return getRemainingTurnover(row.currency).toFixed(2)
}

const selectedTurnoverText = computed(() => {
  if (!turnoverAdjustCurrency.value) return '—'
  return getRemainingTurnover(turnoverAdjustCurrency.value).toFixed(2)
})

async function refreshAssets() {
  if (refreshing.value) return
  refreshing.value = true
  await new Promise((r) => setTimeout(r, 600))
  const now = new Date()
  lastUpdatedAt.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  refreshing.value = false
}

function openTurnoverModal() {
  turnoverAdjustCurrency.value = ''
  turnoverAdjustMethod.value = ''
  turnoverAdjustAmount.value = ''
  turnoverAdjustReason.value = ''
  turnoverSubmitHint.value = ''
  turnoverModalVisible.value = true
}

function closeTurnoverModal() {
  turnoverModalVisible.value = false
}

function confirmTurnoverAdjust() {
  if (!turnoverAdjustCurrency.value) {
    turnoverSubmitHint.value = '请选择币种'
    return
  }
  if (!turnoverAdjustMethod.value) {
    turnoverSubmitHint.value = '请选择方式'
    return
  }
  const rawAmount = Number(turnoverAdjustAmount.value)
  if (!turnoverAdjustAmount.value.trim() || Number.isNaN(rawAmount) || rawAmount <= 0) {
    turnoverSubmitHint.value = '请输入有效的流水金额'
    return
  }
  if (!turnoverAdjustReason.value.trim()) {
    turnoverSubmitHint.value = '请输入调整理由'
    return
  }
  if (turnoverAdjustReason.value.trim().length > 16) {
    turnoverSubmitHint.value = '调整理由最长 16 个字符'
    return
  }
  const amount = turnoverAdjustMethod.value === 'decrease' ? -rawAmount : rawAmount
  const currency = turnoverAdjustCurrency.value
  const prev = getRemainingTurnover(currency)
  const next = Math.round((prev + amount) * 100) / 100
  if (isPairedTurnoverCurrency(currency)) {
    syncPairedTurnover(currency, next)
  } else {
    turnoverByCurrency.value[currency] = next
  }
  const displayCurrency = isPairedTurnoverCurrency(currency)
    ? getTurnoverPairDisplayLabel(currency)
    : currency
  turnoverSubmitHint.value = ''
  closeTurnoverModal()
  window.alert(
    `演示：${displayCurrency} 提现流水要求已调整 ${amount >= 0 ? '+' : ''}${amount}，当前为 ${next.toFixed(2)}`,
  )
}
</script>

<template>
  <div class="pc-wireframe-page user-asset-page">
    <WfPagePathMenu />

    <h1 class="user-asset-page__title">用户资产详情</h1>

    <div class="user-asset-page__account-tabs">
      <button
        type="button"
        class="user-asset-page__account-tab"
        :class="{ 'user-asset-page__account-tab--active': accountTab === 'crypto' }"
        @click="accountTab = 'crypto'"
      >
        虚拟货币账户
      </button>
      <button
        type="button"
        class="user-asset-page__account-tab"
        :class="{ 'user-asset-page__account-tab--active': accountTab === 'fiat' }"
        @click="accountTab = 'fiat'"
      >
        法币账户
      </button>
    </div>

    <div class="user-asset-page__summary">
      <div class="user-asset-page__summary-left">
        <span class="user-asset-page__summary-label">总资产：</span>
        <span class="user-asset-page__summary-value">CNY {{ totalAssetCny }}</span>
        <select v-model="fiatUnit" class="wf-input wf-input--select user-asset-page__unit-select">
          <option value="cny">人民币</option>
          <option value="usd">美元</option>
        </select>
      </div>
      <div class="user-asset-page__summary-right">
        <span class="user-asset-page__updated">最后一次更新时间：{{ lastUpdatedAt }}</span>
        <button
          type="button"
          class="user-asset-page__refresh"
          :disabled="refreshing"
          @click="refreshAssets"
        >
          {{ refreshing ? '刷新中…' : '刷新' }}
        </button>
      </div>
    </div>

    <div class="user-asset-page__asset-bar">
      <div class="user-asset-page__asset-tabs">
        <button
          type="button"
          class="user-asset-page__asset-tab"
          :class="{ 'user-asset-page__asset-tab--active': assetTab === 'wallet' }"
          @click="assetTab = 'wallet'"
        >
          钱包余额资产
        </button>
        <button
          type="button"
          class="user-asset-page__asset-tab"
          :class="{ 'user-asset-page__asset-tab--active': assetTab === 'bank' }"
          @click="assetTab = 'bank'"
        >
          银行资产
        </button>
      </div>
      <div class="user-asset-page__turnover-entry-wrap">
        <button type="button" class="user-asset-page__turnover-entry" @click="openTurnoverModal">
          调整提现流水
        </button>
        <WfUserTurnoverAdjustAnnot context="entry" placement="bottom" />
      </div>
    </div>

    <div v-if="assetTab === 'wallet'" class="wf-table-wrap">
      <table class="wf-table user-asset-page__table">
        <thead>
          <tr>
            <th class="wf-th">持有币种</th>
            <th class="wf-th">可进行交易的货币数（单位/个）</th>
            <th class="wf-th">冻结的货币数（单位/个）</th>
            <th class="wf-th">总资产（单位/个）</th>
            <th class="wf-th wf-th--with-spec">
              剩余提现流水要求
              <WfUserTurnoverAdjustAnnot context="remaining" placement="bottom" />
            </th>
            <th class="wf-th">钱包地址</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in displayRows" :key="row.id">
            <td class="wf-td">{{ row.currency }}</td>
            <td class="wf-td wf-td--num">{{ formatAmount(row.tradable) }}</td>
            <td class="wf-td wf-td--num">{{ formatAmount(row.frozen) }}</td>
            <td class="wf-td wf-td--num">{{ formatAmount(totalAmount(row)) }}</td>
            <td class="wf-td wf-td--num">{{ formatRemainingWithdrawTurnover(row) }}</td>
            <td class="wf-td user-asset-page__address">
              {{ row.address || '暂未使用' }}
            </td>
          </tr>
          <tr v-if="!displayRows.length">
            <td colspan="6" class="wf-td wf-td--empty">暂无资产数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wf-table-wrap">
      <table class="wf-table user-asset-page__table">
        <thead>
          <tr>
            <th class="wf-th">银行名称</th>
            <th class="wf-th">银行卡号</th>
            <th class="wf-th">余额</th>
            <th class="wf-th">币种</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in bankRows" :key="row.id">
            <td class="wf-td">{{ row.bankName }}</td>
            <td class="wf-td">{{ row.cardNo }}</td>
            <td class="wf-td wf-td--num">{{ row.balance.toFixed(2) }}</td>
            <td class="wf-td">{{ row.currency }}</td>
          </tr>
          <tr v-if="!bankRows.length">
            <td colspan="4" class="wf-td wf-td--empty">暂无银行资产</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div
        v-if="turnoverModalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeTurnoverModal"
      >
        <div
          class="wf-modal"
          role="dialog"
          aria-labelledby="adjust-turnover-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="adjust-turnover-title" class="wf-modal__title">调整提现流水</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeTurnoverModal">×</button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-form-row user-asset-page__turnover-currency">
              <label class="wf-form-row__label wf-form-row__label--required">选择币种</label>
              <select v-model="turnoverAdjustCurrency" class="wf-select wf-select--full">
                <option value="">请选择</option>
                <option v-for="currency in allCurrencyOptions" :key="currency" :value="currency">
                  {{ currency }}
                </option>
              </select>
            </div>
            <p class="user-asset-page__turnover-current">
              当前提现流水要求：<strong>{{ selectedTurnoverText }}</strong>
            </p>
            <form class="wf-modal__form" @submit.prevent="confirmTurnoverAdjust">
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">方式</label>
                <select v-model="turnoverAdjustMethod" class="wf-select wf-select--full">
                  <option value="">请选择</option>
                  <option
                    v-for="opt in TURNOVER_ADJUST_METHOD_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">流水</label>
                <div class="wf-form-row__field-head">
                  <input
                    v-model="turnoverAdjustAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    class="wf-input wf-input--full"
                    placeholder="请输入流水金额"
                  />
                  <WfUserTurnoverAdjustAnnot context="amount" />
                </div>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">调整理由</label>
                <div class="wf-form-row__field-head">
                  <input
                    v-model="turnoverAdjustReason"
                    type="text"
                    maxlength="16"
                    class="wf-input wf-input--full"
                    placeholder="请输入调整理由"
                  />
                  <WfUserTurnoverAdjustAnnot context="reason" />
                </div>
              </div>
            </form>
            <p v-if="turnoverSubmitHint" class="wf-modal__hint">{{ turnoverSubmitHint }}</p>
          </div>
          <div class="wf-modal__footer wf-modal__footer--center">
            <button type="button" class="wf-btn wf-btn--default" @click="closeTurnoverModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary wf-btn--lg" @click="confirmTurnoverAdjust">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.user-asset-page__title {
  margin: 0 0 16px;
  font-size: var(--pc-font-size-title, 16px);
  font-weight: 600;
  color: var(--pc-text, #262626);
}

.user-asset-page__account-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--pc-border-light, #e8e8e8);
}

.user-asset-page__account-tab {
  padding: 0 0 10px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--pc-text-secondary, #666);
  font-size: var(--pc-font-size, 14px);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.user-asset-page__account-tab--active {
  border-bottom-color: var(--pc-primary, #1890ff);
  color: var(--pc-primary, #1890ff);
  font-weight: 500;
}

.user-asset-page__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.user-asset-page__summary-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-asset-page__summary-label {
  color: var(--pc-text, #333);
}

.user-asset-page__summary-value {
  font-weight: 600;
  color: var(--pc-text, #333);
}

.user-asset-page__unit-select {
  width: 100px;
}

.user-asset-page__summary-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--pc-text-secondary, #666);
  font-size: var(--pc-font-size-sm, 12px);
}

.user-asset-page__refresh {
  border: none;
  background: none;
  color: var(--pc-primary, #1890ff);
  font-size: var(--pc-font-size-sm, 12px);
  cursor: pointer;
}

.user-asset-page__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-asset-page__asset-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.user-asset-page__asset-tabs {
  display: flex;
  gap: 8px;
}

.user-asset-page__turnover-entry-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}

.user-asset-page__turnover-entry {
  padding: 6px 0;
  border: none;
  background: none;
  color: var(--pc-primary, #1890ff);
  font-size: var(--pc-font-size, 14px);
  cursor: pointer;
  transition: opacity 0.15s;
}

.user-asset-page__turnover-entry:hover {
  opacity: 0.85;
}

.user-asset-page__turnover-currency {
  margin-bottom: 12px;
}

.user-asset-page__turnover-current {
  margin: 0 0 16px;
  color: var(--pc-text-secondary, #666);
  font-size: var(--pc-font-size, 14px);
}

.user-asset-page__turnover-current strong {
  color: var(--pc-text, #333);
  font-weight: 600;
}

.user-asset-page__asset-tab {
  padding: 6px 16px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: var(--pc-radius, 2px);
  background: #fff;
  color: var(--pc-text, #333);
  font-size: var(--pc-font-size, 14px);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.user-asset-page__asset-tab--active {
  border-color: var(--pc-primary, #1890ff);
  background: var(--pc-primary, #1890ff);
  color: #fff;
}

.user-asset-page__table .wf-td--num {
  font-variant-numeric: tabular-nums;
}

.user-asset-page__address {
  max-width: 280px;
  word-break: break-all;
  font-size: var(--pc-font-size-sm, 12px);
  color: var(--pc-text-secondary, #666);
}
</style>
