<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSearchSelect from '../../components/wireframe/WfSearchSelect.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import { ANCHOR_CHANNEL_PAGE_SIZE, filterAnchorChannels } from '../../constants/liveAnchorMetric'
import {
  VIP_HALL_CHANNEL_OPTIONS,
  VIP_HALL_CURRENCY_OPTIONS,
  VIP_HALL_LANG_OPTIONS,
  VIP_HALL_MINI_PROGRAMS,
  VIP_HALL_PRODUCT_CATALOG,
  applyProductTypeFromModule,
  cloneProductRow,
  createEmptyProductRow,
  createVipHallProductId,
  displayZhName,
  moduleNameById,
  moduleTypeById,
  productDisplayName,
  vipHallChannelLabels,
  vipHallCurrencyLabel,
  vipHallLangLabel,
  vipHallModuleStore,
  vipHallProductStore,
  vipHallProductTypeLabel,
  type VipHallAssetPair,
  type VipHallCurrency,
  type VipHallLang,
  type VipHallProductRow,
} from '../../constants/vipHallManage'
import { VIP_HALL_PRODUCT_ANNOT_MAP } from '../../constants/vipHallProductSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  miniProgram: string
  moduleId: string
  lang: '' | VipHallLang
  currency: '' | VipHallCurrency
}

type ModalMode = 'add' | 'edit' | 'detail'

