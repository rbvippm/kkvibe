<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfShareAgentFilterAnnot from '../../components/wireframe/WfShareAgentFilterAnnot.vue'
import WfShareAgentCreditBadgeAnnot from '../../components/wireframe/WfShareAgentCreditBadgeAnnot.vue'
import WfShareAgentCreditCredentialsAnnot from '../../components/wireframe/WfShareAgentCreditCredentialsAnnot.vue'
import WfShareAgentGrantAnnot from '../../components/wireframe/WfShareAgentGrantAnnot.vue'
import WfShareAgentGrantFlowAnnot from '../../components/wireframe/WfShareAgentGrantFlowAnnot.vue'
import WfShareAgentRowActionsAnnot from '../../components/wireframe/WfShareAgentRowActionsAnnot.vue'
import WfShareAgentCreditTabAnnot from '../../components/wireframe/WfShareAgentCreditTabAnnot.vue'
import WfShareAgentRebateAnnot from '../../components/wireframe/WfShareAgentRebateAnnot.vue'
import WfShareAgentShareAnnot from '../../components/wireframe/WfShareAgentShareAnnot.vue'
import {
  AGENT_LEVEL_OPTIONS,
  agentLevelLabel,
  cloneShareAgentProducts,
  creditPercentInputPattern,
  creditPercentRangeLabel,
  CREDIT_AGENT_FILTER_OPTIONS,
  formatCreditField,
  getRebateSectionLabel,
  getShareSectionLabel,
  hasCreditAgentCredentials,
  MOCK_SHARE_AGENT_ROWS,
  validateRebatePercent,
  validateSharePercent,
  type CreditAccountTab,
  type CreditModalMode,
  type PcShareAgentProduct,
  type ShareAgentRow,
} from '../../constants/pcShareAgent'
import { useWorkspaceFork } from '../../composables/useWorkspaceFork'
import '../../styles/pc-wireframe.css'

type ShareFilter = {
  userId: string
  superiorAgentId: string
  agentLevel: string
  creditAgent: string
}

const defaultFilter = (): ShareFilter => ({
  userId: '',
  superiorAgentId: '',
  agentLevel: '',
  creditAgent: '',
})

const { patchMock } = useWorkspaceFork()

function buildInitialRows(): ShareAgentRow[] {
  const base = { rows: MOCK_SHARE_AGENT_ROWS.map((row) => ({ ...row })) }
  return (patchMock(base) as { rows: ShareAgentRow[] }).rows
}

const filter = ref<ShareFilter>(defaultFilter())
const appliedFilter = ref<ShareFilter>(defaultFilter())

const rows = ref<ShareAgentRow[]>(buildInitialRows())

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function matchRow(row: ShareAgentRow) {
  const f = appliedFilter.value
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.superiorAgentId && !row.superiorAgentId.includes(f.superiorAgentId.trim())) return false
  if (f.agentLevel && String(row.agentLevel) !== f.agentLevel) return false
  if (f.creditAgent === 'yes' && !(row.isCreditAgent && hasCreditAgentCredentials(row))) return false
  if (f.creditAgent === 'no' && row.isCreditAgent && hasCreditAgentCredentials(row)) return false
  return true
}

const filteredRows = computed(() => rows.value.filter(matchRow))

function toggleDisabled(row: ShareAgentRow) {
  row.disabled = !row.disabled
}

/* ---------- 授信弹框 ---------- */
const CREDIT_ACCOUNT_TABS: { key: CreditAccountTab; label: string }[] = [
  { key: 'cash', label: '现金' },
  { key: 'credit', label: '信用' },
]

const creditModalVisible = ref(false)
const creditModalMode = ref<CreditModalMode>('grant')
const creditTarget = ref<ShareAgentRow | null>(null)
const creditAccountTab = ref<CreditAccountTab>('credit')
const cashCreditProducts = ref<PcShareAgentProduct[]>([])
const creditCreditProducts = ref<PcShareAgentProduct[]>([])
const creditHint = ref('')

const creditTabVisible = computed(() => {
  if (!creditTarget.value) return false
  return creditTarget.value.isCreditAgent && hasCreditAgentCredentials(creditTarget.value)
})

const showCreditAccountTabs = computed(
  () => creditModalMode.value === 'edit' && creditTabVisible.value,
)

