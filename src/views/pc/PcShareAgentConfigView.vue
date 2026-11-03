<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  getAgentConfigLabels,
  getAgentConfigSpec,
  type AgentConfigLedger,
} from '../../constants/agentConfigSpec'
import {
  AGENT_LEVEL_OPTIONS,
  agentLevelLabel,
  applyCategoryRebate,
  cloneShareAgentP2pItems,
  cloneShareAgentProducts,
  cloneShareAgentRebateCategories,
  creditPercentInputPattern,
  creditPercentRangeLabel,
  formatCreditField,
  formatRebateRate,
  generateAgentCredential,
  getAgentConfigMockRows,
  MOCK_AGENT_CANDIDATE_USERS,
  validateCategoryRebate,
  validateProductRebate,
  validateSharePercent,
  type AgentCandidateUser,
  type AgentConfigRow,
  type PcShareAgentP2pItem,
  type PcShareAgentProduct,
  type PcShareAgentRebateCategory,
} from '../../constants/pcShareAgent'
import { showPcToast } from '../../composables/usePcToast'
import { useWorkspaceFork } from '../../composables/useWorkspaceFork'
import '../../styles/pc-wireframe.css'

/** 现金占成代理与信用代理分属两个独立页面，本页只承载其中一套 */
const props = withDefaults(defineProps<{ ledger?: AgentConfigLedger }>(), { ledger: 'cash' })

const labels = computed(() => getAgentConfigLabels(props.ledger))
const spec = computed(() => getAgentConfigSpec(props.ledger))

type AgentFilter = {
  userId: string
  superiorAgentId: string
  agentLevel: string
}

const defaultFilter = (): AgentFilter => ({
  userId: '',
  superiorAgentId: '',
  agentLevel: '',
})

const { patchMock } = useWorkspaceFork()

function buildInitialRows(): AgentConfigRow[] {
  const base = { rows: getAgentConfigMockRows(props.ledger) }
  return (patchMock(base) as { rows: AgentConfigRow[] }).rows
}

const filter = ref<AgentFilter>(defaultFilter())
const appliedFilter = ref<AgentFilter>(defaultFilter())

const rows = ref<AgentConfigRow[]>(buildInitialRows())

/** 两个菜单共用本组件，路由切换时组件实例会被复用 */
watch(
  () => props.ledger,
  () => {
    filter.value = defaultFilter()
    appliedFilter.value = defaultFilter()
    rows.value = buildInitialRows()
    closeEditModal()
  },
)

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function matchRow(row: AgentConfigRow) {
  const f = appliedFilter.value
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.superiorAgentId && !row.superiorAgentId.includes(f.superiorAgentId.trim())) return false
  if (f.agentLevel && String(row.agentLevel) !== f.agentLevel) return false
  return true
}

const filteredRows = computed(() => rows.value.filter(matchRow))

function toggleDisabled(row: AgentConfigRow) {
  row.disabled = !row.disabled
  showPcToast(row.disabled ? '已禁用该代理' : '已启用该代理')
}

/* ---------- 新增 / 编辑代理弹框 ---------- */
type AgentModalMode = 'create' | 'edit'

const editVisible = ref(false)
const modalMode = ref<AgentModalMode>('edit')
const editTarget = ref<AgentConfigRow | null>(null)
const createUserId = ref('')
const createCandidate = ref<AgentCandidateUser | null>(null)
const shareProducts = ref<PcShareAgentProduct[]>([])
const p2pItems = ref<PcShareAgentP2pItem[]>([])
const rebateCategories = ref<PcShareAgentRebateCategory[]>([])
const editHint = ref('')

function resetSchemeForm() {
  shareProducts.value = cloneShareAgentProducts()
  p2pItems.value = cloneShareAgentP2pItems()
  rebateCategories.value = cloneShareAgentRebateCategories()
  editHint.value = ''
}

function openEditModal(row: AgentConfigRow) {
  modalMode.value = 'edit'
  editTarget.value = { ...row }
  resetSchemeForm()
  editVisible.value = true
}

function openCreateModal() {
  modalMode.value = 'create'
  editTarget.value = null
  createUserId.value = ''
  createCandidate.value = null
  resetSchemeForm()
  editVisible.value = true
}

