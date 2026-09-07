<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSearchSelect from '../../components/wireframe/WfSearchSelect.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  LIVE_PRODUCT_CATALOG,
  LIVE_PRODUCT_CHANNEL_OPTIONS,
  LIVE_PRODUCT_CURRENCY_OPTIONS,
  LIVE_PRODUCT_LANG_OPTIONS,
  LIVE_PRODUCT_MINI_PROGRAMS,
  LIVE_PRODUCT_MODULE_OPTIONS,
  LIVE_PRODUCT_ORIENTATION_OPTIONS,
  cloneProductRow,
  createEmptyProductRow,
  liveProductCatalogLabel,
  liveProductChannelLabel,
  liveProductCurrencyLabel,
  liveProductDisplayName,
  liveProductLangLabel,
  liveProductLangShort,
  liveProductMiniProgramLabel,
  liveProductModuleLabel,
  liveProductOrientationLabel,
  liveProductStore,
  type LiveProductCurrency,
  type LiveProductLang,
  type LiveProductOrientation,
  type LiveProductRow,
} from '../../constants/liveProductConfig'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  miniProgram: string
  moduleId: string
  lang: '' | LiveProductLang
  currency: '' | LiveProductCurrency
  orientation: '' | LiveProductOrientation
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
const form = ref<LiveProductRow>(createEmptyProductRow())
const formHint = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const deleteVisible = ref(false)
const deleteRow = ref<LiveProductRow | null>(null)

const modalTitle = computed(() => (modalMode.value === 'add' ? '新增' : '编辑'))
const nextSort = computed(() => Math.max(0, ...liveProductStore.value.map((row) => row.sort)) + 1)
const catalogOptions = computed(() => LIVE_PRODUCT_CATALOG[form.value.miniProgram] ?? [])
const selectedLangs = computed(() =>
  LIVE_PRODUCT_LANG_OPTIONS.filter((item) => form.value.languages.includes(item.value)),
)
const filteredRows = computed(() =>
  liveProductStore.value.filter(matchRow).sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id)),
)