const defaultFilter = (): ListFilter => ({
  channel: '',
  miniProgram: '',
  moduleId: '',
  lang: '',
  currency: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const actionHint = ref('')
const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const form = ref<VipHallProductRow>(createEmptyProductRow())
const formHint = ref('')
const uploadKind = ref<{ field: 'listImage'; side: 'mobile' | 'pc' } | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const authVisible = ref(false)
const authRowId = ref<string | null>(null)
const authKeyword = ref('')
const authAppliedKeyword = ref('')
const authDraftIds = ref<string[]>([])
const authPage = ref(1)

const filterAnnot = VIP_HALL_PRODUCT_ANNOT_MAP.filter
const addAnnot = VIP_HALL_PRODUCT_ANNOT_MAP.addButton
const listAnnot = VIP_HALL_PRODUCT_ANNOT_MAP.list
const modalAnnot = VIP_HALL_PRODUCT_ANNOT_MAP.modal
const channelAuthAnnot = VIP_HALL_PRODUCT_ANNOT_MAP.channelAuth

const readonly = computed(() => modalMode.value === 'detail')
const modalTitle = computed(() =>
  modalMode.value === 'add' ? '新增' : modalMode.value === 'edit' ? '编辑' : '查看详情',
)
const nextSort = computed(() => Math.max(0, ...vipHallProductStore.value.map((row) => row.sort)) + 1)
const catalogOptions = computed(() => VIP_HALL_PRODUCT_CATALOG[form.value.miniProgram] ?? [])
const selectedLangs = computed(() =>
  VIP_HALL_LANG_OPTIONS.filter((item) => form.value.languages.includes(item.value)),
)
const filteredRows = computed(() =>
  vipHallProductStore.value.filter(matchRow).sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id)),
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
const authPageAllSelected = computed(
  () => authPageIds.value.length > 0 && authPageIds.value.every((id) => authDraftIds.value.includes(id)),
)
const authPagePartialSelected = computed(
  () => !authPageAllSelected.value && authPageIds.value.some((id) => authDraftIds.value.includes(id)),
)
const authPageNumbers = computed(() =>
  Array.from({ length: authTotalPages.value }, (_, index) => index + 1),
)
const formAuthLabels = computed(() => vipHallChannelLabels(form.value.channelIds))
const authLead = computed(() => {
  const row = authRowId.value ? vipHallProductStore.value.find((item) => item.id === authRowId.value) : null
  const name = productDisplayName(row ?? form.value)
  return name === '-' ? '新增产品' : name
})

function matchRow(row: VipHallProductRow) {
  const f = appliedFilter.value
  if (f.channel && !row.channelIds.includes(f.channel)) return false
  if (f.miniProgram && row.miniProgram !== f.miniProgram) return false
  if (f.moduleId && row.moduleId !== f.moduleId) return false
  if (f.lang && !row.languages.includes(f.lang)) return false
  if (f.currency && !row.currencies.includes(f.currency)) return false
  return true
}

function applyFilter() {
  appliedFilter.value = { ...filter.value }
  actionHint.value = ''
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  actionHint.value = ''
}

function toggleCurrency(value: VipHallCurrency) {
  if (readonly.value) return
  const list = form.value.currencies
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleLanguage(value: VipHallLang) {
  if (readonly.value) return
  const list = form.value.languages
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = createEmptyProductRow(nextSort.value)
  formHint.value = ''
  modalVisible.value = true
}

function openEdit(row: VipHallProductRow, mode: 'edit' | 'detail') {
  modalMode.value = mode
  editingId.value = row.id
  form.value = cloneProductRow(row)
  applyProductTypeFromModule(form.value, moduleTypeById(vipHallModuleStore.value, form.value.moduleId))
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  closeChannelAuth()
}

function openChannelAuth(row?: VipHallProductRow) {
  authKeyword.value = ''
  authAppliedKeyword.value = ''
  authPage.value = 1
  authRowId.value = row?.id ?? null
  authDraftIds.value = [...(row ?? form.value).channelIds]
  authVisible.value = true
}

function closeChannelAuth() {
  authVisible.value = false
  authRowId.value = null
  authKeyword.value = ''
  authAppliedKeyword.value = ''
  authDraftIds.value = []
  authPage.value = 1
}

function searchChannels() {
  authAppliedKeyword.value = authKeyword.value
  authPage.value = 1
}

function toggleChannel(id: string) {
  authDraftIds.value = authDraftIds.value.includes(id)
    ? authDraftIds.value.filter((item) => item !== id)
    : [...authDraftIds.value, id]
}

function toggleChannelPageAll() {
  if (!authPageIds.value.length) return
  if (authPageAllSelected.value) {
    authDraftIds.value = authDraftIds.value.filter((id) => !authPageIds.value.includes(id))
    return
  }
  authDraftIds.value = [...new Set([...authDraftIds.value, ...authPageIds.value])]
}

function goAuthPage(page: number) {
  if (page < 1 || page > authTotalPages.value) return
  authPage.value = page
}

function confirmChannelAuth() {
  const ids = [...authDraftIds.value]
  if (authRowId.value) {
    const row = vipHallProductStore.value.find((item) => item.id === authRowId.value)
    if (row) {
      row.channelIds = ids
      showPcToast(`已更新「${productDisplayName(row)}」的授权渠道`)
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

function onModuleChange() {
  applyProductTypeFromModule(form.value, moduleTypeById(vipHallModuleStore.value, form.value.moduleId))
}

function triggerUpload(field: 'listImage', side: 'mobile' | 'pc') {
  if (readonly.value) return
  uploadKind.value = { field, side }
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const kind = uploadKind.value
  if (!file || !kind) {
    input.value = ''
    return
  }
  const ok = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)
  if (!ok) {
    formHint.value = '仅支持格式为 jpg、png、webp'
    input.value = ''
    return
  }
  const target: VipHallAssetPair = form.value[kind.field]
  const url = URL.createObjectURL(file)
  if (kind.side === 'mobile') {
    target.mobileUrl = url
    target.mobileFileName = file.name
  } else {
    target.pcUrl = url
    target.pcFileName = file.name
  }
  formHint.value = ''
  uploadKind.value = null
  input.value = ''
}

function validateForm() {
  if (!form.value.moduleId) return '请选择所属模块'
  if (!form.value.currencies.length) return '请至少选择 1 个支持币种'
  if (!form.value.languages.length) return '请至少选择 1 个支持语种'
  for (const lang of form.value.languages) {
    if (!form.value.names[lang]?.trim()) return `请输入名称（${vipHallLangLabel(lang)}）`
    if (!form.value.descriptions[lang]?.trim()) return `请输入描述（${vipHallLangLabel(lang)}）`
  }
  if (form.value.type === 'game') {
    if (!form.value.miniProgram) return '请选择小程序'
    if (!form.value.product) return '请选择产品'
  } else if (!form.value.jumpUrl.trim()) {
    return '请输入跳转地址'
  }
  if (!form.value.listImage.mobileUrl || !form.value.listImage.pcUrl) {
    return '请上传移动端与 PC 端 icon'
  }
  const sort = Number(form.value.sort)
  if (!Number.isInteger(sort) || sort < 1) return '排序须为正整数'
  if (!form.value.channelIds.length) return '请至少授权 1 个渠道'
  return ''
}

function confirmModal() {
  const error = validateForm()
  if (error) {
    formHint.value = error
    return
  }
  const payload = cloneProductRow(form.value)
  payload.sort = Number(payload.sort)
  if (modalMode.value === 'add') {
    payload.id = createVipHallProductId()
    vipHallProductStore.value.unshift(payload)
    actionHint.value = `已新增产品「${productDisplayName(payload)}」`
  } else if (editingId.value) {
    const idx = vipHallProductStore.value.findIndex((item) => item.id === editingId.value)
    if (idx >= 0) vipHallProductStore.value[idx] = payload
    actionHint.value = `已保存产品「${productDisplayName(payload)}」`
  }
  closeModal()
}

function toggleEnabled(row: VipHallProductRow) {
  row.enabled = !row.enabled
  actionHint.value = `已${row.enabled ? '启用' : '禁用'}「${productDisplayName(row)}」`
}

function removeRow(row: VipHallProductRow) {
  if (!window.confirm(`确定删除产品「${productDisplayName(row)}」吗？`)) return
  vipHallProductStore.value = vipHallProductStore.value.filter((item) => item.id !== row.id)
  actionHint.value = `已删除「${productDisplayName(row)}」`
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="vhp-title">产品管理</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          渠道：
          <WfSpecAnnot
            :no="filterAnnot.no"
            :title="filterAnnot.title"
            :items="[...filterAnnot.items]"
            placement="bottom"
          />
        </label>
        <WfSearchSelect
          v-model="filter.channel"
          :options="VIP_HALL_CHANNEL_OPTIONS"
          empty-label="全部"
        />

        <label class="wf-label">小程序：</label>
        <select v-model="filter.miniProgram" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in VIP_HALL_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">所属模块：</label>
        <select v-model="filter.moduleId" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in vipHallModuleStore" :key="opt.id" :value="opt.id">
            {{ displayZhName(opt.names) }}
          </option>
        </select>

        <label class="wf-label">语种：</label>
        <select v-model="filter.lang" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in VIP_HALL_LANG_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in VIP_HALL_CURRENCY_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openAdd">+ 新增</button>
          <WfSpecAnnot :no="addAnnot.no" :title="addAnnot.title" :items="[...addAnnot.items]" />
        </span>
        <p v-if="actionHint" class="wf-modal__hint">{{ actionHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <div class="vhp-list-head">
          <WfSpecAnnot :no="listAnnot.no" :title="listAnnot.title" :items="[...listAnnot.items]" />
        </div>
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">产品ID</th>
              <th class="wf-th">渠道</th>
              <th class="wf-th">所属模块</th>
              <th class="wf-th">产品</th>
              <th class="wf-th">类型</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">语种</th>
              <th class="wf-th">排序</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="10" class="wf-td wf-td--empty">暂无产品数据</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td vhp-td--nowrap">{{ row.id }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openChannelAuth(row)">
                  {{ row.channelIds.length }}
                </button>
              </td>
              <td class="wf-td">{{ moduleNameById(vipHallModuleStore, row.moduleId) }}</td>
              <td class="wf-td">{{ productDisplayName(row) }}</td>
              <td class="wf-td">{{ vipHallProductTypeLabel(moduleTypeById(vipHallModuleStore, row.moduleId) || row.type) }}</td>
              <td class="wf-td">
                <span v-for="item in row.currencies" :key="`${row.id}-${item}`" class="vhp-tag">
                  {{ vipHallCurrencyLabel(item) }}
                </span>
              </td>
              <td class="wf-td">
                <span v-for="item in row.languages" :key="`${row.id}-${item}`" class="vhp-tag">
                  {{ vipHallLangLabel(item) }}
                </span>
              </td>
              <td class="wf-td wf-td--center">{{ row.sort }}</td>
              <td class="wf-td wf-td--center">
                <button
                  type="button"
                  class="vhp-switch"
                  :class="{ 'vhp-switch--on': row.enabled }"
                  role="switch"
                  :aria-checked="row.enabled"
                  @click="toggleEnabled(row)"
                >
                  <span class="vhp-switch__knob" />
                </button>
              </td>
              <td class="wf-td wf-td--actions">
                <button type="button" class="wf-link-action" @click="openEdit(row, 'detail')">查看详情</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="openEdit(row, 'edit')">编辑</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action wf-link-action--danger" @click="removeRow(row)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="wf-pagination">
        <span class="wf-muted">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="modalVisible" class="wf-modal-mask" @click.self="closeModal">
        <div class="wf-modal wf-modal--scroll vhp-modal" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title wf-modal__title--with-spec">
              {{ modalTitle }}
              <WfSpecAnnot :no="modalAnnot.no" :title="modalAnnot.title" :items="[...modalAnnot.items]" />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </header>
          <div class="wf-modal__body">
            <div class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">所属模块</label>
              <select
                v-model="form.moduleId"
                class="wf-select wf-select--full"
                :disabled="readonly"
                @change="onModuleChange"
              >
                <option value="">请选择所属模块</option>
                <option v-for="opt in vipHallModuleStore" :key="opt.id" :value="opt.id">
                  {{ displayZhName(opt.names) }}
                </option>
              </select>
            </div>

            <div v-if="form.moduleId" class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label">类型</label>
              <input
                class="wf-input wf-input--full"
                :value="vipHallProductTypeLabel(form.type)"
                disabled
              />
            </div>

            <div class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">支持币种</label>
              <div class="vhp-checks">
                <label v-for="opt in VIP_HALL_CURRENCY_OPTIONS" :key="opt.value" class="vhp-check">
                  <input
                    type="checkbox"
                    :checked="form.currencies.includes(opt.value)"
                    :disabled="readonly"
                    @change="toggleCurrency(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">支持语种</label>
              <div class="vhp-checks">
                <label v-for="opt in VIP_HALL_LANG_OPTIONS" :key="opt.value" class="vhp-check">
                  <input
                    type="checkbox"
                    :checked="form.languages.includes(opt.value)"
                    :disabled="readonly"
                    @change="toggleLanguage(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <template v-for="lang in selectedLangs" :key="lang.value">
              <div class="wf-form-row vhp-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">名称（{{ lang.label }}）</label>
                <input
                  v-model="form.names[lang.value]"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入名称"
                  :disabled="readonly"
                />
              </div>
              <div class="wf-form-row vhp-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">描述（{{ lang.label }}）</label>
                <input
                  v-model="form.descriptions[lang.value]"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入描述"
                  :disabled="readonly"
                />
              </div>
            </template>

            <template v-if="form.moduleId && form.type === 'game'">
              <div class="wf-form-row vhp-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">小程序</label>
                <select
                  v-model="form.miniProgram"
                  class="wf-select wf-select--full"
                  :disabled="readonly"
                  @change="onMiniProgramChange"
                >
                  <option value="">请选择小程序</option>
                  <option v-for="opt in VIP_HALL_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="wf-form-row vhp-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">产品</label>
                <select
                  v-model="form.product"
                  class="wf-select wf-select--full"
                  :disabled="readonly || !form.miniProgram"
                >
                  <option value="">请选择产品</option>
                  <option v-for="opt in catalogOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="wf-form-row vhp-form-row">
                <label class="wf-form-row__label">后缀地址</label>
                <input
                  v-model="form.suffix"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入后缀地址"
                  :disabled="readonly"
                />
              </div>
            </template>

            <div v-else-if="form.moduleId && form.type === 'hall'" class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">跳转地址</label>
              <input
                v-model="form.jumpUrl"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入跳转地址"
                :disabled="readonly"
              />
            </div>

            <div class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">icon</label>
              <div class="vhp-asset-pair">
                <div>
                  <p class="vhp-asset-pair__label">移动端</p>
                  <button type="button" class="vhp-upload" :disabled="readonly" @click="triggerUpload('listImage', 'mobile')">
                    <img v-if="form.listImage.mobileUrl" :src="form.listImage.mobileUrl" alt="移动端 icon" class="vhp-upload__preview" />
                    <span v-else class="vhp-upload__placeholder">点击上传图标图</span>
                  </button>
                </div>
                <div>
                  <p class="vhp-asset-pair__label">PC端</p>
                  <button type="button" class="vhp-upload" :disabled="readonly" @click="triggerUpload('listImage', 'pc')">
                    <img v-if="form.listImage.pcUrl" :src="form.listImage.pcUrl" alt="PC icon" class="vhp-upload__preview" />
                    <span v-else class="vhp-upload__placeholder">点击上传图标图</span>
                  </button>
                </div>
                <p class="wf-form-row__hint vhp-asset-pair__hint">仅支持格式为 jpg、png、webp</p>
              </div>
            </div>

            <div class="wf-form-row vhp-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">排序</label>
              <input v-model.number="form.sort" type="number" min="1" class="wf-input wf-input--full" :disabled="readonly" />
            </div>

            <div class="wf-form-row vhp-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">渠道</span>
              <div class="vhp-auth">
                <button v-if="!readonly" type="button" class="wf-link-action" @click="openChannelAuth()">
                  点击授权
                </button>
                <p v-if="formAuthLabels.length" class="vhp-auth__names">
                  已授权 {{ formAuthLabels.length }} 个渠道：{{ formAuthLabels.join('、') }}
                </p>
                <p v-else class="wf-muted">尚未授权渠道</p>
              </div>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
            <input ref="fileInputRef" type="file" accept="image/*" class="vhp-file-input" @change="onFileChange" />
          </div>
          <div class="wf-modal__footer vhp-modal__footer">
            <button v-if="readonly" type="button" class="wf-btn wf-btn--default" @click="closeModal">关闭</button>
            <template v-else>
              <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">保存</button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="authVisible" class="wf-modal-mask" role="presentation" @click.self="closeChannelAuth">
        <div class="wf-modal wf-modal--scroll vhp-auth-modal" role="dialog" aria-modal="true" aria-labelledby="vhp-auth-title">
          <header class="wf-modal__header">
            <h3 id="vhp-auth-title" class="wf-modal__title wf-modal__title--with-spec">
              授权渠道
              <WfSpecAnnot
                :no="channelAuthAnnot.no"
                :title="channelAuthAnnot.title"
                :items="[...channelAuthAnnot.items]"
              />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeChannelAuth">×</button>
          </header>
          <div class="wf-modal__body">
            <p class="vhp-auth-lead">{{ authLead }}</p>
            <div class="wf-modal__query">
              <label class="wf-label" for="vhp-auth-keyword">渠道选择：</label>
              <input
                id="vhp-auth-keyword"
                v-model="authKeyword"
                type="text"
                class="wf-input"
                placeholder="请输入关键词"
                @keyup.enter="searchChannels"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="searchChannels">搜索</button>
            </div>

            <div class="vhp-auth-box">
              <div class="vhp-auth-box__bar">
                <label class="vhp-check">
                  <input
                    type="checkbox"
                    :checked="authPageAllSelected"
                    :indeterminate="authPagePartialSelected"
                    :disabled="!authPageIds.length"
                    @change="toggleChannelPageAll"
                  />
                  全选
                </label>
                <span class="wf-muted">已选：{{ authDraftIds.length }}</span>
              </div>
              <div v-if="authPageItems.length" class="vhp-auth-grid">
                <label v-for="item in authPageItems" :key="item.id" class="vhp-check">
                  <input
                    type="checkbox"
                    :checked="authDraftIds.includes(item.id)"
                    @change="toggleChannel(item.id)"
                  />
                  {{ item.name }}
                </label>
              </div>
              <p v-else class="wf-td--empty vhp-auth-empty">暂无匹配渠道</p>
            </div>

            <div v-if="authFilteredList.length" class="wf-pagination vhp-auth-pages">
              <button type="button" class="wf-btn wf-btn--default" :disabled="authPage <= 1" @click="goAuthPage(authPage - 1)">
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
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeChannelAuth">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmChannelAuth">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.vhp-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #262626);
}
.vhp-list-head { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.vhp-td--nowrap { white-space: nowrap; }
.vhp-tag {
  display: inline-block; margin: 0 6px 4px 0; padding: 0 8px; border-radius: 4px;
  background: #e6f4ff; color: #1677ff; font-size: 12px; line-height: 22px;
}
.vhp-switch {
  position: relative; width: 44px; height: 22px; padding: 0; border: none; border-radius: 11px;
  background: #bfbfbf; cursor: pointer;
}
.vhp-switch--on { background: #1677ff; }
.vhp-switch__knob {
  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform 0.2s ease;
}
.vhp-switch--on .vhp-switch__knob { transform: translateX(22px); }
.vhp-modal { width: min(720px, 92vw); }
.vhp-modal__footer { justify-content: flex-end; }
.vhp-form-row { grid-template-columns: 140px 1fr; }
.vhp-checks { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.vhp-check { display: inline-flex; align-items: center; gap: 6px; }
.vhp-asset-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; width: 100%; }
.vhp-asset-pair__label { margin: 0 0 6px; color: #666; font-size: 13px; }
.vhp-asset-pair__hint { grid-column: 1 / -1; margin: 0; }
.vhp-upload {
  display: flex; align-items: center; justify-content: center; width: 140px; height: 120px;
  padding: 8px; border: 1px dashed #d9d9d9; border-radius: 4px; background: #fafafa; cursor: pointer;
}
.vhp-upload:disabled { cursor: not-allowed; }
.vhp-upload__placeholder { color: #999; font-size: 12px; text-align: center; }
.vhp-upload__preview { width: 100%; height: 100%; object-fit: contain; }
.vhp-file-input { display: none; }
.vhp-auth { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding-top: 4px; }
.vhp-auth__names { margin: 0; color: var(--pc-text); font-size: 13px; line-height: 1.6; word-break: break-word; }
.vhp-auth-modal { width: 640px; }
.vhp-auth-lead { margin: 0 0 12px; font-size: 12px; line-height: 1.6; color: var(--pc-text-secondary); word-break: break-word; }
.vhp-auth-box { margin-bottom: 12px; padding: 12px; border: 1px solid var(--pc-border-light); }
.vhp-auth-box__bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.vhp-auth-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
.vhp-auth-empty { padding: 24px 0; text-align: center; }
.vhp-auth-pages { height: auto; min-height: 56px; gap: 8px; flex-wrap: wrap; padding: 8px; }
</style>