/** 改了用户ID就作废上一次查询结果，必须重新查询 */
function onCreateUserIdInput() {
  createCandidate.value = null
  editHint.value = ''
}

function queryCreateUser() {
  const keyword = createUserId.value.trim()
  createCandidate.value = null
  if (!keyword) {
    editHint.value = '请输入用户ID'
    return
  }
  if (rows.value.some((row) => row.userId === keyword)) {
    editHint.value = `该用户已是${labels.value.agentName}，无需重复新增`
    return
  }
  const user = MOCK_AGENT_CANDIDATE_USERS.find((item) => item.userId === keyword)
  if (!user) {
    editHint.value = '未查询到该用户，请核对用户ID'
    return
  }
  createCandidate.value = { ...user }
  resetSchemeForm()
}

const modalTitle = computed(() => (modalMode.value === 'create' ? '新增代理' : '编辑代理'))
const schemeVisible = computed(() => modalMode.value === 'edit' || Boolean(createCandidate.value))

function closeEditModal() {
  editVisible.value = false
  editTarget.value = null
  createUserId.value = ''
  createCandidate.value = null
  shareProducts.value = []
  p2pItems.value = []
  rebateCategories.value = []
  editHint.value = ''
}

function shareError(product: PcShareAgentProduct) {
  return validateSharePercent(product.share, product.maxShare, labels.value.share)
}

function p2pError(item: PcShareAgentP2pItem) {
  return validateSharePercent(item.share, item.maxShare, labels.value.p2p)
}

function rebateProductError(category: PcShareAgentRebateCategory, productKey: string) {
  const product = category.products.find((item) => item.key === productKey)
  if (!product) return ''
  return validateProductRebate(product, labels.value.rebate)
}

function onCategoryRebateInput(category: PcShareAgentRebateCategory, event: Event) {
  category.rebate = Number((event.target as HTMLInputElement).value)
  applyCategoryRebate(category)
}

const hasValidationError = computed(() => {
  const rebateLabel = labels.value.rebate
  return (
    shareProducts.value.some((product) => Boolean(shareError(product))) ||
    p2pItems.value.some((item) => Boolean(p2pError(item))) ||
    rebateCategories.value.some(
      (category) =>
        Boolean(validateCategoryRebate(category, rebateLabel)) ||
        category.products.some((product) => Boolean(validateProductRebate(product, rebateLabel))),
    )
  )
})

function formatAccountPair(account: string, password: string) {
  return `账号：${account.trim() || '-'}\n密码：${password.trim() || '-'}`
}

