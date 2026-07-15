<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  buildRelatedRecords,
  CREDIT_INITIATOR_TYPE_OPTIONS,
  CREDIT_STATUS_OPTIONS,
  CREDIT_TARGET_TYPE_OPTIONS,
  CREDIT_TRANSFER_MODE_FORM_OPTIONS,
  CREDIT_TRANSFER_MODE_OPTIONS,
  formatCreditAmount,
  formatCreditBalance,
  hasRelatedRecord,
  initiatorTypeLabel,
  MOCK_CREDIT_LIMIT_TRANSFER_ROWS,
  listCreditLevel1Agents,
  statusLabel,
  targetTypeLabel,
  transferModeLabel,
  type CreditInitiatorType,
  type CreditLimitTransferRow,
  type CreditRelatedRecord,
  type CreditTargetType,
  type CreditTopAgentRow,
  type CreditTransferMode,
  type CreditTransferStatus,
} from '../../constants/creditLimitTransfer'
import {
  CREDIT_LIMIT_TRANSFER_MODE_SPEC,
  CREDIT_LIMIT_TRANSFER_MODAL_SPEC,
  CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO,
} from '../../constants/creditLimitTransferSpec'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  userId: string
  initiatorType: '' | CreditInitiatorType
  initiatorName: string
  initiatorId: string
  targetType: '' | CreditTargetType
  transferMode: '' | CreditTransferMode
  startDate: string
  endDate: string
  status: '' | CreditTransferStatus
  flowNo: string
}

const defaultFilter = (): ListFilter => ({
  userId: '',
  initiatorType: '',
  initiatorName: '',
  initiatorId: '',
  targetType: '',
  transferMode: '',
  startDate: '',
  endDate: '',
  status: '',
  flowNo: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const rows = ref<CreditLimitTransferRow[]>(MOCK_CREDIT_LIMIT_TRANSFER_ROWS.map((row) => ({ ...row })))
const filterHint = ref('')

function applyFilter() {
  if (filter.value.startDate && filter.value.endDate && filter.value.startDate > filter.value.endDate) {
    filterHint.value = '结束时间不能早于开始时间'
    return
  }
  filterHint.value = ''
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  filterHint.value = ''
}

function matchRow(row: CreditLimitTransferRow) {
  const f = appliedFilter.value
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.initiatorType && row.initiatorType !== f.initiatorType) return false
  if (f.initiatorName && !row.initiatorName.toLowerCase().includes(f.initiatorName.trim().toLowerCase())) {
    return false
  }
  if (f.initiatorId && !row.initiatorId.includes(f.initiatorId.trim())) return false
  if (f.targetType && row.targetType !== f.targetType) return false
  if (f.transferMode && row.transferMode !== f.transferMode) return false
  if (f.status && row.status !== f.status) return false
  if (f.flowNo && !row.flowNo.includes(f.flowNo.trim())) return false
  const day = row.occurredAt.slice(0, 10)
  if (f.startDate && day < f.startDate) return false
  if (f.endDate && day > f.endDate) return false
  return true
}

const filteredRows = computed(() => rows.value.filter(matchRow))

/* ---------- 关联记录弹框 ---------- */
const relatedVisible = ref(false)
const relatedOriginal = ref<CreditRelatedRecord | null>(null)
const relatedPair = ref<CreditRelatedRecord | null>(null)

function openRelated(row: CreditLimitTransferRow) {
  const bundle = buildRelatedRecords(row)
  if (!bundle) return
  relatedOriginal.value = bundle.original
  relatedPair.value = bundle.related
  relatedVisible.value = true
}

function closeRelated() {
  relatedVisible.value = false
  relatedOriginal.value = null
  relatedPair.value = null
}

/* ---------- 上下分弹框 ---------- */
const transferVisible = ref(false)
const agentKeyword = ref('')
const agentSearchApplied = ref('')
const selectedAgentId = ref<string | null>(null)
const transferMode = ref('')
const amountInput = ref('')
const remarkInput = ref('')
const transferHint = ref('')

/** 来源：占成代理配置中已授信信用身份的一级代理 */
const creditLevel1Agents = listCreditLevel1Agents()

const searchedAgents = computed(() => {
  const memberId = agentSearchApplied.value.trim()
  if (!memberId) return [] as CreditTopAgentRow[]
  // 会员 ID 精准匹配：仅命中占成代理配置中已授信的一级代理
  return creditLevel1Agents.filter((agent) => agent.userId === memberId)
})

const selectedAgent = computed(
  () => creditLevel1Agents.find((agent) => agent.id === selectedAgentId.value) ?? null,
)

function openTransferModal() {
  agentKeyword.value = ''
  agentSearchApplied.value = ''
  selectedAgentId.value = null
  transferMode.value = ''
  amountInput.value = ''
  remarkInput.value = ''
  transferHint.value = ''
  transferVisible.value = true
}

function closeTransferModal() {
  transferVisible.value = false
}

function searchAgents() {
  agentSearchApplied.value = agentKeyword.value
  selectedAgentId.value = null
  transferHint.value = ''
}

function selectAgent(agent: CreditTopAgentRow) {
  selectedAgentId.value = agent.id
  transferHint.value = ''
}

function validateTransferForm() {
  if (!selectedAgent.value) return '请先搜索并选择一级代理信用代理'
  if (!transferMode.value) return '请选择上下分方式'
  const amount = Number(amountInput.value)
  if (!amountInput.value.trim() || Number.isNaN(amount) || amount <= 0) {
    return '请输入大于 0 的金额'
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amountInput.value.trim())) {
    return '金额最多保留两位小数'
  }
  if (transferMode.value === 'down' && amount > selectedAgent.value.creditBalance) {
    return '下分金额不能超过信用额度余额'
  }
  if (!remarkInput.value.trim()) return '请输入备注'
  if (remarkInput.value.trim().length > 16) return '备注最多 16 个字符'
  return ''
}

