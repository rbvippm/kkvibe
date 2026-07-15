<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  getTurnoverPairCurrencies,
  getTurnoverPairDisplayLabel,
  isPairedTurnoverCurrency,
  USER_ACTIVITY_GOLD_CURRENCIES,
  WITHDRAW_TURNOVER_CURRENCIES,
} from '../../constants/userAssetCurrency'
import {
  flowTypeLabel,
  formatFundAmount,
  MOCK_USER_FUND_FLOWS,
  USER_CREDIT_LIMIT_CURRENCIES,
  USER_DETAIL_MODULE_TABS,
  USER_FUND_CURRENCIES,
  USER_FUND_FLOW_TYPE_OPTIONS,
  USER_FUND_TX_TYPES,
  type UserDetailModuleKey,
  type UserFundFlowRow,
  type UserFundFlowType,
} from '../../constants/userDetail'
import {
  USER_DETAIL_CREDIT_TAB_SPEC,
  USER_DETAIL_SPEC_ANNOT_NO,
} from '../../constants/userDetailSpec'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import '../../styles/pc-wireframe.css'

type TurnoverAdjustMethod = 'increase' | 'decrease' | ''
type AccountTab = 'crypto' | 'fiat' | 'credit'
type AssetTab = 'wallet' | 'bank'

type WalletRow = {
  id: string
  currency: string
  tradable: number
  frozen: number
  address: string
}

const TURNOVER_ADJUST_METHOD_OPTIONS = [
  { value: 'increase' as const, label: '后台增加' },
  { value: 'decrease' as const, label: '后台减少' },
]

const PAGE_SEGMENTS = ['用户管理', '用户列表', '用户详情']

const route = useRoute()
const router = useRouter()

const moduleTab = ref<UserDetailModuleKey>('fund')
const accountTab = ref<AccountTab>('crypto')
const assetTab = ref<AssetTab>('wallet')
const fiatUnit = ref('cny')
const lastUpdatedAt = ref('2026-07-15 22:37:00')
const refreshing = ref(false)

const currentUserId = computed(() => {
  const q = route.query.userId
  return typeof q === 'string' && q ? q : '7831562076704421988'
})

const turnoverByCurrency = ref<Record<string, number>>({
  'USDT-TRON': 0,
  'USDT-SOL': 0,
  KKC: 1000,
  KKV: 0,
  ETH: 0,
  BTC: 0,
  TRX: 0,
  SOL: 0,
  '活动金-USDT-TRON': 0,
  '活动金-KKC': 1000,
  '活动金-KKV': 0,
  CNY: 0,
  USD: 0,
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
    tradable: 2147.483647,
    frozen: 0,
    address: 'TX1puwefa5LX5ej1aYiQP26abcdef123456',
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
    id: 'w3b',
    currency: 'KKV',
    tradable: 0,
    frozen: 0,
    address: '',
  },
  ...USER_ACTIVITY_GOLD_CURRENCIES.map((currency, index) => ({
    id: `w-activity-${index + 1}`,
    currency,
    tradable: currency === '活动金-KKC' ? 200 : 0,
    frozen: 0,
    address: '',
  })),
])

const fiatWalletRows = ref<WalletRow[]>([
  { id: 'f1', currency: 'CNY', tradable: 677.38, frozen: 0, address: '' },
  { id: 'f2', currency: 'USD', tradable: 1000, frozen: 0, address: '' },
])

const creditWalletRows = ref<WalletRow[]>(
  USER_CREDIT_LIMIT_CURRENCIES.map((currency, index) => ({
    id: `c${index + 1}`,
    currency,
    tradable:
      currency === '代理-信用额度-CNY'
        ? 50000
        : currency === '代理-信用额度-USD'
          ? 8000
          : currency === '会员-信用额度-CNY'
            ? 12000
            : 2000,
    frozen: currency === '会员-信用额度-CNY' ? 500 : 0,
    address: '',
  })),
)

const bankRows = ref([
  { id: 'b1', bankName: '中国工商银行', cardNo: '6222 **** **** 1234', balance: 5000, currency: 'CNY' },
])

