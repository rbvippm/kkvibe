<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  creditFlowWalletLabel,
  MOCK_CREDIT_FLOW_LIST,
  USER_CREDIT_TX_TYPES,
  type CreditFlowListRow,
} from '../../constants/creditFlowList'
import {
  CREDIT_FLOW_LIST_FILTER_SPEC,
  CREDIT_FLOW_LIST_SPEC_ANNOT_NO,
  CREDIT_FLOW_LIST_TABLE_SPEC,
} from '../../constants/creditFlowListSpec'
import {
  flowTypeLabel,
  formatFundAmount,
  USER_FUND_FLOW_TYPE_OPTIONS,
  type UserFundFlowType,
} from '../../constants/userDetail'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import { showPcToast } from '../../composables/usePcToast'
import '../../styles/pc-wireframe.css'

type CreditFlowFilter = {
  userId: string
  agentId: string
  walletId: string
  txTypes: string[]
  flowNo: string
  flowType: UserFundFlowType | ''
  startDate: string
  endDate: string
}

const router = useRouter()

const defaultFilter = (): CreditFlowFilter => ({
  userId: '',
  agentId: '',
  walletId: '',
  txTypes: [],
  flowNo: '',
  flowType: '',
  startDate: '',
  endDate: '',
})

const filter = ref<CreditFlowFilter>(defaultFilter())
const appliedFilter = ref<CreditFlowFilter>(defaultFilter())
const hint = ref('')
const detailRow = ref<CreditFlowListRow | null>(null)