function matchRow(row: LiveProductRow) {
  const f = appliedFilter.value
  if (f.channel && row.channel !== f.channel) return false
  if (f.miniProgram && row.miniProgram !== f.miniProgram) return false
  if (f.moduleId && row.moduleId !== f.moduleId) return false
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

function toggleCurrency(value: LiveProductCurrency) {
  const list = form.value.currencies
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleLanguage(value: LiveProductLang) {
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

function openEdit(row: LiveProductRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = cloneProductRow(row)
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
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
  if (!form.value.channel) return '请选择所属渠道'
  if (!form.value.moduleId) return '请选择所属模块'
  if (!form.value.currencies.length) return '请至少选择 1 个支持币种'
  if (!form.value.languages.length) return '请至少选择 1 个支持语种'
  for (const lang of form.value.languages) {
    if (!form.value.names[lang]?.trim()) return `请输入名称（${liveProductLangLabel(lang)}）`
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
  const payload = cloneProductRow(form.value)
  payload.sort = Number(payload.sort)
  if (modalMode.value === 'add') {
    liveProductStore.value.unshift(payload)
    showPcToast(`已新增产品「${liveProductDisplayName(payload)}」`)
  } else if (editingId.value) {
    const idx = liveProductStore.value.findIndex((item) => item.id === editingId.value)
    if (idx >= 0) liveProductStore.value[idx] = payload
    showPcToast(`已保存产品「${liveProductDisplayName(payload)}」`)
  }
  closeModal()
}

function toggleEnabled(row: LiveProductRow) {
  row.enabled = !row.enabled
  showPcToast(`已${row.enabled ? '启用' : '禁用'}「${liveProductDisplayName(row)}」`)
}

function openDelete(row: LiveProductRow) {
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
  liveProductStore.value = liveProductStore.value.filter((item) => item.id !== row.id)
  showPcToast(`已删除「${liveProductDisplayName(row)}」`)
  closeDelete()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="lpc-title">产品配置</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">所属渠道：</label>
        <WfSearchSelect
          v-model="filter.channel"
          :options="LIVE_PRODUCT_CHANNEL_OPTIONS"
          empty-label="全部"
        />

        <label class="wf-label">小程序：</label>
        <select v-model="filter.miniProgram" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_PRODUCT_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">所属模块：</label>
        <select v-model="filter.moduleId" class="wf-input wf-input--select">
          <option value="">请选择</option>
          <option v-for="opt in LIVE_PRODUCT_MODULE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">语种：</label>
        <select v-model="filter.lang" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_PRODUCT_LANG_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_PRODUCT_CURRENCY_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">横/竖/半屏：</label>
        <select v-model="filter.orientation" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_PRODUCT_ORIENTATION_OPTIONS" :key="opt.value" :value="opt.value">
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
              <th class="wf-th">所属渠道</th>
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
              <td colspan="10" class="wf-td wf-td--empty">暂无产品配置</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td">{{ liveProductChannelLabel(row.channel) }}</td>
              <td class="wf-td">{{ liveProductModuleLabel(row.moduleId) }}</td>
              <td class="wf-td">{{ liveProductMiniProgramLabel(row.miniProgram) }}</td>
              <td class="wf-td">{{ liveProductCatalogLabel(row.miniProgram, row.product) }}</td>
              <td class="wf-td">
                <span
                  v-for="item in row.currencies"
                  :key="`${row.id}-${item}`"
                  class="lpc-tag"
                >
                  {{ liveProductCurrencyLabel(item) }}
                </span>
              </td>
              <td class="wf-td">
                <span
                  v-for="item in row.languages"
                  :key="`${row.id}-${item}`"
                  class="lpc-tag"
                >
                  {{ liveProductLangShort(item) }}
                </span>
              </td>
              <td class="wf-td">{{ liveProductOrientationLabel(row.orientation) }}</td>
              <td class="wf-td wf-td--center">{{ row.sort }}</td>
              <td class="wf-td wf-td--center">
                <button
                  type="button"
                  class="lpc-switch"
                  :class="{ 'lpc-switch--on': row.enabled }"
                  role="switch"
                  :aria-checked="row.enabled"
                  @click="toggleEnabled(row)"
                >
                  <span class="lpc-switch__knob" />
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
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条</span>
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
          class="wf-modal wf-modal--scroll wf-modal--detail-wide"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalMode === 'add' ? 'lpc-add-title' : 'lpc-edit-title'"
        >
          <div class="wf-modal__header">
            <h3
              :id="modalMode === 'add' ? 'lpc-add-title' : 'lpc-edit-title'"
              class="wf-modal__title"
            >
              {{ modalTitle }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="lpc-channel">所属渠道</label>
              <WfSearchSelect
                id="lpc-channel"
                v-model="form.channel"
                :options="LIVE_PRODUCT_CHANNEL_OPTIONS"
                empty-label="请选择所属渠道"
                full
              />
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="lpc-module">所属模块</label>
              <select id="lpc-module" v-model="form.moduleId" class="wf-select wf-select--full">
                <option value="">请选择所属模块</option>
                <option v-for="opt in LIVE_PRODUCT_MODULE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row lpc-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持币种</span>
              <div class="lpc-checks">
                <label v-for="opt in LIVE_PRODUCT_CURRENCY_OPTIONS" :key="opt.value" class="lpc-check">
                  <input
                    type="checkbox"
                    :checked="form.currencies.includes(opt.value)"
                    @change="toggleCurrency(opt.value)"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="wf-form-row lpc-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">支持语种</span>
              <div class="lpc-checks">
                <label v-for="opt in LIVE_PRODUCT_LANG_OPTIONS" :key="opt.value" class="lpc-check">
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
              class="wf-form-row lpc-form-row"
            >
              <label class="wf-form-row__label" :for="`lpc-name-${lang.value}`">
                名称（{{ lang.label }}）
              </label>
              <input
                :id="`lpc-name-${lang.value}`"
                v-model="form.names[lang.value]"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入名称"
              />
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="lpc-mini">小程序</label>
              <select
                id="lpc-mini"
                v-model="form.miniProgram"
                class="wf-select wf-select--full"
                @change="onMiniProgramChange"
              >
                <option value="">请选择小程序</option>
                <option v-for="opt in LIVE_PRODUCT_MINI_PROGRAMS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label" for="lpc-orientation">横竖半屏</label>
              <select id="lpc-orientation" v-model="form.orientation" class="wf-select wf-select--full">
                <option
                  v-for="opt in LIVE_PRODUCT_ORIENTATION_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label" for="lpc-product">产品</label>
              <select
                id="lpc-product"
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

            <div class="wf-form-row lpc-form-row">
              <span class="wf-form-row__label">icon</span>
              <button type="button" class="lpc-upload" @click="triggerUpload">
                <img
                  v-if="form.iconUrl"
                  :src="form.iconUrl"
                  alt="产品 icon"
                  class="lpc-upload__preview"
                />
                <span v-else class="lpc-upload__placeholder">点击上传icon图</span>
              </button>
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label" for="lpc-suffix">后缀地址</label>
              <input
                id="lpc-suffix"
                v-model="form.suffix"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入后缀地址"
              />
            </div>

            <div class="wf-form-row lpc-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="lpc-sort">排序</label>
              <input
                id="lpc-sort"
                v-model.number="form.sort"
                type="number"
                min="1"
                class="wf-input wf-input--full"
              />
            </div>

            <div class="wf-form-row lpc-form-row">
              <span class="wf-form-row__label">状态</span>
              <button
                type="button"
                class="lpc-switch"
                :class="{ 'lpc-switch--on': form.enabled }"
                role="switch"
                :aria-checked="form.enabled"
                @click="form.enabled = !form.enabled"
              >
                <span class="lpc-switch__knob" />
              </button>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="lpc-file-input"
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
        v-if="deleteVisible && deleteRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDelete"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="lpc-delete-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="lpc-delete-title" class="wf-modal__title">确认删除</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDelete">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <p class="lpc-delete-msg">
              确定删除产品「{{ liveProductDisplayName(deleteRow) }}」吗？删除后不可恢复。
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
.lpc-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text);
}

.lpc-tag {
  display: inline-block;
  margin: 0 6px 4px 0;
  padding: 0 8px;
  border-radius: 4px;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 22px;
}

.lpc-switch {
  position: relative;
  width: 44px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #bfbfbf;
  cursor: pointer;
}

.lpc-switch--on {
  background: #1677ff;
}

.lpc-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.lpc-switch--on .lpc-switch__knob {
  transform: translateX(22px);
}

.lpc-form-row {
  grid-template-columns: 140px 1fr;
}

.lpc-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 4px;
}

.lpc-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lpc-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 120px;
  padding: 8px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
}

.lpc-upload__placeholder {
  color: #999;
  font-size: 12px;
  text-align: center;
}

.lpc-upload__preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.lpc-file-input {
  display: none;
}

.lpc-delete-msg {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pc-text);
  word-break: break-word;
}
</style>
