<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfSpecAnnot from '../wireframe/WfSpecAnnot.vue'
import {
  MOCK_CASH_FLOW_LIST,
  USER_FUND_CURRENCIES,
  USER_FUND_TX_TYPES,
  type CashFlowListRow,
} from '../../constants/cashFlowList'
import { CASH_FLOW_LIST_FILTER_SPEC, CASH_FLOW_LIST_TABLE_SPEC } from '../../constants/reconciliationFlowListSpec'
import {
  flowTypeLabel,
  formatFundAmount,
  USER_FUND_FLOW_TYPE_OPTIONS,
  type UserFundFlowType,
} from '../../constants/userDetail'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import { showPcToast } from '../../composables/usePcToast'
import '../../styles/pc-wireframe.css'

const props = defineProps<{
  annotNo: { filters: number; table: number }
}>()

type CashFlowFilter = {
  userId: string
  currency: string
  txTypes: string[]
  orderNo: string
  flowNo: string
  flowType: UserFundFlowType | ''
  startDate: string
  endDate: string
}

const router = useRouter()

const defaultFilter = (): CashFlowFilter => ({
  userId: '',
  currency: '',
  txTypes: [],
  orderNo: '',
  flowNo: '',
  flowType: '',
  startDate: '',
  endDate: '',
})

const filter = ref<CashFlowFilter>(defaultFilter())
const appliedFilter = ref<CashFlowFilter>(defaultFilter())
const hint = ref('')
const detailRow = ref<CashFlowListRow | null>(null)