function toggleChip(list: string[], value: string) {
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function matchFlow(row: CreditFlowListRow) {
  const f = appliedFilter.value
  if (f.userId && row.userId !== f.userId) return false
  if (f.agentId && row.agentId !== f.agentId) return false
  if (f.walletId && row.walletId !== f.walletId) return false
  if (f.txTypes.length && !f.txTypes.includes(row.txType)) return false
  if (f.flowNo && !row.flowNo.includes(f.flowNo)) return false
  if (f.flowType && row.flowType !== f.flowType) return false
  if (f.startDate && row.createdAtBackend.slice(0, 10) < f.startDate) return false
  if (f.endDate && row.createdAtBackend.slice(0, 10) > f.endDate) return false
  return true
}

const filteredFlows = computed(() => MOCK_CREDIT_FLOW_LIST.filter(matchFlow))

function applyFilter() {
  const f = filter.value
  const next: CreditFlowFilter = {
    ...f,
    userId: f.userId.trim(),
    agentId: f.agentId.trim(),
    walletId: f.walletId.trim(),
    flowNo: f.flowNo.trim(),
    txTypes: [...f.txTypes],
  }
  if ([next.userId, next.agentId, next.walletId].some((id) => id && !/^\d+$/.test(id))) {
    hint.value = 'ID 只能输入数字'
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
  if (count) showPcToast(`已导出当前 ${count} 条信用流水`)
  else showPcToast('暂无数据可导出', 'info')
}

function openUserDetail(userId: string) {
  router.push({ name: 'pc-user-detail', query: { userId } })
}
</script>

<template>
  <div class="pc-wireframe-page credit-flow-list">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          用户ID：
          <WfSpecAnnot
            :no="CREDIT_FLOW_LIST_SPEC_ANNOT_NO.filters"
            title="全平台筛选（ID 输入）"
            :items="[...CREDIT_FLOW_LIST_FILTER_SPEC]"
          />
        </label>
        <input
          v-model="filter.userId"
          type="text"
          class="wf-input"
          placeholder="请输入用户ID"
          @keyup.enter="applyFilter"
        />
        <label class="wf-label">上级代理ID：</label>
        <input
          v-model="filter.agentId"
          type="text"
          class="wf-input"
          placeholder="请输入上级代理ID"
          @keyup.enter="applyFilter"
        />
        <label class="wf-label">钱包ID：</label>
        <input
          v-model="filter.walletId"
          type="text"
          class="wf-input"
          placeholder="请输入钱包ID"
          @keyup.enter="applyFilter"
        />
      </div>

      <div class="credit-flow-list__chip-row">
        <span class="credit-flow-list__chip-label">交易类型</span>
        <div class="credit-flow-list__chips">
          <button
            v-for="txType in USER_CREDIT_TX_TYPES"
            :key="txType"
            type="button"
            class="credit-flow-list__chip"
            :class="{ 'credit-flow-list__chip--active': filter.txTypes.includes(txType) }"
            @click="toggleChip(filter.txTypes, txType)"
          >
            {{ txType }}
          </button>
        </div>
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
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
          <button type="button" class="wf-btn credit-flow-list__btn--export" @click="exportFlows">导出</button>
        </span>
        <p v-if="hint" class="wf-modal__hint">{{ hint }}</p>
      </div>
    </section>

    <div class="wf-table-wrap">
      <table class="wf-table credit-flow-list__table">
        <thead>
          <tr>
            <th class="wf-th wf-th--no">编号</th>
            <th class="wf-th">
              <span class="wf-label--with-spec">
                流水号
                <WfSpecAnnot
                  :no="CREDIT_FLOW_LIST_SPEC_ANNOT_NO.table"
                  title="流水列表与详情"
                  :items="[...CREDIT_FLOW_LIST_TABLE_SPEC]"
                />
              </span>
            </th>
            <th class="wf-th">用户昵称</th>
            <th class="wf-th">用户ID</th>
            <th class="wf-th">上级代理ID</th>
            <th class="wf-th">钱包</th>
            <th class="wf-th">钱包ID</th>
            <th class="wf-th">流水类型</th>
            <th class="wf-th">交易类型</th>
            <th class="wf-th">交易说明</th>
            <th class="wf-th">交易金额（单位/个）</th>
            <th class="wf-th">交易前余额（单位/个）</th>
            <th class="wf-th">交易后余额（单位/个）</th>
            <th class="wf-th">流水生成时间</th>
            <th class="wf-th">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredFlows.length">
            <td colspan="15" class="wf-td wf-td--empty">暂无信用流水</td>
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
            <td class="wf-td wf-td--bill">{{ row.agentId }}</td>
            <td class="wf-td">{{ creditFlowWalletLabel(row) }}</td>
            <td class="wf-td wf-td--bill">{{ row.walletId }}</td>
            <td class="wf-td wf-td--center">{{ flowTypeLabel(row.flowType) }}</td>
            <td class="wf-td wf-td--center">{{ row.txType }}</td>
            <td class="wf-td">{{ row.summary }}</td>
            <td class="wf-td wf-td--num" :class="signedNumberClass(row.amount)">
              {{ formatFundAmount(row.amount) }}
            </td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceBefore) }}</td>
            <td class="wf-td wf-td--num">{{ formatFundAmount(row.balanceAfter) }}</td>
            <td class="wf-td">{{ row.createdAtBackend }}</td>
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
          class="wf-modal wf-modal--scroll credit-flow-list__modal"
          role="dialog"
          aria-labelledby="credit-flow-list-detail-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="credit-flow-list-detail-title" class="wf-modal__title">信用流水详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="detailRow = null">×</button>
          </div>
          <div class="wf-modal__body">
            <section class="credit-flow-list__detail-section">
              <h4 class="credit-flow-list__detail-section-title">用户信息</h4>
              <div class="credit-flow-list__detail-grid credit-flow-list__detail-grid--3">
                <div>
                  <span class="credit-flow-list__detail-label">用户昵称</span>
                  <span>{{ detailRow.userNickname }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">用户ID</span>
                  <span>{{ detailRow.userId }}</span>
                </div>
              </div>
            </section>
            <section class="credit-flow-list__detail-section">
              <h4 class="credit-flow-list__detail-section-title">钱包信息</h4>
              <div class="credit-flow-list__detail-grid credit-flow-list__detail-grid--3">
                <div>
                  <span class="credit-flow-list__detail-label">上级代理</span>
                  <span>{{ detailRow.agentName }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">上级代理ID</span>
                  <span>{{ detailRow.agentId }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">钱包</span>
                  <span>{{ creditFlowWalletLabel(detailRow) }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">钱包ID</span>
                  <span>{{ detailRow.walletId }}</span>
                </div>
              </div>
            </section>
            <section class="credit-flow-list__detail-section">
              <h4 class="credit-flow-list__detail-section-title">流水明细</h4>
              <div class="credit-flow-list__detail-summary">
                <span>交易类型：{{ detailRow.txType }}</span>
                <span>流水生成时间(后台)：{{ detailRow.createdAtBackend }}</span>
                <span>流水生成时间(客户端)：{{ detailRow.createdAtClient }}</span>
              </div>
              <div class="credit-flow-list__detail-grid credit-flow-list__detail-grid--3">
                <div>
                  <span class="credit-flow-list__detail-label">流水号</span>
                  <span>{{ detailRow.flowNo }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">流水类型</span>
                  <span>{{ flowTypeLabel(detailRow.flowType) }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">交易说明</span>
                  <span>{{ detailRow.summary }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">交易金额</span>
                  <span :class="signedNumberClass(detailRow.amount)">{{ formatFundAmount(detailRow.amount) }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">交易前余额</span>
                  <span>{{ formatFundAmount(detailRow.balanceBefore) }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">交易后余额</span>
                  <span>{{ formatFundAmount(detailRow.balanceAfter) }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">操作人昵称</span>
                  <span>{{ detailRow.operatorNickname }}</span>
                </div>
                <div>
                  <span class="credit-flow-list__detail-label">操作人ID</span>
                  <span>{{ detailRow.operatorUserId }}</span>
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
.credit-flow-list__chip-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.credit-flow-list__chip-label {
  flex-shrink: 0;
  width: 72px;
  padding-top: 6px;
  color: var(--pc-text, #333);
}

.credit-flow-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.credit-flow-list__chip {
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

.credit-flow-list__chip--active {
  border-color: var(--pc-primary, #1890ff);
  background: #e6f4ff;
  color: var(--pc-primary, #1890ff);
}

.credit-flow-list__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.credit-flow-list__table {
  table-layout: auto;
  min-width: 1800px;
}

.credit-flow-list__modal {
  max-width: 880px;
}

.credit-flow-list__detail-section {
  margin-bottom: 20px;
}

.credit-flow-list__detail-section-title {
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 15px;
  font-weight: 600;
}

.credit-flow-list__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.credit-flow-list__detail-grid--3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.credit-flow-list__detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.credit-flow-list__detail-label {
  color: var(--pc-text-secondary, #666);
}

.credit-flow-list__detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f5f5f5;
  font-size: 13px;
}
</style>
