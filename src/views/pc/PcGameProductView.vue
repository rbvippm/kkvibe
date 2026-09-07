<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSearchSelect from '../../components/wireframe/WfSearchSelect.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  GAME_PRODUCT_CATALOG,
  GAME_PRODUCT_CHANNEL_OPTIONS,
  GAME_PRODUCT_CURRENCY_OPTIONS,
  GAME_PRODUCT_ICON_SLOTS,
  GAME_PRODUCT_LANG_OPTIONS,
  GAME_PRODUCT_MINI_PROGRAMS,
  GAME_PRODUCT_ORIENTATION_OPTIONS,
  formatGameProductModules,
  listAllGameModuleOptions,
  listGameModuleTabs,
  cloneGameProductRow,
  createEmptyGameProductRow,
  createGameProductId,
  gameProductCatalogLabel,
  gameProductChannelLabels,
  gameProductCurrencyLabel,
  gameProductDisplayName,
  gameProductLangLabel,
  gameProductLangShort,
  gameProductMiniProgramLabel,
  gameProductOrientationLabel,
  gameProductStore,
  type GameProductCurrency,
  type GameProductLang,
  type GameProductOrientation,
  type GameProductRow,
} from '../../constants/gameProduct'
import { ANCHOR_CHANNEL_PAGE_SIZE, filterAnchorChannels } from '../../constants/liveAnchorMetric'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  miniProgram: string
  moduleId: string
  lang: '' | GameProductLang
  currency: '' | GameProductCurrency
  orientation: '' | GameProductOrientation
}

type ModalMode = 'add' | 'edit'