function confirmTransfer() {
  const error = validateTransferForm()
  if (error) {
    transferHint.value = error
    return
  }
  const agent = selectedAgent.value!
  const amount = Number(amountInput.value)
  const signed = transferMode.value === 'up' ? amount : -amount
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const flowNo = `${stamp}${Math.floor(Math.random() * 9000 + 1000)}`

  rows.value.unshift({
    id: `new-${stamp}`,
    flowNo,
    username: agent.username,
    userId: agent.userId,
    amount: signed,
    initiatorType: 'admin',
    transferMode: transferMode.value as CreditTransferMode,
    targetType: 'agent',
    initiatorName: 'ops_admin',
    initiatorId: '10086',
    occurredAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    status: 'success',
    remark: remarkInput.value.trim(),
    relatedFlowNo: flowNo,
  })

  closeTransferModal()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">发起对象：</label>
        <select v-model="filter.initiatorType" class="wf-input wf-input--select">
          <option
            v-for="opt in CREDIT_INITIATOR_TYPE_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">发起人：</label>
        <input
          v-model="filter.initiatorName"
          type="text"
          class="wf-input"
          placeholder="后台账号/信用代理账号/系统System"
        />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">发起人ID：</label>
        <input
          v-model="filter.initiatorId"
          type="text"
          class="wf-input"
          placeholder="后台id/信用代理id/系统0"
        />

        <label class="wf-label">上下分对象：</label>
        <select v-model="filter.targetType" class="wf-input wf-input--select">
          <option
            v-for="opt in CREDIT_TARGET_TYPE_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label wf-label--with-spec">
          上下分方式：
          <WfSpecAnnot
            :no="CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO.transferMode"
            title="上下分方式 · 代理退水"
            :items="[...CREDIT_LIMIT_TRANSFER_MODE_SPEC]"
          />
        </label>
        <select v-model="filter.transferMode" class="wf-input wf-input--select">
          <option
            v-for="opt in CREDIT_TRANSFER_MODE_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">发起时间：</label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option v-for="opt in CREDIT_STATUS_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">流水号：</label>
        <input v-model="filter.flowNo" type="text" class="wf-input" placeholder="请输入流水号" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
          <button type="button" class="wf-btn wf-btn--credit-transfer" @click="openTransferModal">
            信用额度上下分
          </button>
        </span>
        <p v-if="filterHint" class="wf-modal__hint">{{ filterHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">流水号</th>
              <th class="wf-th">用户</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金额</th>
              <th class="wf-th">发起对象</th>
              <th class="wf-th">上下分方式</th>
              <th class="wf-th">上下分对象</th>
              <th class="wf-th">发起人</th>
              <th class="wf-th">发起人ID</th>
              <th class="wf-th">时间</th>
              <th class="wf-th">状态</th>
              <th class="wf-th">备注</th>
              <th class="wf-th">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="13" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td wf-td--bill">{{ row.flowNo }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
              <td class="wf-td wf-td--center" :class="signedNumberClass(row.amount)">
                {{ formatCreditAmount(row.amount) }}
              </td>
              <td class="wf-td wf-td--center">{{ initiatorTypeLabel(row.initiatorType) }}</td>
              <td class="wf-td wf-td--center">{{ transferModeLabel(row.transferMode) }}</td>
              <td class="wf-td wf-td--center">{{ targetTypeLabel(row.targetType) }}</td>
              <td class="wf-td">{{ row.initiatorName }}</td>
              <td class="wf-td">{{ row.initiatorId }}</td>
              <td class="wf-td wf-td--time">{{ row.occurredAt }}</td>
              <td class="wf-td wf-td--center">
                <span
                  class="wf-status-badge"
                  :class="
                    row.status === 'success'
                      ? 'wf-status-badge--enabled'
                      : 'wf-status-badge--disabled'
                  "
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="wf-td">{{ row.remark || '-' }}</td>
              <td class="wf-td wf-td--center">
                <button
                  v-if="hasRelatedRecord(row)"
                  type="button"
                  class="wf-link-action"
                  @click="openRelated(row)"
                >
                  关联记录
                </button>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 信用额度上下分弹框 -->
    <div
      v-if="transferVisible"
      class="wf-modal-mask"
      @click.self="closeTransferModal"
    >
      <div
        class="wf-modal wf-modal--scroll wf-modal--credit-transfer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-transfer-title"
      >
        <header class="wf-modal__header">
          <h3 id="credit-transfer-title" class="wf-modal__title wf-modal__title--with-spec">
            信用额度上下分
            <WfSpecAnnot
              :no="CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO.transferModal"
              title="会员ID精准搜索与去掉赚取退水"
              :items="[...CREDIT_LIMIT_TRANSFER_MODAL_SPEC]"
            />
          </h3>
          <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeTransferModal">
            ×
          </button>
        </header>

        <div class="wf-modal__body">
          <div class="wf-modal__query">
            <input
              v-model="agentKeyword"
              type="text"
              class="wf-input"
              placeholder="请输入会员ID（精准搜索）"
              @keydown.enter.prevent="searchAgents"
            />
            <button type="button" class="wf-btn wf-btn--primary" @click="searchAgents">搜索</button>
          </div>

          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">现金代理账密</th>
                  <th class="wf-th">信用代理账密</th>
                  <th class="wf-th">信用额度余额</th>
                  <th class="wf-th">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!agentSearchApplied">
                  <td colspan="7" class="wf-td wf-td--empty">
                    请输入会员ID精准搜索已授信的一级代理信用代理
                  </td>
                </tr>
                <tr v-else-if="!searchedAgents.length">
                  <td colspan="7" class="wf-td wf-td--empty">暂无数据</td>
                </tr>
                <tr
                  v-for="agent in searchedAgents"
                  :key="agent.id"
                  :class="{ 'wf-tr--selected': selectedAgentId === agent.id }"
                >
                  <td class="wf-td">{{ agent.username }}</td>
                  <td class="wf-td">{{ agent.userId }}</td>
                  <td class="wf-td">{{ agent.kingKongId }}</td>
                  <td class="wf-td">
                    {{ agent.cashAccount }} / {{ agent.cashPassword }}
                  </td>
                  <td class="wf-td">
                    {{ agent.creditAccount }} / {{ agent.creditPassword }}
                  </td>
                  <td class="wf-td wf-td--center">{{ formatCreditBalance(agent.creditBalance) }}</td>
                  <td class="wf-td wf-td--center">
                    <button type="button" class="wf-link-action" @click="selectAgent(agent)">
                      {{ selectedAgentId === agent.id ? '已选择' : '选择' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="wf-modal__form credit-transfer-form">
            <label class="wf-modal__field">
              <span class="wf-modal__field-label"><i class="wf-required">*</i>上下分方式</span>
              <select v-model="transferMode" class="wf-input wf-input--select">
                <option
                  v-for="opt in CREDIT_TRANSFER_MODE_FORM_OPTIONS"
                  :key="opt.value || 'empty'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </label>

            <label class="wf-modal__field">
              <span class="wf-modal__field-label"><i class="wf-required">*</i>金额</span>
              <input
                v-model="amountInput"
                type="text"
                class="wf-input"
                placeholder="请输入金额"
                inputmode="decimal"
              />
            </label>

            <label class="wf-modal__field">
              <span class="wf-modal__field-label"><i class="wf-required">*</i>备注</span>
              <div class="credit-transfer-remark">
                <input
                  v-model="remarkInput"
                  type="text"
                  class="wf-input"
                  maxlength="16"
                  placeholder="请输入备注，最多16个字符"
                />
                <span class="credit-transfer-remark__count">
                  {{ remarkInput.length }} / 16
                </span>
              </div>
            </label>
          </div>

          <p v-if="transferHint" class="wf-modal__hint">{{ transferHint }}</p>
        </div>

        <footer class="wf-modal__footer">
          <button type="button" class="wf-btn wf-btn--default" @click="closeTransferModal">取消</button>
          <button type="button" class="wf-btn wf-btn--primary" @click="confirmTransfer">确定</button>
        </footer>
      </div>
    </div>

    <!-- 关联记录弹框 -->
    <div v-if="relatedVisible" class="wf-modal-mask" @click.self="closeRelated">
      <div
        class="wf-modal wf-modal--scroll wf-modal--credit-related"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-related-title"
      >
        <header class="wf-modal__header">
          <h3 id="credit-related-title" class="wf-modal__title">关联记录</h3>
          <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeRelated">
            ×
          </button>
        </header>

        <div class="wf-modal__body">
          <h4 class="credit-related-section__title">原始记录</h4>
          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">编号</th>
                  <th class="wf-th">用户</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金额</th>
                  <th class="wf-th">发起对象</th>
                  <th class="wf-th">类型</th>
                  <th class="wf-th">上下分对象</th>
                  <th class="wf-th">发起人</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="relatedOriginal">
                  <td class="wf-td wf-td--bill">{{ relatedOriginal.flowNo }}</td>
                  <td class="wf-td">{{ relatedOriginal.username }}</td>
                  <td class="wf-td">{{ relatedOriginal.userId }}</td>
                  <td
                    class="wf-td wf-td--center"
                    :class="signedNumberClass(relatedOriginal.amount)"
                  >
                    {{ formatCreditAmount(relatedOriginal.amount) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ initiatorTypeLabel(relatedOriginal.initiatorType) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ transferModeLabel(relatedOriginal.transferMode) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ targetTypeLabel(relatedOriginal.targetType) }}
                  </td>
                  <td class="wf-td">{{ relatedOriginal.initiatorName }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 class="credit-related-section__title">关联记录</h4>
          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">编号</th>
                  <th class="wf-th">用户</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金额</th>
                  <th class="wf-th">发起对象</th>
                  <th class="wf-th">类型</th>
                  <th class="wf-th">上下分对象</th>
                  <th class="wf-th">发起人</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="relatedPair">
                  <td class="wf-td wf-td--bill">{{ relatedPair.flowNo }}</td>
                  <td class="wf-td">{{ relatedPair.username }}</td>
                  <td class="wf-td">{{ relatedPair.userId }}</td>
                  <td class="wf-td wf-td--center" :class="signedNumberClass(relatedPair.amount)">
                    {{ formatCreditAmount(relatedPair.amount) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ initiatorTypeLabel(relatedPair.initiatorType) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ transferModeLabel(relatedPair.transferMode) }}
                  </td>
                  <td class="wf-td wf-td--center">
                    {{ targetTypeLabel(relatedPair.targetType) }}
                  </td>
                  <td class="wf-td">{{ relatedPair.initiatorName }}</td>
                </tr>
                <tr v-else>
                  <td colspan="8" class="wf-td wf-td--empty">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer class="wf-modal__footer">
          <button type="button" class="wf-btn wf-btn--default" @click="closeRelated">取消</button>
          <button type="button" class="wf-btn wf-btn--primary" @click="closeRelated">确定</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wf-btn--credit-transfer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-color: #52c41a;
  background: #52c41a;
  color: #fff;
}

.wf-btn--credit-transfer:hover {
  border-color: #73d13d;
  background: #73d13d;
  color: #fff;
}

.wf-modal--credit-transfer {
  width: min(960px, 94vw);
}

.wf-modal--credit-related {
  width: min(980px, 94vw);
}

.wf-tr--selected td {
  background: #e6f7ff;
}

.credit-transfer-form {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.wf-modal__field {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.wf-required {
  margin-right: 4px;
  color: #ff4d4f;
  font-style: normal;
}

.credit-transfer-remark {
  position: relative;
}

.credit-transfer-remark .wf-input {
  padding-right: 64px;
}

.credit-transfer-remark__count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
  pointer-events: none;
}

.credit-related-section__title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.credit-related-section__title + .wf-table-wrap {
  margin-bottom: 20px;
}
</style>
