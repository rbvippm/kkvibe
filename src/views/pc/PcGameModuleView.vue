<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  GAME_MODULE_CHANNEL_OPTIONS,
  GAME_MODULE_CURRENCY_OPTIONS,
  GAME_MODULE_LANG_OPTIONS,
  cloneGameModule,
  createEmptyGameModule,
  createGameModuleId,
  gameModuleChannelLabels,
  gameModuleCurrencyLabel,
  gameModuleDisplayName,
  gameModuleLangLabel,
  gameModuleName,
  gameModuleStore,
  type GameModuleCurrency,
  type GameModuleLang,
  type GameModuleRow,
} from '../../constants/gameModule'
import { ANCHOR_CHANNEL_PAGE_SIZE, filterAnchorChannels } from '../../constants/liveAnchorMetric'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  currency: '' | GameModuleCurrency
  lang: '' | GameModuleLang
}

type ModalMode = 'add' | 'edit'

const defaultFilter = (): ListFilter => ({ channel: '', currency: '', lang: '' })

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const form = ref<GameModuleRow>(createEmptyGameModule())
const formHint = ref('')
const deleteVisible = ref(false)
const deleteRow = ref<GameModuleRow | null>(null)
const authVisible = ref(false)
const authRowId = ref<string | null>(null)
const authKeyword = ref('')
const authAppliedKeyword = ref('')
const authDraftIds = ref<string[]>([])
const authPage = ref(1)
const authHint = ref('')

const modalTitle = computed(() => (modalMode.value === 'add' ? '新增' : '修改'))
const selectedLangs = computed(() =>
  GAME_MODULE_LANG_OPTIONS.filter((item) => form.value.languages.includes(item.value)),
)
const filteredRows = computed(() =>
  gameModuleStore.value.filter(matchRow).sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id)),
)

const authFilteredList = computed(() => filterAnchorChannels(authAppliedKeyword.value))
const authTotalPages = computed(() =>
  Math.max(1, Math.ceil(authFilteredList.value.length / ANCHOR_CHANNEL_PAGE_SIZE)),
)
const authPageItems = computed(() => {
  const start = (authPage.value - 1) * ANCHOR_CHANNEL_PAGE_SIZE
  return authFilteredList.value.slice(start, start + ANCHOR_CHANNEL_PAGE_SIZE)
})
const authPageIds = computed(() => authPageItems.value.map((item) => item.id))
const authSelectedCount = computed(() => authDraftIds.value.length)
const authPageAllSelected = computed(
  () => authPageIds.value.length > 0 && authPageIds.value.every((id) => authDraftIds.value.includes(id)),
)
const authPagePartialSelected = computed(
  () => !authPageAllSelected.value && authPageIds.value.some((id) => authDraftIds.value.includes(id)),
)
const authPageNumbers = computed(() =>
  Array.from({ length: authTotalPages.value }, (_, index) => index + 1),
)
const formAuthLabels = computed(() => gameModuleChannelLabels(form.value.channelIds))
const authEditingRow = computed(() => {
  if (!authRowId.value) return null
  return gameModuleStore.value.find((item) => item.id === authRowId.value) ?? null
})
const authLead = computed(() => {
  const row = authEditingRow.value
  if (row) return `${gameModuleDisplayName(row)}（${row.id}）`
  if (modalVisible.value) {
    const name = gameModuleDisplayName(form.value)
    return form.value.id ? `${name}（${form.value.id}）` : name
  }
  return ''
})