function confirmEditModal() {
  if (modalMode.value === 'create' && !createCandidate.value) {
    editHint.value = '请先查询并确认用户'
    return
  }
  if (hasValidationError.value) {
    editHint.value = '请修正比例后再提交'
    return
  }
  const candidate = createCandidate.value
  if (modalMode.value === 'create' && candidate) {
    rows.value.unshift({
      id: Math.max(0, ...rows.value.map((row) => row.id)) + 1,
      ...candidate,
      agentLevel: 1,
      superiorAgent: '平台',
      superiorAgentId: '0',
      agentAccount: generateAgentCredential(),
      agentPassword: generateAgentCredential(),
      disabled: false,
    })
    closeEditModal()
    showPcToast('已新增一级代理，账密已生成')
    return
  }
  closeEditModal()
  showPcToast('已保存代理配置')
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
          <WfSpecAnnot
            :no="spec.annot.filterAgentLevel.no"
            :title="spec.annot.filterAgentLevel.title"
            :items="[...spec.annot.filterAgentLevel.items]"
            placement="bottom"
          />
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
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openCreateModal">新增</button>
          <WfSpecAnnot
            :no="spec.annot.create.no"
            :title="spec.annot.create.title"
            :items="[...spec.annot.create.items]"
            placement="bottom"
          />
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
              <th class="wf-th">代理级别</th>
              <th class="wf-th">上级代理</th>
              <th class="wf-th">上级代理ID</th>
              <th class="wf-th wf-th--with-spec">
                {{ labels.account }}
                <WfSpecAnnot
                  :no="spec.annot.credentials.no"
                  :title="spec.annot.credentials.title"
                  :items="[...spec.annot.credentials.items]"
                  placement="bottom"
                />
              </th>
              <th class="wf-th">{{ labels.password }}</th>
              <th class="wf-th wf-th--status">状态</th>
              <th class="wf-th wf-th--op wf-th--with-spec">
                操作
                <WfSpecAnnot
                  :no="spec.annot.rowActions.no"
                  :title="spec.annot.rowActions.title"
                  :items="[...spec.annot.rowActions.items]"
                  placement="top"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.kingKongId }}</td>
              <td class="wf-td">{{ agentLevelLabel(row.agentLevel) }}</td>
              <td class="wf-td">{{ row.superiorAgent }}</td>
              <td class="wf-td">{{ row.superiorAgentId }}</td>
              <td class="wf-td">{{ formatCreditField(row.agentAccount) }}</td>
              <td class="wf-td">{{ formatCreditField(row.agentPassword) }}</td>
              <td class="wf-td wf-td--center wf-td--status">
                <span
                  class="wf-status-badge"
                  :class="row.disabled ? 'wf-status-badge--disabled' : 'wf-status-badge--enabled'"
                >
                  {{ row.disabled ? '禁用' : '启用' }}
                </span>
              </td>
              <td class="wf-td wf-td--actions">
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
              <td colspan="11" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <!-- 编辑代理弹框 -->
    <Teleport to="body">
      <div
        v-if="editVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeEditModal"
      >
        <div
          class="wf-modal wf-modal--scroll wf-modal--share-agent-credit"
          role="dialog"
          aria-labelledby="share-agent-edit-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="share-agent-edit-title" class="wf-modal__title">{{ modalTitle }}</h3>
            <button
              type="button"
              class="wf-modal__close"
              aria-label="关闭"
              @click="closeEditModal"
            >
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <div v-if="modalMode === 'create'" class="wf-modal__query">
              <label class="wf-label">用户ID：</label>
              <input
                v-model="createUserId"
                type="text"
                class="wf-input"
                placeholder="请输入用户ID（精准查询）"
                @input="onCreateUserIdInput"
                @keydown.enter.prevent="queryCreateUser"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="queryCreateUser">查询</button>
            </div>

            <table
              v-if="modalMode === 'create' && createCandidate"
              class="wf-table wf-table--modal wf-table--share-agent-info"
            >
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">代理级别</th>
                  <th class="wf-th">{{ labels.credentials }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="wf-td">{{ createCandidate.username }}</td>
                  <td class="wf-td">{{ createCandidate.userId }}</td>
                  <td class="wf-td">{{ createCandidate.kingKongId }}</td>
                  <td class="wf-td">1级代理（上级：平台）</td>
                  <td class="wf-td wf-muted">提交后生成</td>
                </tr>
              </tbody>
            </table>

            <table v-if="editTarget" class="wf-table wf-table--modal wf-table--share-agent-info">
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">{{ labels.credentials }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="wf-td">{{ editTarget.username }}</td>
                  <td class="wf-td">{{ editTarget.userId }}</td>
                  <td class="wf-td">{{ editTarget.kingKongId }}</td>
                  <td class="wf-td wf-td--multiline">
                    {{ formatAccountPair(editTarget.agentAccount, editTarget.agentPassword) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <template v-if="schemeVisible">
            <section class="wf-share-agent-credit-panel">
              <h4 class="wf-share-agent-credit-panel__title wf-share-agent-credit-panel__title--with-spec">
                {{ labels.share }}
                <WfSpecAnnot
                  :no="spec.annot.share.no"
                  :title="spec.annot.share.title"
                  :items="[...spec.annot.share.items]"
                  placement="bottom"
                />
              </h4>
              <div class="wf-share-agent-credit-grid">
                <div
                  v-for="product in shareProducts"
                  :key="`share-${product.key}`"
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
                      :title="`${labels.share}区间 ${creditPercentRangeLabel(product.maxShare)}%，x 为上级代理该游戏类型最大值`"
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
                {{ labels.p2p }}
                <WfSpecAnnot
                  :no="spec.annot.p2p.no"
                  :title="spec.annot.p2p.title"
                  :items="[...spec.annot.p2p.items]"
                  placement="bottom"
                />
              </h4>
              <div class="wf-share-agent-credit-grid">
                <div
                  v-for="item in p2pItems"
                  :key="`p2p-${item.key}`"
                  class="wf-share-agent-credit-field"
                >
                  <label class="wf-share-agent-credit-field__label">{{ item.name }}</label>
                  <div class="wf-modal__pct-row">
                    <input
                      v-model.number="item.share"
                      type="text"
                      inputmode="decimal"
                      class="wf-input wf-input--pct"
                      :placeholder="creditPercentRangeLabel(item.maxShare)"
                      :pattern="creditPercentInputPattern()"
                      :title="`${labels.p2p}区间 ${creditPercentRangeLabel(item.maxShare)}%，与${labels.share}一致`"
                    />
                    <span class="wf-pct">%</span>
                  </div>
                  <p class="wf-share-agent-credit-field__range">
                    区间 {{ creditPercentRangeLabel(item.maxShare) }}%
                  </p>
                  <p v-if="p2pError(item)" class="wf-share-agent-credit-field__error">
                    {{ p2pError(item) }}
                  </p>
                </div>
              </div>
            </section>

            <section class="wf-share-agent-credit-panel">
              <h4 class="wf-share-agent-credit-panel__title wf-share-agent-credit-panel__title--with-spec">
                {{ labels.rebate }}
                <WfSpecAnnot
                  :no="spec.annot.rebate.no"
                  :title="spec.annot.rebate.title"
                  :items="[...spec.annot.rebate.items]"
                  placement="bottom"
                />
              </h4>
              <div class="wf-share-agent-rebate-list">
                <article
                  v-for="category in rebateCategories"
                  :key="`rebate-${category.key}`"
                  class="wf-share-agent-rebate-cat"
                >
                  <div class="wf-share-agent-rebate-cat__head">
                    <label class="wf-share-agent-rebate-cat__name">{{ category.name }}</label>
                    <div class="wf-share-agent-rebate-cat__control">
                      <div class="wf-share-agent-rebate-slider">
                        <input
                          :value="category.rebate"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          :aria-label="`${category.name}退水`"
                          :title="`${category.name}退水滑块，区间 0-100%`"
                          @input="onCategoryRebateInput(category, $event)"
                        />
                        <span class="wf-share-agent-rebate-slider__value">{{ category.rebate }}%</span>
                      </div>
                      <p class="wf-share-agent-credit-field__range">区间 0-100%</p>
                    </div>
                  </div>
                  <div class="wf-share-agent-credit-grid">
                    <div
                      v-for="product in category.products"
                      :key="`${category.key}-${product.key}`"
                      class="wf-share-agent-credit-field"
                    >
                      <label class="wf-share-agent-credit-field__label">{{ product.name }}</label>
                      <div class="wf-modal__pct-row">
                        <input
                          v-model="product.rebate"
                          type="text"
                          inputmode="decimal"
                          class="wf-input wf-input--pct"
                          :placeholder="`0-${formatRebateRate(product.maxRebate)}`"
                          :pattern="creditPercentInputPattern()"
                          :title="`${product.name}退水区间 0-${formatRebateRate(product.maxRebate)}%`"
                        />
                        <span class="wf-pct">%</span>
                      </div>
                      <p class="wf-share-agent-credit-field__range">
                        区间 0-{{ formatRebateRate(product.maxRebate) }}%
                      </p>
                      <p
                        v-if="rebateProductError(category, product.key)"
                        class="wf-share-agent-credit-field__error"
                      >
                        {{ rebateProductError(category, product.key) }}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>
            </template>

            <p v-if="editHint" class="wf-modal__hint">{{ editHint }}</p>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeEditModal">取消</button>
            <button
              type="button"
              class="wf-btn wf-btn--primary"
              :disabled="!schemeVisible || hasValidationError"
              @click="confirmEditModal"
            >
              {{ modalMode === 'create' ? '确定' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