function toggleChip(list: string[], value: string) {
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function matchFlow(row: CashFlowListRow) {
  const f = appliedFilter.value
  if (f.userId && row.userId !== f.userId) return false
  if (f.currency && row.currency !== f.currency) return false
  if (f.txTypes.length && !f.txTypes.includes(row.txType)) return false
  if (f.orderNo && !row.exchangeOrderNo.includes(f.orderNo)) return false
  if (f.flowNo && !row.flowNo.includes(f.flowNo)) return false
  if (f.flowType && row.flowType !== f.flowType) return false
  if (f.startDate && row.createdAtBackend.slice(0, 10) < f.startDate) return false
  if (f.endDate && row.createdAtBackend.slice(0, 10) > f.endDate) return false
  return true
}

const filteredFlows = computed(() => MOCK_CASH_FLOW_LIST.filter(matchFlow))

function applyFilter() {
  const f = filter.value
  const next: CashFlowFilter = {
    ...f,
    userId: f.userId.trim(),
    orderNo: f.orderNo.trim(),
    flowNo: f.flowNo.trim(),
    txTypes: [...f.txTypes],
  }
  if (next.userId && !/^\d+$/.test(next.userId)) {
    hint.value = '用户ID 只能输入数字'
    return
  }
  if (next.startDate && next.endDate && next.startDate > next.endDate) {
    hint.value = '结束日期不能早于开始日期'
    return
  }
  hint.value = ''
  appliedFilter.value = next
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  hint.value = ''
}

function exportFlows() {
  const count = filteredFlows.value.length
  if (count) showPcToast(`已导出当前 ${count} 条现金流水`)
  else showPcToast('暂无数据可导出', 'info')
}

function openUserDetail(userId: string) {
  router.push({ name: 'pc-user-detail', query: { userId } })
}
</script>

<template>
  <div class="cash-flow-list">
    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          用户ID：
          <WfSpecAnnot :no="props.annotNo.filters" title="全平台现金流水筛选" :items="[...CASH_FLOW_LIST_FILTER_SPEC]" />
        </label>
        <input
          v-model="filter.userId"
          type="text"
          class="wf-input"
          placeholder="请输入用户ID"
          @keyup.enter="applyFilter"
        />
        <label class="wf-label">交易币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="currency in USER_FUND_CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
        </select>
      </div>

      <div class="cash-flow-list__chip-row">
        <span class="cash-flow-list__chip-label">交易类型</span>
        <div class="cash-flow-list__chips">
          <button
            v-for="txType in USER_FUND_TX_TYPES"
            :key="txType"
            type="button"
            class="cash-flow-list__chip"
            :class="{ 'cash-flow-list__chip--active': filter.txTypes.includes(txType) }"
            @click="toggleChip(filter.txTypes, txType)"
          >
            {{ txType }}
          </button>
        </div>
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">交易单号：</label>
        <input
          v-model="filter.orderNo"
          type="text"
          class="wf-input"
          placeholder="请输入交易单号"
          @keyup.enter="applyFilter"
        />
        <label class="wf-label">流水号：</label>
        <input
          v-model="filter.flowNo"
          type="text"
          class="wf-input"
          placeholder="请输入流水号"
          @keyup.enter="applyFilter"
        />
        <label class="wf-label">流水类型：</label>
        <select v-model="filter.flowType" class="wf-input wf-input--select">
          <option v-for="opt in USER_FUND_FLOW_TYPE_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <label class="wf-label">流水生成时间：</label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
          <button type="button" class="wf-btn cash-flow-list__btn--export" @click="exportFlows">导出</button>
        </span>
        <p v-if="hint" class="wf-modal__hint">{{ hint }}</p>
      </div>
    </section>

    <div class="wf-table-wrap">
      <table class="wf-table cash-flow-list__table">
        <thead>
          <tr>
            <th class="wf-th wf-th--no">编号</th>
            <th class="wf-th">
              <span class="wf-label--with-spec">
                流水号
                <WfSpecAnnot :no="props.annotNo.table" title="现金流水列表与详情" :items="[...CASH_FLOW_LIST_TABLE_SPEC]" />
              </span>
            </th>
            <th class="wf-th">用户昵称</th>
            <th class="wf-th">用户ID</th>
            <th class="wf-th">交易中心交易单号</th>
            <th class="wf-th">发起方用户昵称</th>
            <th class="wf-th">发起方用户ID</th>
            <th class="wf-th">流水类型</th>
            <th class="wf-th">交易币种</th>
            <th class="wf-th">交易类型</th>
            <th class="wf-th">交易金额（单位/个）</th>
            <th class="wf-th">手续费</th>
            <th class="wf-th">商户手续费</th>
            <th class="wf-th">交易前余额（单位/个）</th>
            <th class="wf-th">交易后余额（单位/个）</th>
            <th class="wf-th">流水生成时间</th>
            <th class="wf-th">小程序</th>
            <th class="wf-th">开发者</th>
            <th class="wf-th">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredFlows.length">
            <td colspan="19" class="wf-td wf-td--empty">暂无现金流水</td>
          </tr>
          <tr v-for="(row, index) in filteredFlows" :key="row.id">
            <td class="wf-td wf-td--center">{{ index + 1 }}</td>
            <td class="wf-td wf-td--bill">{{ row.flowNo }}</td>
            <td class="wf-td">{{ row.userNickname }}</td>
            <td class="wf-td wf-td--bill">
              <button type="button" class="wf-link-action" @click="openUserDetail(row.userId)">
                {{ row.userId }}
              </button>
            </td>
            <td class="wf-td wf-td--bill">{{ row.exchangeOrderNo }}</td>
            <td class="wf-td">{{ row.initiatorNickname }}</td>
            <td class="wf-td wf-td--bill">{{ row.initiatorUserId }}</td>
            <td class="wf-td wf-td--center">{{ flowTypeLabel(row.flowType) }}</td>
            <td class="wf-td wf-td--center">{{ row.currency }}</td>
            <td class="wf-td wf-td--center">{{ row.txType }}</td>
            <td class="wf-td wf-td--num" :class="signedNumberClass(row.amount)">
              {{ formatFundAmount(row.amount) }}
            </td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.fee) }}</td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.merchantFee) }}</td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceBefore) }}</td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceAfter) }}</td>
            <td class="wf-td">{{ row.createdAtBackend }}</td>
            <td class="wf-td">{{ row.miniProgram || '-' }}</td>
            <td class="wf-td">{{ row.developer || '-' }}</td>
            <td class="wf-td wf-td--actions">
              <button type="button" class="wf-link-action" @click="detailRow = row">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="wf-pagination">
      <span class="wf-pagination__info">共 {{ filteredFlows.length }} 条</span>
    </div>

    <Teleport to="body">
      <div v-if="detailRow" class="wf-modal-mask" role="presentation" @click.self="detailRow = null">
        <div
          class="wf-modal wf-modal--scroll cash-flow-list__modal"
          role="dialog"
          aria-labelledby="cash-flow-list-detail-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="cash-flow-list-detail-title" class="wf-modal__title">对账流水详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="detailRow = null">×</button>
          </div>
          <div class="wf-modal__body">
            <section class="cash-flow-list__detail-section">
              <h4 class="cash-flow-list__detail-section-title">用户信息</h4>
              <div class="cash-flow-list__detail-grid">
                <div>
                  <span class="cash-flow-list__detail-label">用户昵称</span>
                  <span>{{ detailRow.userNickname }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">用户ID</span>
                  <span>{{ detailRow.userId }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">发起方用户昵称</span>
                  <span>{{ detailRow.initiatorNickname }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">发起方用户ID</span>
                  <span>{{ detailRow.initiatorUserId }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">接收方用户昵称</span>
                  <span>{{ detailRow.receiverNickname || '-' }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">接收方用户ID</span>
                  <span>{{ detailRow.receiverUserId || '-' }}</span>
                </div>
              </div>
            </section>
            <section class="cash-flow-list__detail-section">
              <h4 class="cash-flow-list__detail-section-title">流水明细</h4>
              <div class="cash-flow-list__detail-summary">
                <span>交易类型：{{ detailRow.txType }}</span>
                <span>流水生成时间(后台)：{{ detailRow.createdAtBackend }}</span>
                <span>流水生成时间(客户端)：{{ detailRow.createdAtClient }}</span>
              </div>
              <div class="cash-flow-list__detail-grid cash-flow-list__detail-grid--3">
                <div>
                  <span class="cash-flow-list__detail-label">流水号</span>
                  <span>{{ detailRow.flowNo }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">流水类型</span>
                  <span>{{ flowTypeLabel(detailRow.flowType) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">交易币种</span>
                  <span>{{ detailRow.currency }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">交易中心交易单号</span>
                  <span>{{ detailRow.exchangeOrderNo }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">交易金额</span>
                  <span :class="signedNumberClass(detailRow.amount)">{{ formatFundAmount(detailRow.amount) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">交易后余额</span>
                  <span>{{ formatFundAmount(detailRow.balanceAfter) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">手续费</span>
                  <span>{{ formatFundAmount(detailRow.fee) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">商户手续费</span>
                  <span>{{ formatFundAmount(detailRow.merchantFee) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">平台手续费</span>
                  <span>{{ formatFundAmount(detailRow.platformFee) }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">小程序</span>
                  <span>{{ detailRow.miniProgram || '-' }}</span>
                </div>
                <div>
                  <span class="cash-flow-list__detail-label">开发者</span>
                  <span>{{ detailRow.developer || '-' }}</span>
                </div>
              </div>
            </section>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="detailRow = null">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.cash-flow-list__chip-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.cash-flow-list__chip-label {
  flex-shrink: 0;
  width: 72px;
  padding-top: 6px;
  color: var(--pc-text, #333);
}

.cash-flow-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cash-flow-list__chip {
  padding: 4px 10px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 2px;
  background: #fff;
  color: var(--pc-text, #333);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    color 0.15s;
}

.cash-flow-list__chip--active {
  border-color: var(--pc-primary, #1890ff);
  background: #e6f4ff;
  color: var(--pc-primary, #1890ff);
}

.cash-flow-list__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.cash-flow-list__table {
  table-layout: auto;
  min-width: 2200px;
}

.cash-flow-list__modal {
  max-width: 880px;
}

.cash-flow-list__detail-section {
  margin-bottom: 20px;
}

.cash-flow-list__detail-section-title {
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 15px;
  font-weight: 600;
}

.cash-flow-list__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.cash-flow-list__detail-grid--3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.cash-flow-list__detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.cash-flow-list__detail-label {
  color: var(--pc-text-secondary, #666);
}

.cash-flow-list__detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f5f5f5;
  font-size: 13px;
}
</style>
