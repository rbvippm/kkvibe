<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfRebateAgentConfigAnnot from '../../components/wireframe/WfRebateAgentConfigAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  MOCK_REBATE_AGENT_ROWS,
  cloneRebateAgentLotteryRebate,
  createRebateAgentLotteryRebate,
  genRebateAgentBackendAccount,
  genRebateAgentBackendPassword,
  rebateAgentLevelLabel,
  searchRebateAgentCandidates,
  type RebateAgentCandidate,
  type RebateAgentRow,
} from '../../constants/rebateAgentConfig'
import {
  applyCategoryRebate,
  creditPercentInputPattern,
  formatRebateRate,
  validateProductRebate,
  type PcShareAgentRebateCategory,
  type PcShareAgentRebateProduct,
} from '../../constants/pcShareAgent'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  userId: string
}

const defaultFilter = (): ListFilter => ({
  userId: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const rows = ref<RebateAgentRow[]>(
  MOCK_REBATE_AGENT_ROWS.map((row) => ({
    ...row,
    lotteryRebate: cloneRebateAgentLotteryRebate(row.lotteryRebate),
  })),
)

function applyFilter() {
  applied.value = {
    userId: filter.value.userId.trim(),
  }
}

function resetFilter() {
  filter.value = defaultFilter()
  applied.value = defaultFilter()
}

function matchRow(row: RebateAgentRow) {
  const f = applied.value
  if (f.userId && !row.userId.includes(f.userId)) return false
  return true
}

const filteredRows = computed(() => rows.value.filter(matchRow))

function toggleDisabled(row: RebateAgentRow) {
  row.disabled = !row.disabled
}

/* ---------- 新增 / 编辑弹框 ---------- */
type ModalMode = 'add' | 'edit'

const addVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const searchUserId = ref('')
const searchHint = ref('')
const searchResults = ref<RebateAgentCandidate[]>([])
const selectedUser = ref<RebateAgentCandidate | null>(null)
const lotteryCategory = ref<PcShareAgentRebateCategory>(createRebateAgentLotteryRebate())
const formHint = ref('')

const modalTitle = computed(() => (modalMode.value === 'add' ? '新增返佣代理' : '编辑返佣代理'))

function resetModalState() {
  searchUserId.value = ''
  searchHint.value = ''
  searchResults.value = []
  selectedUser.value = null
  lotteryCategory.value = createRebateAgentLotteryRebate()
  formHint.value = ''
  editingId.value = null
}

function openAddModal() {
  modalMode.value = 'add'
  resetModalState()
  addVisible.value = true
}

function openEditModal(row: RebateAgentRow) {
  modalMode.value = 'edit'
  resetModalState()
  editingId.value = row.id
  selectedUser.value = {
    username: row.username,
    userId: row.userId,
    kingKongId: row.kingKongId,
  }
  lotteryCategory.value = cloneRebateAgentLotteryRebate(row.lotteryRebate)
  addVisible.value = true
}

function closeAddModal() {
  addVisible.value = false
}

function searchUser() {
  const kw = searchUserId.value.trim()
  if (!kw) {
    searchHint.value = '请输入用户ID'
    searchResults.value = []
    selectedUser.value = null
    return
  }
  searchHint.value = ''
  searchResults.value = searchRebateAgentCandidates(kw)
  selectedUser.value = null
  if (!searchResults.value.length) {
    searchHint.value = '未找到匹配用户'
  }
}

function selectUser(user: RebateAgentCandidate) {
  selectedUser.value = user
  formHint.value = ''
}

function onLotterySliderInput(event: Event) {
  lotteryCategory.value.rebate = Number((event.target as HTMLInputElement).value)
  applyCategoryRebate(lotteryCategory.value)
}

function lotteryProductError(product: PcShareAgentRebateProduct) {
  return validateProductRebate(product, '退水')
}

function lotteryFormError() {
  const invalid = lotteryCategory.value.products.find((product) => lotteryProductError(product))
  return invalid ? lotteryProductError(invalid) : ''
}

function confirmModal() {
  if (modalMode.value === 'add') {
    if (!selectedUser.value) {
      formHint.value = '请先搜索并选择用户'
      return
    }
    const exists = rows.value.some((row) => row.userId === selectedUser.value!.userId)
    if (exists) {
      formHint.value = '该用户已是返佣代理，请勿重复新增'
      return
    }
  }

  const rebateMessage = lotteryFormError()
  if (rebateMessage) {
    formHint.value = rebateMessage
    return
  }

  const lotteryRebate = cloneRebateAgentLotteryRebate(lotteryCategory.value)
  if (modalMode.value === 'edit') {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (!target) {
      formHint.value = '未找到该返佣代理'
      return
    }
    target.lotteryRebate = lotteryRebate
    closeAddModal()
    showPcToast('已保存')
    return
  }

  const user = selectedUser.value!
  rows.value.unshift({
    id: `ra_${Date.now()}`,
    username: user.username,
    userId: user.userId,
    kingKongId: user.kingKongId,
    agentLevel: 1,
    superiorAgent: '-',
    superiorAgentId: '0',
    backendAccount: genRebateAgentBackendAccount(user.userId),
    backendPassword: genRebateAgentBackendPassword(),
    disabled: false,
    lotteryRebate,
  })
  closeAddModal()
  showPcToast('已新增返佣代理')
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--add" @click="openAddModal">+ 新增</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">用户名</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金刚号</th>
              <th class="wf-th">代理级别</th>
              <th class="wf-th">代理后台账号</th>
              <th class="wf-th">代理后台密码</th>
              <th class="wf-th wf-th--status">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.kingKongId }}</td>
              <td class="wf-td">{{ rebateAgentLevelLabel(row.agentLevel) }}</td>
              <td class="wf-td">{{ row.backendAccount }}</td>
              <td class="wf-td">{{ row.backendPassword }}</td>
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
                  class="wf-link-action"
                  :class="row.disabled ? '' : 'wf-link-action--danger'"
                  @click="toggleDisabled(row)"
                >
                  {{ row.disabled ? '启用' : '禁用' }}
                </button>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="9" class="wf-td wf-td--empty">暂无返佣代理数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-muted">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="addVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeAddModal"
      >
        <div
          class="wf-modal wf-modal--scroll wf-modal--share-agent-credit"
          role="dialog"
          aria-labelledby="rebate-agent-add-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="rebate-agent-add-title" class="wf-modal__title wf-modal__title--with-spec">
              {{ modalTitle }}
              <WfRebateAgentConfigAnnot
                :context="modalMode === 'add' ? 'addModal' : 'editModal'"
                placement="bottom"
              />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeAddModal">
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <template v-if="modalMode === 'add'">
              <div class="wf-toolbar wf-toolbar--filters">
                <label class="wf-label">用户ID：</label>
                <input
                  v-model="searchUserId"
                  type="text"
                  class="wf-input"
                  placeholder="请输入用户ID"
                  @keyup.enter="searchUser"
                />
                <button type="button" class="wf-btn wf-btn--primary" @click="searchUser">搜索</button>
              </div>
              <p v-if="searchHint" class="wf-modal__hint">{{ searchHint }}</p>

              <div class="wf-table-wrap">
                <table class="wf-table">
                  <thead>
                    <tr>
                      <th class="wf-th">用户名</th>
                      <th class="wf-th">用户ID</th>
                      <th class="wf-th">金刚号</th>
                      <th class="wf-th wf-th--op">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in searchResults" :key="user.userId">
                      <td class="wf-td">{{ user.username }}</td>
                      <td class="wf-td">{{ user.userId }}</td>
                      <td class="wf-td">{{ user.kingKongId }}</td>
                      <td class="wf-td wf-td--actions">
                        <button
                          type="button"
                          class="wf-link-action"
                          :class="{ 'wf-link-action--disabled': selectedUser?.userId === user.userId }"
                          :disabled="selectedUser?.userId === user.userId"
                          @click="selectUser(user)"
                        >
                          {{ selectedUser?.userId === user.userId ? '已选择' : '选择' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!searchResults.length">
                      <td colspan="4" class="wf-td wf-td--empty">暂无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-else>
              <div class="wf-form-row">
                <label class="wf-form-row__label">用户名</label>
                <span class="wf-form-row__text">{{ selectedUser?.username }}</span>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label">用户ID</label>
                <span class="wf-form-row__text">{{ selectedUser?.userId }}</span>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label">金刚号</label>
                <span class="wf-form-row__text">{{ selectedUser?.kingKongId }}</span>
              </div>
            </template>

            <div class="wf-form-row">
              <label class="wf-form-row__label">代理级别</label>
              <span class="wf-form-row__text">1级代理</span>
            </div>

            <section class="wf-share-agent-credit-panel">
              <h4 class="wf-share-agent-credit-panel__title">彩票退水</h4>
              <div class="wf-share-agent-rebate-list">
                <article class="wf-share-agent-rebate-cat">
                  <div class="wf-share-agent-rebate-cat__head">
                    <label class="wf-share-agent-rebate-cat__name">{{ lotteryCategory.name }}</label>
                    <div class="wf-share-agent-rebate-cat__control">
                      <div class="wf-share-agent-rebate-slider">
                        <input
                          :value="lotteryCategory.rebate"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          aria-label="彩票退水"
                          title="彩票退水滑块，区间 0-100%"
                          @input="onLotterySliderInput"
                        />
                        <span class="wf-share-agent-rebate-slider__value">{{ lotteryCategory.rebate }}%</span>
                      </div>
                      <p class="wf-share-agent-credit-field__range">区间 0-100%</p>
                    </div>
                  </div>
                  <div class="wf-share-agent-credit-grid">
                    <div
                      v-for="product in lotteryCategory.products"
                      :key="product.key"
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
                      <p v-if="lotteryProductError(product)" class="wf-share-agent-credit-field__error">
                        {{ lotteryProductError(product) }}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeAddModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">
              {{ modalMode === 'add' ? '确认' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.wf-form-row__text {
  font-size: 14px;
  color: var(--pc-text, #333);
  line-height: 32px;
}
</style>