function matchRow(row: GameModuleRow) {
  const f = appliedFilter.value
  if (f.channel && !row.channelIds.includes(f.channel)) return false
  if (f.lang && !row.languages.includes(f.lang)) return false
  if (f.currency && !row.currencies.includes(f.currency)) return false
  return true
}

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function toggleCurrency(value: GameModuleCurrency) {
  const list = form.value.currencies
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleLanguage(value: GameModuleLang) {
  const list = form.value.languages
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = createEmptyGameModule(0)
  formHint.value = ''
  modalVisible.value = true
}

function openEdit(row: GameModuleRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = cloneGameModule(row)
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  closeChannelAuth()
}

function openChannelAuth(row?: GameModuleRow) {
  authKeyword.value = ''
  authAppliedKeyword.value = ''
  authPage.value = 1
  authHint.value = ''
  if (row) {
    authRowId.value = row.id
    authDraftIds.value = [...row.channelIds]
  } else {
    authRowId.value = null
    authDraftIds.value = [...form.value.channelIds]
  }
  authVisible.value = true
}

function closeChannelAuth() {
  authVisible.value = false
  authRowId.value = null
  authKeyword.value = ''
  authAppliedKeyword.value = ''
  authDraftIds.value = []
  authPage.value = 1
  authHint.value = ''
}

function searchChannels() {
  authAppliedKeyword.value = authKeyword.value
  authPage.value = 1
}

function isChannelChecked(id: string) {
  return authDraftIds.value.includes(id)
}

function toggleChannel(id: string) {
  const index = authDraftIds.value.indexOf(id)
  if (index >= 0) {
    authDraftIds.value = authDraftIds.value.filter((item) => item !== id)
    return
  }
  authDraftIds.value = [...authDraftIds.value, id]
}

function toggleChannelPageAll() {
  if (!authPageIds.value.length) return
  if (authPageAllSelected.value) {
    authDraftIds.value = authDraftIds.value.filter((id) => !authPageIds.value.includes(id))
    return
  }
  const next = new Set(authDraftIds.value)
  authPageIds.value.forEach((id) => next.add(id))
  authDraftIds.value = [...next]
}

function goAuthPage(page: number) {
  if (page < 1 || page > authTotalPages.value) return
  authPage.value = page
}

function confirmChannelAuth() {
  const ids = [...authDraftIds.value]
  if (authRowId.value) {
    const idx = gameModuleStore.value.findIndex((item) => item.id === authRowId.value)
    if (idx >= 0) {
      gameModuleStore.value[idx].channelIds = ids
      showPcToast(`已更新「${gameModuleDisplayName(gameModuleStore.value[idx])}」的授权渠道`)
    }
  } else {
    form.value.channelIds = ids
  }
  closeChannelAuth()
}

function validateForm() {
  if (!form.value.channelIds.length) return '请至少授权 1 个渠道'
  if (!form.value.currencies.length) return '请至少选择 1 个支持币种'
  if (!form.value.languages.length) return '请至少选择 1 个支持语种'
  for (const lang of selectedLangs.value) {
    if (!form.value.names[lang.value]?.trim()) return `请输入${lang.label}`
  }
  const sort = Number(form.value.sort)
  if (!Number.isInteger(sort) || sort < 0) return '排序须为不小于 0 的整数'
  return ''
}

function saveForm() {
  const error = validateForm()
  if (error) {
    formHint.value = error
    return
  }
  const payload = cloneGameModule(form.value)
  payload.sort = Number(payload.sort)
  if (modalMode.value === 'add') {
    payload.id = createGameModuleId()
    gameModuleStore.value.unshift(payload)
    showPcToast(`已新增模块「${gameModuleDisplayName(payload)}」`)
  } else if (editingId.value) {
    const idx = gameModuleStore.value.findIndex((item) => item.id === editingId.value)
    if (idx >= 0) gameModuleStore.value[idx] = payload
    showPcToast(`已保存模块「${gameModuleDisplayName(payload)}」`)
  }
  closeModal()
}

function toggleEnabled(row: GameModuleRow) {
  row.enabled = !row.enabled
  showPcToast(`已${row.enabled ? '启用' : '禁用'}「${gameModuleDisplayName(row)}」`)
}

function openDelete(row: GameModuleRow) {
  deleteRow.value = row
  deleteVisible.value = true
}

function closeDelete() {
  deleteVisible.value = false
  deleteRow.value = null
}

function confirmDelete() {
  const row = deleteRow.value
  if (!row) return
  gameModuleStore.value = gameModuleStore.value.filter((item) => item.id !== row.id)
  showPcToast(`已删除「${gameModuleDisplayName(row)}」`)
  closeDelete()
}

function joinLabels(items: string[]) {
  return items.join('、') || '—'
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="gm-title">通用模块管理</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label" for="gm-filter-channel">渠道：</label>
        <select id="gm-filter-channel" v-model="filter.channel" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in GAME_MODULE_CHANNEL_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label" for="gm-filter-currency">币种：</label>
        <select id="gm-filter-currency" v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">请选择币种</option>
          <option v-for="opt in GAME_MODULE_CURRENCY_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label" for="gm-filter-lang">语种：</label>
        <select id="gm-filter-lang" v-model="filter.lang" class="wf-input wf-input--select">
          <option value="">请选择语种</option>
          <option v-for="opt in GAME_MODULE_LANG_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openAdd">新增</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">模块ID</th>
              <th class="wf-th">渠道</th>
              <th class="wf-th">简体中文</th>
              <th class="wf-th">支持币种</th>
              <th class="wf-th">支持语种</th>
              <th class="wf-th">排序</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="8" class="wf-td wf-td--empty">暂无模块</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td wf-td--nowrap">{{ row.id }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openChannelAuth(row)">
                  {{ row.channelIds.length }}
                </button>
              </td>
              <td class="wf-td">{{ gameModuleName(row, 'zh') }}</td>
              <td class="wf-td">
                {{ joinLabels(row.currencies.map(gameModuleCurrencyLabel)) }}
              </td>
              <td class="wf-td">
                {{ joinLabels(row.languages.map(gameModuleLangLabel)) }}
              </td>
              <td class="wf-td wf-td--center">{{ row.sort }}</td>
              <td class="wf-td wf-td--center">
                <button
                  type="button"
                  class="gm-switch"
                  :class="{ 'gm-switch--on': row.enabled }"
                  role="switch"
                  :aria-checked="row.enabled"
                  @click="toggleEnabled(row)"
                >
                  <span class="gm-switch__knob" />
                </button>
              </td>
              <td class="wf-td wf-td--actions wf-td--center wf-td--nowrap">
                <button type="button" class="wf-link-action" @click="openEdit(row)">修改</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action wf-link-action--danger"
                  @click="openDelete(row)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span>共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="modalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeModal"
      >
        <div
          class="wf-modal wf-modal--scroll gm-form-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalMode === 'add' ? 'gm-add-title' : 'gm-edit-title'"
        >
          <div class="wf-modal__header">
            <h3
              :id="modalMode === 'add' ? 'gm-add-title' : 'gm-edit-title'"
              class="wf-modal__title"
            >
              {{ modalTitle }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-form-row gm-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持币种</span>
              <div class="gm-checks">
                <label v-for="opt in GAME_MODULE_CURRENCY_OPTIONS" :key="opt.value" class="gm-check">
                  <input
                    type="checkbox"
                    :checked="form.currencies.includes(opt.value)"
                    @change="toggleCurrency(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="wf-form-row gm-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持语种</span>
              <div class="gm-checks">
                <label v-for="opt in GAME_MODULE_LANG_OPTIONS" :key="opt.value" class="gm-check">
                  <input
                    type="checkbox"
                    :checked="form.languages.includes(opt.value)"
                    @change="toggleLanguage(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div
              v-for="lang in selectedLangs"
              :key="lang.value"
              class="wf-form-row gm-form-row"
            >
              <label
                class="wf-form-row__label wf-form-row__label--required"
                :for="`gm-name-${lang.value}`"
              >
                {{ lang.label }}
              </label>
              <input
                :id="`gm-name-${lang.value}`"
                v-model="form.names[lang.value]"
                type="text"
                class="wf-input wf-input--full"
                :placeholder="`请输入${lang.label}`"
              />
            </div>

            <div class="wf-form-row gm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="gm-sort">排序</label>
              <input
                id="gm-sort"
                v-model.number="form.sort"
                type="number"
                min="0"
                class="wf-input gm-sort-input"
              />
            </div>

            <div class="wf-form-row gm-form-row">
              <span class="wf-form-row__label">状态</span>
              <button
                type="button"
                class="gm-switch"
                :class="{ 'gm-switch--on': form.enabled }"
                role="switch"
                :aria-checked="form.enabled"
                @click="form.enabled = !form.enabled"
              >
                <span class="gm-switch__knob" />
              </button>
            </div>

            <div class="wf-form-row gm-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">渠道</span>
              <div class="gm-auth">
                <button type="button" class="wf-link-action" @click="openChannelAuth">点击授权</button>
                <p v-if="formAuthLabels.length" class="gm-auth__names">
                  已授权 {{ formAuthLabels.length }} 个渠道：{{ joinLabels(formAuthLabels) }}
                </p>
                <p v-else class="wf-muted">尚未授权渠道</p>
              </div>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
          </div>
          <div class="wf-modal__footer gm-footer">
            <button type="button" class="wf-btn wf-btn--primary" @click="saveForm">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="authVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeChannelAuth"
      >
        <div
          class="wf-modal wf-modal--scroll gm-auth-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gm-auth-title"
        >
          <div class="wf-modal__header">
            <h3 id="gm-auth-title" class="wf-modal__title">授权渠道</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeChannelAuth">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <p v-if="authLead" class="gm-auth-lead">{{ authLead }}</p>
            <div class="wf-modal__query">
              <label class="wf-label" for="gm-auth-keyword">渠道选择：</label>
              <input
                id="gm-auth-keyword"
                v-model="authKeyword"
                type="text"
                class="wf-input"
                placeholder="请输入关键词"
                @keyup.enter="searchChannels"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="searchChannels">搜索</button>
            </div>

            <div class="gm-auth-box">
              <div class="gm-auth-box__bar">
                <label class="gm-auth-check">
                  <input
                    type="checkbox"
                    :checked="authPageAllSelected"
                    :indeterminate="authPagePartialSelected"
                    :disabled="!authPageIds.length"
                    @change="toggleChannelPageAll"
                  />
                  全选
                </label>
                <span class="wf-muted">已选：{{ authSelectedCount }}</span>
              </div>

              <div v-if="authPageItems.length" class="gm-auth-grid">
                <label v-for="item in authPageItems" :key="item.id" class="gm-auth-check">
                  <input
                    type="checkbox"
                    :checked="isChannelChecked(item.id)"
                    @change="toggleChannel(item.id)"
                  />
                  {{ item.name }}
                </label>
              </div>
              <p v-else class="wf-td--empty gm-auth-empty">暂无匹配渠道</p>
            </div>

            <div v-if="authFilteredList.length" class="wf-pagination gm-auth-pages">
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="authPage <= 1"
                @click="goAuthPage(authPage - 1)"
              >
                上一页
              </button>
              <button
                v-for="page in authPageNumbers"
                :key="page"
                type="button"
                class="wf-btn"
                :class="page === authPage ? 'wf-btn--primary' : 'wf-btn--default'"
                @click="goAuthPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="authPage >= authTotalPages"
                @click="goAuthPage(authPage + 1)"
              >
                下一页
              </button>
            </div>

            <p v-if="authHint" class="wf-modal__hint">{{ authHint }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeChannelAuth">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmChannelAuth">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="deleteVisible && deleteRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDelete"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="gm-delete-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="gm-delete-title" class="wf-modal__title">确认删除</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDelete">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <p class="gm-delete-msg">
              确定删除模块「{{ gameModuleDisplayName(deleteRow) }}」吗？删除后不可恢复。
            </p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeDelete">取消</button>
            <button type="button" class="wf-btn wf-btn--danger" @click="confirmDelete">确定删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gm-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text);
}

.wf-td--nowrap {
  white-space: nowrap;
}

.gm-switch {
  position: relative;
  width: 44px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #bfbfbf;
  cursor: pointer;
}

.gm-switch--on {
  background: #1677ff;
}

.gm-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.gm-switch--on .gm-switch__knob {
  transform: translateX(22px);
}

.gm-form-row {
  grid-template-columns: 120px 1fr;
}

.gm-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 4px;
}

.gm-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gm-sort-input {
  width: 120px;
}

.gm-form-modal {
  width: min(920px, 92vw);
  max-width: min(920px, 92vw);
  max-height: 82vh;
}

.gm-footer {
  justify-content: center;
}

.gm-delete-msg {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pc-text);
  word-break: break-word;
}

.gm-auth-lead {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--pc-text-secondary);
  word-break: break-word;
}

.gm-auth {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-top: 4px;
}

.gm-auth__names {
  margin: 0;
  color: var(--pc-text);
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.gm-auth-modal {
  width: 640px;
}

.gm-auth-box {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--pc-border-light);
}

.gm-auth-box__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.gm-auth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.gm-auth-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pc-text);
  font-size: 14px;
  cursor: pointer;
}

.gm-auth-empty {
  padding: 24px 0;
  text-align: center;
}

.gm-auth-pages {
  height: auto;
  min-height: 56px;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
}
</style>