const visibleCreditAccountTabs = computed(() =>
  CREDIT_ACCOUNT_TABS.filter((tab) => tab.key === 'cash' || creditTabVisible.value),
)

const activeCreditProducts = computed(() => {
  if (creditModalMode.value === 'grant') return creditCreditProducts.value
  return creditAccountTab.value === 'cash' ? cashCreditProducts.value : creditCreditProducts.value
})

const activeCreditFormKey = computed(() =>
  creditModalMode.value === 'grant' ? 'grant' : creditAccountTab.value,
)

const activeShareLabel = computed(() =>
  getShareSectionLabel(creditModalMode.value, creditAccountTab.value),
)

const activeRebateLabel = computed(() =>
  getRebateSectionLabel(creditModalMode.value, creditAccountTab.value),
)

const creditModalTitle = computed(() =>
  creditModalMode.value === 'grant' ? '代理授信' : '编辑代理',
)

function resetCreditModalForm(row: ShareAgentRow, mode: CreditModalMode) {
  creditModalMode.value = mode
  creditTarget.value = { ...row }
  creditAccountTab.value =
    mode === 'edit' && row.isCreditAgent && hasCreditAgentCredentials(row) ? 'credit' : 'cash'
  cashCreditProducts.value = cloneShareAgentProducts()
  creditCreditProducts.value = cloneShareAgentProducts()
  creditHint.value = ''
}

function openCreditModal(row: ShareAgentRow) {
  resetCreditModalForm(row, 'grant')
  creditModalVisible.value = true
}

function openEditModal(row: ShareAgentRow) {
  resetCreditModalForm(row, 'edit')
  creditModalVisible.value = true
}

function closeCreditModal() {
  creditModalVisible.value = false
  creditModalMode.value = 'grant'
  creditTarget.value = null
  creditAccountTab.value = 'credit'
  cashCreditProducts.value = []
  creditCreditProducts.value = []
  creditHint.value = ''
}

function shareError(product: PcShareAgentProduct) {
  return validateSharePercent(product.share, product.maxShare, activeShareLabel.value)
}

function rebateError(product: PcShareAgentProduct) {
  return validateRebatePercent(product.rebate, product.maxRebate, activeRebateLabel.value)
}

function productsHaveError(
  products: PcShareAgentProduct[],
  mode: CreditModalMode,
  tab: CreditAccountTab,
) {
  const shareLabel = getShareSectionLabel(mode, tab)
  const rebateLabel = getRebateSectionLabel(mode, tab)
  return products.some(
    (p) =>
      validateSharePercent(p.share, p.maxShare, shareLabel) ||
      validateRebatePercent(p.rebate, p.maxRebate, rebateLabel),
  )
}

function hasCreditValidationError() {
  if (creditModalMode.value === 'grant') {
    return productsHaveError(creditCreditProducts.value, 'grant', 'credit')
  }
  const cashHasError = productsHaveError(cashCreditProducts.value, 'edit', 'cash')
  if (!showCreditAccountTabs.value) return cashHasError
  const creditHasError = productsHaveError(creditCreditProducts.value, 'edit', 'credit')
  return cashHasError || creditHasError
}

function formatAccountPair(account: string, password: string) {
  const acc = account.trim() || '-'
  const pwd = password.trim() || '-'
  return `账号：${acc}\n密码：${pwd}`
}