const totalAssetCny = computed(() => (fiatUnit.value === 'usd' ? '2983858.09' : '21483778.24'))

const displayRows = computed(() => {
  if (accountTab.value === 'credit') return creditWalletRows.value
  if (assetTab.value === 'bank') return []
  return accountTab.value === 'crypto' ? cryptoWalletRows.value : fiatWalletRows.value
})

/* ---------- 资金明细 ---------- */
type LedgerFilter = {
  currencies: string[]
  fiat: string
  txTypes: string[]
  orderNo: string
  flowNo: string
  flowType: '' | UserFundFlowType
  startDate: string
  endDate: string
  miniProgram: string
  developer: string
}

const defaultLedgerFilter = (): LedgerFilter => ({
  currencies: [],
  fiat: '',
  txTypes: [],
  orderNo: '',
  flowNo: '',
  flowType: '',
  startDate: '',
  endDate: '',
  miniProgram: '',
  developer: '',
})

const ledgerFilter = ref<LedgerFilter>(defaultLedgerFilter())
const appliedLedgerFilter = ref<LedgerFilter>(defaultLedgerFilter())
const ledgerHint = ref('')
const fundFlows = ref<UserFundFlowRow[]>(MOCK_USER_FUND_FLOWS.map((row) => ({ ...row })))

const detailVisible = ref(false)
const detailRow = ref<UserFundFlowRow | null>(null)

function formatAmount(value: number) {
  if (value === 0) return '0.000000'
  if (Number.isInteger(value)) return `${value}.000000`
  return value.toFixed(6)
}

function totalAmount(row: WalletRow) {
  return row.tradable + row.frozen
}