const defaultFilter = (): ListFilter => ({
  channel: '',
  miniProgram: '',
  moduleId: '',
  lang: '',
  currency: '',
  orientation: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const form = ref<GameProductRow>(createEmptyGameProductRow())
const formHint = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const deleteVisible = ref(false)
const deleteRow = ref<GameProductRow | null>(null)
const authVisible = ref(false)
const authRowId = ref<string | null>(null)
const authKeyword = ref('')
const authAppliedKeyword = ref('')
const authDraftIds = ref<string[]>([])
const authPage = ref(1)
const authHint = ref('')

const modalTitle = computed(() => (modalMode.value === 'add' ? '新增' : '编辑'))
const nextSort = computed(() => Math.max(0, ...gameProductStore.value.map((row) => row.sort)) + 1)
const catalogOptions = computed(() => GAME_PRODUCT_CATALOG[form.value.miniProgram] ?? [])
const selectedLangs = computed(() =>
  GAME_PRODUCT_LANG_OPTIONS.filter((item) => form.value.languages.includes(item.value)),
)
const filteredRows = computed(() =>
  gameProductStore.value.filter(matchRow).sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id)),
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
const formAuthLabels = computed(() => gameProductChannelLabels(form.value.channelIds))
const authEditingRow = computed(() => {
  if (!authRowId.value) return null
  return gameProductStore.value.find((item) => item.id === authRowId.value) ?? null
})
const authLead = computed(() => {
  const row = authEditingRow.value
  if (row) return `${gameProductDisplayName(row)}（${row.id}）`
  if (modalVisible.value) {
    const name = gameProductDisplayName(form.value)
    if (form.value.id) return `${name}（${form.value.id}）`
    return name && name !== '-' ? name : '新增产品'
  }
  return ''
})

function matchRow(row: GameProductRow) {
  const f = appliedFilter.value
  if (f.channel && !row.channelIds.includes(f.channel)) return false
  if (f.miniProgram && row.miniProgram !== f.miniProgram) return false
  if (f.moduleId && !row.moduleIds.includes(f.moduleId)) return false
  if (f.lang && !row.languages.includes(f.lang)) return false
  if (f.currency && !row.currencies.includes(f.currency)) return false
  if (f.orientation && row.orientation !== f.orientation) return false
  return true
}

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function toggleCurrency(value: GameProductCurrency) {
  const list = form.value.currencies
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleLanguage(value: GameProductLang) {
  const list = form.value.languages
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleFormModule(id: string) {
  const list = form.value.moduleIds
  const idx = list.indexOf(id)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(id)
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = createEmptyGameProductRow(nextSort.value)
  formHint.value = ''
  modalVisible.value = true
}

function openEdit(row: GameProductRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = cloneGameProductRow(row)
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  closeChannelAuth()
}

function openChannelAuth(row?: GameProductRow) {
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
    const idx = gameProductStore.value.findIndex((item) => item.id === authRowId.value)
    if (idx >= 0) {
      gameProductStore.value[idx].channelIds = ids
      showPcToast(`已更新「${gameProductDisplayName(gameProductStore.value[idx])}」的授权渠道`)
    }
  } else {
    form.value.channelIds = ids
    if (formHint.value === '请至少授权 1 个渠道') formHint.value = ''
  }
  closeChannelAuth()
}

function onMiniProgramChange() {
  form.value.product = ''
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const ok = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)
  if (!ok) {
    formHint.value = '仅支持 jpg、png、webp'
    input.value = ''
    return
  }
  form.value.iconUrl = URL.createObjectURL(file)
  form.value.iconFileName = file.name
  formHint.value = ''
  input.value = ''
}

function validateForm() {
  if (!form.value.channelIds.length) return '请至少授权 1 个渠道'
  if (!form.value.moduleIds.length) return '请至少选择 1 个所属模块'
  if (!form.value.currencies.length) return '请至少选择 1 个支持币种'
  if (!form.value.languages.length) return '请至少选择 1 个支持语种'
  for (const lang of form.value.languages) {
    if (!form.value.names[lang]?.trim()) return `请输入名称（${gameProductLangLabel(lang)}）`
  }
  if (!form.value.miniProgram) return '请选择小程序'
  const sort = Number(form.value.sort)
  if (!Number.isInteger(sort) || sort < 1) return '排序须为正整数'
  return ''
}

function saveForm() {
  const error = validateForm()
  if (error) {
    formHint.value = error
    return
  }
  const payload = cloneGameProductRow(form.value)
  payload.sort = Number(payload.sort)
  if (modalMode.value === 'add') {
    payload.id = createGameProductId()
    gameProductStore.value.unshift(payload)
    showPcToast(`已新增产品「${gameProductDisplayName(payload)}」`)
  } else if (editingId.value) {
    const idx = gameProductStore.value.findIndex((item) => item.id === editingId.value)
    if (idx >= 0) gameProductStore.value[idx] = payload
    showPcToast(`已保存产品「${gameProductDisplayName(payload)}」`)
  }
  closeModal()
}

function toggleEnabled(row: GameProductRow) {
  row.enabled = !row.enabled
  showPcToast(`已${row.enabled ? '启用' : '禁用'}「${gameProductDisplayName(row)}」`)
}

function openDelete(row: GameProductRow) {
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
  gameProductStore.value = gameProductStore.value.filter((item) => item.id !== row.id)
  showPcToast(`已删除「${gameProductDisplayName(row)}」`)
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
      <h1 class="gpp-title">通用产品管理</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">渠道：</label>
        <WfSearchSelect
          v-model="filter.channel"
          :options="GAME_PRODUCT_CHANNEL_OPTIONS"
          empty-label="全部"
        />

        <label class="wf-label">小程序：</label>
        <select v-model="filter.miniProgram" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in GAME_PRODUCT_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">所属模块：</label>
        <select v-model="filter.moduleId" class="wf-input wf-input--select">
          <option value="">请选择</option>
          <option v-for="opt in listGameModuleTabs()" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">语种：</label>
        <select v-model="filter.lang" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in GAME_PRODUCT_LANG_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in GAME_PRODUCT_CURRENCY_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">横/竖/半屏：</label>
        <select v-model="filter.orientation" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in GAME_PRODUCT_ORIENTATION_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openAdd">新增</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">产品ID</th>
              <th class="wf-th">渠道</th>
              <th class="wf-th">所属模块</th>
              <th class="wf-th">小程序</th>
              <th class="wf-th">产品</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">语种</th>
              <th class="wf-th">横/竖/半屏</th>
              <th class="wf-th">排序</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="11" class="wf-td wf-td--empty">暂无产品配置</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td wf-td--nowrap">{{ row.id }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openChannelAuth(row)">
                  {{ row.channelIds.length }}
                </button>
              </td>
              <td class="wf-td">{{ formatGameProductModules(row.moduleIds) }}</td>
              <td class="wf-td">{{ gameProductMiniProgramLabel(row.miniProgram) }}</td>
              <td class="wf-td">{{ gameProductCatalogLabel(row.miniProgram, row.product) }}</td>
              <td class="wf-td">
                <span
                  v-for="item in row.currencies"
                  :key="`${row.id}-${item}`"
                  class="gpp-tag"
                >
                  {{ gameProductCurrencyLabel(item) }}
                </span>
              </td>
              <td class="wf-td">
                <span
                  v-for="item in row.languages"
                  :key="`${row.id}-${item}`"
                  class="gpp-tag"
                >
                  {{ gameProductLangShort(item) }}
                </span>
              </td>
              <td class="wf-td">{{ gameProductOrientationLabel(row.orientation) }}</td>
              <td class="wf-td wf-td--center">{{ row.sort }}</td>
              <td class="wf-td wf-td--center">
                <button
                  type="button"
                  class="gpp-switch"
                  :class="{ 'gpp-switch--on': row.enabled }"
                  role="switch"
                  :aria-checked="row.enabled"
                  @click="toggleEnabled(row)"
                >
                  <span class="gpp-switch__knob" />
                </button>
              </td>
              <td class="wf-td wf-td--actions wf-td--center">
                <button type="button" class="wf-link-action" @click="openEdit(row)">编辑</button>
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
          class="wf-modal wf-modal--scroll gpp-form-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalMode === 'add' ? 'gpp-add-title' : 'gpp-edit-title'"
        >
          <div class="wf-modal__header">
            <h3
              :id="modalMode === 'add' ? 'gpp-add-title' : 'gpp-edit-title'"
              class="wf-modal__title"
            >
              {{ modalTitle }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-form-row gpp-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">所属模块</span>
              <div class="gpp-checks">
                <label v-for="opt in listAllGameModuleOptions()" :key="opt.value" class="gpp-check">
                  <input
                    type="checkbox"
                    :checked="form.moduleIds.includes(opt.value)"
                    @change="toggleFormModule(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="wf-form-row gpp-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持币种</span>
              <div class="gpp-checks">
                <label v-for="opt in GAME_PRODUCT_CURRENCY_OPTIONS" :key="opt.value" class="gpp-check">
                  <input
                    type="checkbox"
                    :checked="form.currencies.includes(opt.value)"
                    @change="toggleCurrency(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="wf-form-row gpp-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持语种</span>
              <div class="gpp-checks">
                <label v-for="opt in GAME_PRODUCT_LANG_OPTIONS" :key="opt.value" class="gpp-check">
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
              class="wf-form-row gpp-form-row"
            >
              <label class="wf-form-row__label" :for="`gpp-name-${lang.value}`">
                名称（{{ lang.label }}）
              </label>
              <input
                :id="`gpp-name-${lang.value}`"
                v-model="form.names[lang.value]"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入名称"
              />
            </div>

            <div class="wf-form-row gpp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="gpp-mini">小程序</label>
              <select
                id="gpp-mini"
                v-model="form.miniProgram"
                class="wf-select wf-select--full"
                @change="onMiniProgramChange"
              >
                <option value="">请选择小程序</option>
                <option v-for="opt in GAME_PRODUCT_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row gpp-form-row">
              <label class="wf-form-row__label" for="gpp-orientation">横竖半屏</label>
              <select id="gpp-orientation" v-model="form.orientation" class="wf-select wf-select--full">
                <option
                  v-for="opt in GAME_PRODUCT_ORIENTATION_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row gpp-form-row">
              <label class="wf-form-row__label" for="gpp-product">产品</label>
              <select
                id="gpp-product"
                v-model="form.product"
                class="wf-select wf-select--full"
                :disabled="!form.miniProgram"
              >
                <option value="">请选择产品</option>
                <option v-for="opt in catalogOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row gpp-form-row">
              <label class="wf-form-row__label" for="gpp-suffix">后缀地址</label>
              <input
                id="gpp-suffix"
                v-model="form.suffix"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入后缀地址"
              />
            </div>

            <div class="wf-form-row gpp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="gpp-sort">排序</label>
              <input
                id="gpp-sort"
                v-model.number="form.sort"
                type="number"
                min="1"
                class="wf-input wf-input--full"
              />
            </div>

            <div class="wf-form-row gpp-form-row">
              <span class="wf-form-row__label">状态</span>
              <button
                type="button"
                class="gpp-switch"
                :class="{ 'gpp-switch--on': form.enabled }"
                role="switch"
                :aria-checked="form.enabled"
                @click="form.enabled = !form.enabled"
              >
                <span class="gpp-switch__knob" />
              </button>
            </div>

            <div class="wf-form-row gpp-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">渠道</span>
              <div class="gpp-auth">
                <button type="button" class="wf-link-action" @click="openChannelAuth()">点击授权</button>
                <p v-if="formAuthLabels.length" class="gpp-auth__names">
                  已授权 {{ formAuthLabels.length }} 个渠道：{{ joinLabels(formAuthLabels) }}
                </p>
                <p v-else class="wf-muted">尚未授权渠道</p>
              </div>
            </div>

            <div class="wf-form-row gpp-form-row gpp-form-row--bottom">
              <span class="wf-form-row__label">icon</span>
              <div class="gpp-icon">
                <button type="button" class="gpp-upload" @click="triggerUpload">
                  <img
                    v-if="form.iconUrl"
                    :src="form.iconUrl"
                    alt="产品 icon"
                    class="gpp-upload__preview"
                  />
                  <span v-else class="gpp-upload__placeholder">点击上传icon图</span>
                </button>
                <div class="gpp-icon__meta">
                  <p class="gpp-icon__slots-label">当前展示位置</p>
                  <div class="gpp-icon__slots">
                    <span
                      v-for="slot in GAME_PRODUCT_ICON_SLOTS"
                      :key="slot.value"
                      class="gpp-tag"
                    >
                      {{ slot.label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="gpp-file-input"
              @change="onFileChange"
            />
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="saveForm">保存</button>
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
          class="wf-modal wf-modal--scroll gpp-auth-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gpp-auth-title"
        >
          <div class="wf-modal__header">
            <h3 id="gpp-auth-title" class="wf-modal__title">授权渠道</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeChannelAuth">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <p v-if="authLead" class="gpp-auth-lead">{{ authLead }}</p>
            <div class="wf-modal__query">
              <label class="wf-label" for="gpp-auth-keyword">渠道选择：</label>
              <input
                id="gpp-auth-keyword"
                v-model="authKeyword"
                type="text"
                class="wf-input"
                placeholder="请输入关键词"
                @keyup.enter="searchChannels"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="searchChannels">搜索</button>
            </div>

            <div class="gpp-auth-box">
              <div class="gpp-auth-box__bar">
                <label class="gpp-auth-check">
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

              <div v-if="authPageItems.length" class="gpp-auth-grid">
                <label v-for="item in authPageItems" :key="item.id" class="gpp-auth-check">
                  <input
                    type="checkbox"
                    :checked="isChannelChecked(item.id)"
                    @change="toggleChannel(item.id)"
                  />
                  {{ item.name }}
                </label>
              </div>
              <p v-else class="wf-td--empty gpp-auth-empty">暂无匹配渠道</p>
            </div>

            <div v-if="authFilteredList.length" class="wf-pagination gpp-auth-pages">
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
        <div class="wf-modal" role="dialog" aria-labelledby="gpp-delete-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="gpp-delete-title" class="wf-modal__title">确认删除</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDelete">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <p class="gpp-delete-msg">
              确定删除产品「{{ gameProductDisplayName(deleteRow) }}」吗？删除后不可恢复。
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
.gpp-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text);
}

.wf-td--nowrap {
  white-space: nowrap;
}

.gpp-tag {
  display: inline-block;
  margin: 0 6px 4px 0;
  padding: 0 8px;
  border-radius: 4px;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 22px;
}

.gpp-switch {
  position: relative;
  width: 44px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #bfbfbf;
  cursor: pointer;
}

.gpp-switch--on {
  background: #1677ff;
}

.gpp-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.gpp-switch--on .gpp-switch__knob {
  transform: translateX(22px);
}

.gpp-form-modal {
  width: min(920px, calc(100vw - 24px));
  max-width: min(920px, calc(100vw - 24px));
  max-height: 90vh;
}

.gpp-form-row {
  grid-template-columns: 140px 1fr;
}

.gpp-form-row--bottom {
  align-items: end;
}

.gpp-form-row--bottom .wf-form-row__label {
  padding-top: 0;
  padding-bottom: 4px;
}

.gpp-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 4px;
}

.gpp-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gpp-icon {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.gpp-icon__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.gpp-icon__slots-label {
  margin: 0;
  color: var(--pc-text);
  font-size: 13px;
  line-height: 1.5;
}

.gpp-icon__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.gpp-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 140px;
  height: 120px;
  padding: 8px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
}

.gpp-upload__placeholder {
  color: #999;
  font-size: 12px;
  text-align: center;
}

.gpp-upload__preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gpp-file-input {
  display: none;
}

.gpp-delete-msg {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pc-text);
  word-break: break-word;
}

.gpp-auth-lead {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--pc-text-secondary);
  word-break: break-word;
}

.gpp-auth {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-top: 4px;
}

.gpp-auth__names {
  margin: 0;
  color: var(--pc-text);
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.gpp-auth-modal {
  width: 640px;
}

.gpp-auth-box {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--pc-border-light);
}

.gpp-auth-box__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.gpp-auth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.gpp-auth-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pc-text);
  font-size: 14px;
  cursor: pointer;
}

.gpp-auth-empty {
  padding: 24px 0;
  text-align: center;
}

.gpp-auth-pages {
  height: auto;
  min-height: 56px;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
}
</style>