function confirmCreditModal() {
  if (!creditTarget.value) return
  if (hasCreditValidationError()) {
    creditHint.value = '请修正比例后再提交'
    return
  }

  if (creditModalMode.value === 'grant') {
    const targetId = creditTarget.value.id
    const index = rows.value.findIndex((row) => row.id === targetId)
    if (index >= 0) {
      const row = rows.value[index]
      rows.value[index] = {
        ...row,
        isCreditAgent: true,
        creditAgentAccount: row.cashAgentAccount,
        creditAgentPassword: row.cashAgentPassword,
      }
    }
  }

  closeCreditModal()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">上级代理ID：</label>
        <input
          v-model="filter.superiorAgentId"
          type="text"
          class="wf-input"
          placeholder="请输入上级代理ID"
        />

        <label class="wf-label wf-label--with-spec">
          代理等级：
          <WfShareAgentFilterAnnot context="agentLevel" placement="bottom" />
        </label>
        <select v-model="filter.agentLevel" class="wf-input wf-input--select">
          <option
            v-for="opt in AGENT_LEVEL_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label wf-label--with-spec">
          信用代理：
          <WfShareAgentFilterAnnot context="creditAgent" placement="bottom" />
        </label>
        <select v-model="filter.creditAgent" class="wf-input wf-input--select">
          <option
            v-for="opt in CREDIT_AGENT_FILTER_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--share-agent">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">用户名</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金刚号</th>
              <th class="wf-th wf-th--with-spec">
                代理级别
                <WfShareAgentCreditBadgeAnnot placement="bottom" />
              </th>
              <th class="wf-th">上级代理</th>
              <th class="wf-th">上级代理ID</th>
              <th class="wf-th">现金代理账号</th>
              <th class="wf-th">现金代理密码</th>
              <th class="wf-th wf-th--with-spec">
                信用代理账号
                <WfShareAgentCreditCredentialsAnnot placement="bottom" />
              </th>
              <th class="wf-th">信用代理密码</th>
              <th class="wf-th wf-th--status">状态</th>
              <th class="wf-th wf-th--op wf-th--with-spec">
                操作
                <WfShareAgentRowActionsAnnot placement="top" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.kingKongId }}</td>
              <td class="wf-td">
                <span class="wf-share-agent-level">
                  {{ agentLevelLabel(row.agentLevel) }}
                  <span
                    v-if="row.isCreditAgent && hasCreditAgentCredentials(row)"
                    class="wf-credit-badge"
                    title="信用代理"
                    aria-label="信用代理"
                  >信</span>
                </span>
              </td>
              <td class="wf-td">{{ row.superiorAgent }}</td>
              <td class="wf-td">{{ row.superiorAgentId }}</td>
              <td class="wf-td">{{ row.cashAgentAccount }}</td>
              <td class="wf-td">{{ row.cashAgentPassword }}</td>
              <td class="wf-td">{{ formatCreditField(row.creditAgentAccount) }}</td>
              <td class="wf-td">{{ formatCreditField(row.creditAgentPassword) }}</td>
              <td class="wf-td wf-td--center wf-td--status">
                <span
                  class="wf-status-badge"
                  :class="row.disabled ? 'wf-status-badge--disabled' : 'wf-status-badge--enabled'"
                >
                  {{ row.disabled ? '禁用' : '启用' }}
                </span>
              </td>
              <td class="wf-td wf-td--actions">
                <span
                  v-if="row.agentLevel === 1 && !row.isCreditAgent"
                  class="wf-action-with-spec"
                >
                  <button
                    type="button"
                    class="wf-btn wf-btn--credit"
                    @click="openCreditModal(row)"
                  >
                    授信
                  </button>
                  <WfShareAgentGrantAnnot placement="bottom" />
                </span>
                <template v-if="row.agentLevel === 1 && !row.isCreditAgent">
                  <span class="wf-action-sep">|</span>
                </template>
                <button type="button" class="wf-link-action" @click="openEditModal(row)">编辑</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action wf-link-action--danger"
                  @click="toggleDisabled(row)"
                >
                  {{ row.disabled ? '启用' : '禁用' }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td colspan="13" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <!-- 代理授信弹框 -->
    <Teleport to="body">
      <div
        v-if="creditModalVisible && creditTarget"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeCreditModal"
      >
        <div
          class="wf-modal wf-modal--scroll wf-modal--share-agent-credit"
          role="dialog"
          aria-labelledby="share-agent-credit-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="share-agent-credit-title" class="wf-modal__title wf-modal__title--with-spec">
              {{ creditModalTitle }}
              <WfShareAgentGrantFlowAnnot v-if="creditModalMode === 'grant'" placement="bottom" />
            </h3>
            <button
              type="button"
              class="wf-modal__close"
              aria-label="关闭"
              @click="closeCreditModal"
            >
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <table class="wf-table wf-table--modal wf-table--share-agent-info">
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">现金代理账密</th>
                  <th class="wf-th">信用代理账密</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="wf-td">{{ creditTarget.username }}</td>
                  <td class="wf-td">{{ creditTarget.userId }}</td>
                  <td class="wf-td">{{ creditTarget.kingKongId }}</td>
                  <td class="wf-td wf-td--multiline">
                    {{ formatAccountPair(creditTarget.cashAgentAccount, creditTarget.cashAgentPassword) }}
                  </td>
                  <td class="wf-td wf-td--multiline">
                    {{ formatAccountPair(creditTarget.creditAgentAccount, creditTarget.creditAgentPassword) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="showCreditAccountTabs" class="wf-share-agent-credit-tabs">
              <div class="wf-tabs" role="tablist" aria-label="代理账密类型">
                <template v-for="tab in visibleCreditAccountTabs" :key="tab.key">
                  <div v-if="tab.key === 'credit'" class="wf-tab-item">
                    <button
                      type="button"
                      role="tab"
                      class="wf-tab"
                      :class="{ 'wf-tab--active': creditAccountTab === tab.key }"
                      :aria-selected="creditAccountTab === tab.key"
                      @click="creditAccountTab = tab.key"
                    >
                      {{ tab.label }}
                    </button>
                    <WfShareAgentCreditTabAnnot placement="bottom" />
                  </div>
                  <button
                    v-else
                    type="button"
                    role="tab"
                    class="wf-tab"
                    :class="{ 'wf-tab--active': creditAccountTab === tab.key }"
                    :aria-selected="creditAccountTab === tab.key"
                    @click="creditAccountTab = tab.key"
                  >
                    {{ tab.label }}
                  </button>
                </template>
              </div>
            </div>

            <section class="wf-share-agent-credit-panel">
              <h4 class="wf-share-agent-credit-panel__title wf-share-agent-credit-panel__title--with-spec">
                {{ activeShareLabel }}
                <WfShareAgentShareAnnot placement="bottom" />
              </h4>
              <div class="wf-share-agent-credit-grid">
                <div
                  v-for="product in activeCreditProducts"
                  :key="`${activeCreditFormKey}-share-${product.key}`"
                  class="wf-share-agent-credit-field"
                >
                  <label class="wf-share-agent-credit-field__label">{{ product.name }}</label>
                  <div class="wf-modal__pct-row">
                    <input
                      v-model.number="product.share"
                      type="text"
                      inputmode="decimal"
                      class="wf-input wf-input--pct"
                      :placeholder="creditPercentRangeLabel(product.maxShare)"
                      :pattern="creditPercentInputPattern()"
                      :title="`${activeShareLabel}区间 ${creditPercentRangeLabel(product.maxShare)}%，x 为上级代理该游戏类型最大值`"
                    />
                    <span class="wf-pct">%</span>
                  </div>
                  <p class="wf-share-agent-credit-field__range">
                    区间 {{ creditPercentRangeLabel(product.maxShare) }}%
                  </p>
                  <p v-if="shareError(product)" class="wf-share-agent-credit-field__error">
                    {{ shareError(product) }}
                  </p>
                </div>
              </div>
            </section>

            <section class="wf-share-agent-credit-panel">
              <h4 class="wf-share-agent-credit-panel__title wf-share-agent-credit-panel__title--with-spec">
                {{ activeRebateLabel }}
                <WfShareAgentRebateAnnot :title="activeRebateLabel" placement="bottom" />
              </h4>
              <div class="wf-share-agent-credit-grid">
                <div
                  v-for="product in activeCreditProducts"
                  :key="`${activeCreditFormKey}-rebate-${product.key}`"
                  class="wf-share-agent-credit-field"
                >
                  <label class="wf-share-agent-credit-field__label">{{ product.name }}</label>
                  <div class="wf-modal__pct-row">
                    <input
                      v-model.number="product.rebate"
                      type="text"
                      inputmode="decimal"
                      class="wf-input wf-input--pct"
                      :placeholder="creditPercentRangeLabel(product.maxRebate)"
                      :pattern="creditPercentInputPattern()"
                      :title="`${activeRebateLabel}区间 ${creditPercentRangeLabel(product.maxRebate)}%，x 为上级代理该品类最大值`"
                    />
                    <span class="wf-pct">%</span>
                  </div>
                  <p class="wf-share-agent-credit-field__range">
                    区间 {{ creditPercentRangeLabel(product.maxRebate) }}%
                  </p>
                  <p v-if="rebateError(product)" class="wf-share-agent-credit-field__error">
                    {{ rebateError(product) }}
                  </p>
                </div>
              </div>
            </section>

            <p v-if="creditHint" class="wf-modal__hint">{{ creditHint }}</p>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeCreditModal">取消</button>
            <button
              type="button"
              class="wf-btn wf-btn--primary"
              :disabled="hasCreditValidationError()"
              @click="confirmCreditModal"
            >
              {{ creditModalMode === 'grant' ? '确认授信' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