function truncateAddress(address: string) {
  if (!address) return '暂未使用'
  if (address.length <= 26) return address
  return `${address.slice(0, 22)}...`
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

function toggleChip(list: string[], value: string) {
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function applyLedgerFilter() {
  if (
    ledgerFilter.value.startDate &&
    ledgerFilter.value.endDate &&
    ledgerFilter.value.startDate > ledgerFilter.value.endDate
  ) {
    ledgerHint.value = '结束日期不能早于开始日期'
    return
  }
  ledgerHint.value = ''
  appliedLedgerFilter.value = {
    ...ledgerFilter.value,
    currencies: [...ledgerFilter.value.currencies],
    txTypes: [...ledgerFilter.value.txTypes],
  }
}

function resetLedgerFilter() {
  ledgerFilter.value = defaultLedgerFilter()
  appliedLedgerFilter.value = defaultLedgerFilter()
  ledgerHint.value = ''
}

function exportLedger() {
  const count = filteredFundFlows.value.length
  ledgerHint.value = count ? `已模拟导出当前 ${count} 条资金明细` : '暂无数据可导出'
}

function matchFundFlow(row: UserFundFlowRow) {
  const f = appliedLedgerFilter.value
  if (f.currencies.length && !f.currencies.includes(row.currency)) return false
  if (f.txTypes.length && !f.txTypes.includes(row.txType)) return false
  if (f.orderNo && !row.exchangeOrderNo.includes(f.orderNo.trim())) return false
  if (f.flowNo && !row.flowNo.includes(f.flowNo.trim())) return false
  if (f.flowType && row.flowType !== f.flowType) return false
  if (f.startDate && row.createdAtBackend.slice(0, 10) < f.startDate) return false
  if (f.endDate && row.createdAtBackend.slice(0, 10) > f.endDate) return false
  if (f.miniProgram === 'has' && (!row.miniProgram || row.miniProgram === '-')) return false
  if (f.miniProgram === 'none' && row.miniProgram && row.miniProgram !== '-') return false
  if (f.developer === 'has' && (!row.developer || row.developer === '-')) return false
  if (f.developer === 'none' && row.developer && row.developer !== '-') return false
  if (f.fiat === 'cny' && row.currency !== 'CNY') return false
  return true
}

const filteredFundFlows = computed(() => fundFlows.value.filter(matchFundFlow))

function openFlowDetail(row: UserFundFlowRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeFlowDetail() {
  detailVisible.value = false
  detailRow.value = null
}

function goBackList() {
  void router.push({ name: 'pc-user-list' })
}

watch(
  () => route.query.userId,
  () => {
    moduleTab.value = 'fund'
  },
)
</script>

<template>
  <div class="pc-wireframe-page user-detail-page">
    <WfPagePathMenu :segments="PAGE_SEGMENTS" doc-route-name="pc-user-detail-doc" />

    <div class="user-detail-page__modules">
      <button
        v-for="tab in USER_DETAIL_MODULE_TABS"
        :key="tab.key"
        type="button"
        class="user-detail-page__module"
        :class="{ 'user-detail-page__module--active': moduleTab === tab.key }"
        @click="moduleTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="user-detail-page__meta">
      <span>当前用户ID：{{ currentUserId }}</span>
      <button type="button" class="wf-link-action" @click="goBackList">返回用户列表</button>
    </div>

    <template v-if="moduleTab === 'fund'">
      <!-- 用户资产详情（账变细化 · 提现流水调整） -->
      <section class="user-detail-page__section">
        <h2 class="user-detail-page__title">用户资产详情</h2>

        <div class="user-detail-page__account-tabs">
          <button
            type="button"
            class="user-detail-page__account-tab"
            :class="{ 'user-detail-page__account-tab--active': accountTab === 'crypto' }"
            @click="accountTab = 'crypto'"
          >
            虚拟货币账户
          </button>
          <button
            type="button"
            class="user-detail-page__account-tab"
            :class="{ 'user-detail-page__account-tab--active': accountTab === 'fiat' }"
            @click="accountTab = 'fiat'"
          >
            法币账户
          </button>
          <div class="user-detail-page__account-tab-item">
            <button
              type="button"
              class="user-detail-page__account-tab"
              :class="{ 'user-detail-page__account-tab--active': accountTab === 'credit' }"
              @click="accountTab = 'credit'"
            >
              信用额度
            </button>
            <WfSpecAnnot
              :no="USER_DETAIL_SPEC_ANNOT_NO.creditTab"
              title="信用额度账户"
              :items="[...USER_DETAIL_CREDIT_TAB_SPEC]"
            />
          </div>
        </div>

        <div class="user-detail-page__summary">
          <div class="user-detail-page__summary-left">
            <span>总资产：</span>
            <strong>{{ fiatUnit === 'usd' ? 'USD' : 'CNY' }} {{ totalAssetCny }}</strong>
            <select v-model="fiatUnit" class="wf-input wf-input--select user-detail-page__unit-select">
              <option value="cny">人民币</option>
              <option value="usd">美元</option>
            </select>
          </div>
          <div class="user-detail-page__summary-right">
            <span>最后一次更新时间：{{ lastUpdatedAt }}</span>
            <button
              type="button"
              class="user-detail-page__refresh"
              :disabled="refreshing"
              @click="refreshAssets"
            >
              {{ refreshing ? '刷新中…' : '刷新' }}
            </button>
          </div>
        </div>

        <template v-if="accountTab === 'credit'">
          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">持有币种</th>
                  <th class="wf-th">可进行交易的货币数（单位/个）</th>
                  <th class="wf-th">冻结的货币数（单位/个）</th>
                  <th class="wf-th">总资产（单位/个）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in displayRows" :key="row.id">
                  <td class="wf-td">{{ row.currency }}</td>
                  <td class="wf-td wf-td--num">{{ formatAmount(row.tradable) }}</td>
                  <td class="wf-td wf-td--num">{{ formatAmount(row.frozen) }}</td>
                  <td class="wf-td wf-td--num">{{ formatAmount(totalAmount(row)) }}</td>
                </tr>
                <tr v-if="!displayRows.length">
                  <td colspan="4" class="wf-td wf-td--empty">暂无信用额度数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else>
          <div class="user-detail-page__asset-bar">
            <div class="user-detail-page__asset-tabs">
              <button
                type="button"
                class="user-detail-page__asset-tab"
                :class="{ 'user-detail-page__asset-tab--active': assetTab === 'wallet' }"
                @click="assetTab = 'wallet'"
              >
                钱包余额资产
              </button>
              <button
                type="button"
                class="user-detail-page__asset-tab"
                :class="{ 'user-detail-page__asset-tab--active': assetTab === 'bank' }"
                @click="assetTab = 'bank'"
              >
                银行资产
              </button>
            </div>
            <button type="button" class="user-detail-page__turnover-entry" @click="openTurnoverModal">
              调整提现流水
            </button>
          </div>

          <div v-if="assetTab === 'wallet'" class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">持有币种</th>
                  <th class="wf-th">可进行交易的货币数（单位/个）</th>
                  <th class="wf-th">冻结的货币数（单位/个）</th>
                  <th class="wf-th">总资产（单位/个）</th>
                  <th class="wf-th">剩余提现流水要求</th>
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
                  <td class="wf-td user-detail-page__address">{{ truncateAddress(row.address) }}</td>
                </tr>
                <tr v-if="!displayRows.length">
                  <td colspan="6" class="wf-td wf-td--empty">暂无资产数据</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="wf-table-wrap">
            <table class="wf-table">
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
              </tbody>
            </table>
          </div>
        </template>
      </section>

      <!-- 用户资金明细 -->
      <section class="user-detail-page__section">
        <h2 class="user-detail-page__title">用户资金明细</h2>

        <div class="wf-block user-detail-page__ledger-filter">
          <div class="user-detail-page__chip-row">
            <span class="user-detail-page__chip-label">交易币种</span>
            <div class="user-detail-page__chips">
              <button
                v-for="currency in USER_FUND_CURRENCIES"
                :key="currency"
                type="button"
                class="user-detail-page__chip"
                :class="{ 'user-detail-page__chip--active': ledgerFilter.currencies.includes(currency) }"
                @click="toggleChip(ledgerFilter.currencies, currency)"
              >
                {{ currency }}
              </button>
            </div>
          </div>

          <div class="wf-toolbar wf-toolbar--filters">
            <label class="wf-label">法币：</label>
            <select v-model="ledgerFilter.fiat" class="wf-input wf-input--select">
              <option value="">请选择</option>
              <option value="cny">人民币相关</option>
            </select>
          </div>

          <div class="user-detail-page__chip-row">
            <span class="user-detail-page__chip-label">交易类型</span>
            <div class="user-detail-page__chips">
              <button
                v-for="txType in USER_FUND_TX_TYPES"
                :key="txType"
                type="button"
                class="user-detail-page__chip"
                :class="{ 'user-detail-page__chip--active': ledgerFilter.txTypes.includes(txType) }"
                @click="toggleChip(ledgerFilter.txTypes, txType)"
              >
                {{ txType }}
              </button>
            </div>
          </div>

          <div class="wf-toolbar wf-toolbar--filters">
            <label class="wf-label">交易单号：</label>
            <input
              v-model="ledgerFilter.orderNo"
              type="text"
              class="wf-input"
              placeholder="请输入交易单号"
            />
            <label class="wf-label">流水号：</label>
            <input
              v-model="ledgerFilter.flowNo"
              type="text"
              class="wf-input"
              placeholder="请输入流水号"
            />
            <label class="wf-label">流水类型：</label>
            <select v-model="ledgerFilter.flowType" class="wf-input wf-input--select">
              <option
                v-for="opt in USER_FUND_FLOW_TYPE_OPTIONS"
                :key="opt.value || 'all'"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="wf-toolbar wf-toolbar--filters">
            <label class="wf-label">流水生成时间：</label>
            <input v-model="ledgerFilter.startDate" type="date" class="wf-input wf-input--date" />
            <span class="wf-range-sep">-</span>
            <input v-model="ledgerFilter.endDate" type="date" class="wf-input wf-input--date" />
            <label class="wf-label">小程序：</label>
            <select v-model="ledgerFilter.miniProgram" class="wf-input wf-input--select">
              <option value="">全部</option>
              <option value="has">有关联</option>
              <option value="none">无关联</option>
            </select>
            <label class="wf-label">开发者：</label>
            <select v-model="ledgerFilter.developer" class="wf-input wf-input--select">
              <option value="">请选择</option>
              <option value="has">有关联</option>
              <option value="none">无关联</option>
            </select>
          </div>

          <div class="wf-toolbar">
            <span class="wf-toolbar__actions wf-toolbar__actions--start">
              <button type="button" class="wf-btn wf-btn--primary" @click="applyLedgerFilter">搜索</button>
              <button type="button" class="wf-btn wf-btn--default" @click="resetLedgerFilter">重置</button>
              <button type="button" class="wf-btn user-detail-page__btn--export" @click="exportLedger">
                导出
              </button>
            </span>
            <p v-if="ledgerHint" class="wf-modal__hint">{{ ledgerHint }}</p>
          </div>
        </div>

        <div class="wf-table-wrap">
          <table class="wf-table user-detail-page__ledger-table">
            <thead>
              <tr>
                <th class="wf-th wf-th--no">编号</th>
                <th class="wf-th">流水号</th>
                <th class="wf-th">交易中心交易单号</th>
                <th class="wf-th">发起方用户昵称</th>
                <th class="wf-th">发起方用户ID</th>
                <th class="wf-th">流水类型</th>
                <th class="wf-th">交易币种</th>
                <th class="wf-th">交易类型</th>
                <th class="wf-th">交易金额（单位/个）</th>
                <th class="wf-th">手续费（单位/个）</th>
                <th class="wf-th">商户手续费（单位/个）</th>
                <th class="wf-th">交易前余额（单位/个）</th>
                <th class="wf-th">交易后余额（单位/个）</th>
                <th class="wf-th">流水生成时间</th>
                <th class="wf-th">小程序</th>
                <th class="wf-th">开发者</th>
                <th class="wf-th">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredFundFlows.length">
                <td colspan="17" class="wf-td wf-td--empty">暂无资金明细</td>
              </tr>
              <tr v-for="(row, index) in filteredFundFlows" :key="row.id">
                <td class="wf-td wf-td--center">{{ index + 1 }}</td>
                <td class="wf-td wf-td--bill">{{ row.flowNo }}</td>
                <td class="wf-td">{{ row.exchangeOrderNo }}</td>
                <td class="wf-td">{{ row.initiatorNickname }}</td>
                <td class="wf-td wf-td--bill">{{ row.initiatorUserId }}</td>
                <td class="wf-td wf-td--center">{{ flowTypeLabel(row.flowType) }}</td>
                <td class="wf-td wf-td--center">{{ row.currency }}</td>
                <td class="wf-td">{{ row.txType }}</td>
                <td class="wf-td wf-td--num" :class="signedNumberClass(row.amount)">
                  {{ formatFundAmount(row.amount) }}
                </td>
                <td class="wf-td wf-td--num">{{ formatFundAmount(row.fee) }}</td>
                <td class="wf-td wf-td--num">{{ formatFundAmount(row.merchantFee) }}</td>
                <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceBefore) }}</td>
                <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceAfter) }}</td>
                <td class="wf-td">{{ row.createdAtBackend }}</td>
                <td class="wf-td wf-td--center">{{ row.miniProgram || '-' }}</td>
                <td class="wf-td wf-td--center">{{ row.developer || '-' }}</td>
                <td class="wf-td wf-td--actions">
                  <button type="button" class="wf-link-action" @click="openFlowDetail(row)">
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="wf-pagination">
          <span class="wf-pagination__info">共 {{ filteredFundFlows.length }} 条</span>
        </div>
      </section>
    </template>

    <div v-else class="wf-block user-detail-page__placeholder">
      <p>
        「{{ USER_DETAIL_MODULE_TABS.find((t) => t.key === moduleTab)?.label }}」模块原型占位，本期聚焦用户资金信息（资产详情
        + 资金明细 + 调整提现流水）。
      </p>
    </div>

    <!-- 调整提现流水 -->
    <Teleport to="body">
      <div
        v-if="turnoverModalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeTurnoverModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="user-detail-turnover-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="user-detail-turnover-title" class="wf-modal__title">调整提现流水</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeTurnoverModal">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">选择币种</label>
              <select v-model="turnoverAdjustCurrency" class="wf-select wf-select--full">
                <option value="">请选择</option>
                <option
                  v-for="currency in WITHDRAW_TURNOVER_CURRENCIES"
                  :key="currency"
                  :value="currency"
                >
                  {{ currency }}
                </option>
              </select>
            </div>
            <p class="user-detail-page__turnover-current">
              当前提现流水要求：<strong>{{ selectedTurnoverText }}</strong>
            </p>
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
              <input
                v-model="turnoverAdjustAmount"
                type="number"
                min="0"
                step="0.01"
                class="wf-input wf-input--full"
                placeholder="请输入流水金额"
              />
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">调整理由</label>
              <input
                v-model="turnoverAdjustReason"
                type="text"
                maxlength="16"
                class="wf-input wf-input--full"
                placeholder="请输入调整理由"
              />
            </div>
            <p v-if="turnoverSubmitHint" class="wf-modal__hint">{{ turnoverSubmitHint }}</p>
          </div>
          <div class="wf-modal__footer wf-modal__footer--center">
            <button type="button" class="wf-btn wf-btn--default" @click="closeTurnoverModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary wf-btn--lg" @click="confirmTurnoverAdjust">
              确定
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 对账流水详情 -->
    <Teleport to="body">
      <div
        v-if="detailVisible && detailRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeFlowDetail"
      >
        <div
          class="wf-modal wf-modal--scroll user-detail-page__flow-modal"
          role="dialog"
          aria-labelledby="fund-flow-detail-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="fund-flow-detail-title" class="wf-modal__title">对账流水详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeFlowDetail">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <section class="user-detail-page__detail-section">
              <h4 class="user-detail-page__detail-section-title">用户信息</h4>
              <div class="user-detail-page__detail-grid">
                <div>
                  <span class="user-detail-page__detail-label">发起方用户昵称</span>
                  <span>{{ detailRow.initiatorNickname }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">发起方用户id</span>
                  <span>{{ detailRow.initiatorUserId }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">接收方用户昵称</span>
                  <span>{{ detailRow.receiverNickname || '-' }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">接收方用户id</span>
                  <span>{{ detailRow.receiverUserId || '-' }}</span>
                </div>
              </div>
            </section>

            <section class="user-detail-page__detail-section">
              <h4 class="user-detail-page__detail-section-title">流水明细</h4>
              <div class="user-detail-page__detail-summary">
                <span>交易类型：{{ detailRow.txType }}</span>
                <span>流水生成时间(后台)：{{ detailRow.createdAtBackend }}</span>
                <span>流水生成时间(客户端)：{{ detailRow.createdAtClient }}</span>
              </div>
              <div class="user-detail-page__detail-grid user-detail-page__detail-grid--3">
                <div>
                  <span class="user-detail-page__detail-label">流水号</span>
                  <span>{{ detailRow.flowNo }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">流水类型</span>
                  <span>{{ flowTypeLabel(detailRow.flowType) }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">交易币种</span>
                  <span>{{ detailRow.currency }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">交易中心交易单号</span>
                  <span>{{ detailRow.exchangeOrderNo }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">交易金额</span>
                  <span :class="signedNumberClass(detailRow.amount)">
                    {{ formatFundAmount(detailRow.amount) }}
                  </span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">交易后余额</span>
                  <span>{{ formatFundAmount(detailRow.balanceAfter) }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">手续费</span>
                  <span>{{ formatFundAmount(detailRow.fee) }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">商户手续费</span>
                  <span>{{ formatFundAmount(detailRow.merchantFee) }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">平台手续费</span>
                  <span>{{ formatFundAmount(detailRow.platformFee) }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">小程序</span>
                  <span>{{ detailRow.miniProgram || '-' }}</span>
                </div>
                <div>
                  <span class="user-detail-page__detail-label">开发者</span>
                  <span>{{ detailRow.developer || '-' }}</span>
                </div>
              </div>
            </section>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeFlowDetail">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.user-detail-page__modules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.user-detail-page__module {
  padding: 6px 12px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: var(--pc-radius, 2px);
  background: #f5f5f5;
  color: var(--pc-text-secondary, #666);
  font-size: 13px;
  cursor: pointer;
}

.user-detail-page__module--active {
  border-color: var(--pc-primary, #1890ff);
  background: var(--pc-primary, #1890ff);
  color: #fff;
}

.user-detail-page__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--pc-text-secondary, #666);
  font-size: 13px;
}

.user-detail-page__section {
  margin-bottom: 28px;
}

.user-detail-page__title {
  margin: 0 0 16px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #333);
}

.user-detail-page__account-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--pc-border-light, #e8e8e8);
}

.user-detail-page__account-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 0;
}

.user-detail-page__account-tab {
  padding: 0 0 10px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--pc-text-secondary, #666);
  cursor: pointer;
}

.user-detail-page__account-tab--active {
  border-bottom-color: var(--pc-primary, #1890ff);
  color: var(--pc-primary, #1890ff);
  font-weight: 500;
}

.user-detail-page__account-tab-item .user-detail-page__account-tab--active {
  margin-bottom: 0;
}

.user-detail-page__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.user-detail-page__summary-left,
.user-detail-page__summary-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-detail-page__unit-select {
  width: 100px;
}

.user-detail-page__refresh {
  border: none;
  background: none;
  color: var(--pc-primary, #1890ff);
  cursor: pointer;
}

.user-detail-page__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-detail-page__asset-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.user-detail-page__asset-tabs {
  display: flex;
  gap: 8px;
}

.user-detail-page__asset-tab {
  padding: 6px 16px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: var(--pc-radius, 2px);
  background: #fff;
  cursor: pointer;
}

.user-detail-page__asset-tab--active {
  border-color: var(--pc-primary, #1890ff);
  background: var(--pc-primary, #1890ff);
  color: #fff;
}

.user-detail-page__turnover-entry {
  border: none;
  background: none;
  color: var(--pc-primary, #1890ff);
  cursor: pointer;
}

.user-detail-page__address {
  max-width: 280px;
  word-break: break-all;
  font-size: 12px;
  color: var(--pc-text-secondary, #666);
}

.wf-td--num {
  font-variant-numeric: tabular-nums;
}

.user-detail-page__turnover-current {
  margin: 0 0 16px;
  color: var(--pc-text-secondary, #666);
}

.user-detail-page__chip-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.user-detail-page__chip-label {
  flex-shrink: 0;
  width: 72px;
  padding-top: 6px;
  color: var(--pc-text, #333);
}

.user-detail-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-detail-page__chip {
  padding: 4px 10px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 2px;
  background: #fff;
  color: var(--pc-text, #333);
  font-size: 13px;
  cursor: pointer;
}

.user-detail-page__chip--active {
  border-color: var(--pc-primary, #1890ff);
  background: #e6f4ff;
  color: var(--pc-primary, #1890ff);
}

.user-detail-page__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.user-detail-page__ledger-table {
  table-layout: auto;
  min-width: 1800px;
}

.user-detail-page__placeholder {
  color: var(--pc-text-secondary, #666);
  line-height: 1.6;
}

.user-detail-page__flow-modal {
  max-width: 880px;
}

.user-detail-page__detail-section {
  margin-bottom: 20px;
}

.user-detail-page__detail-section-title {
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 15px;
  font-weight: 600;
}

.user-detail-page__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.user-detail-page__detail-grid--3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.user-detail-page__detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.user-detail-page__detail-label {
  color: var(--pc-text-secondary, #666);
}

.user-detail-page__detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f5f5f5;
  font-size: 13px;
}
</style>
