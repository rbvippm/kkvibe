<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  VIP_HALL_CHANNEL_OPTIONS,
  VIP_HALL_CURRENCY_OPTIONS,
  VIP_HALL_LANG_OPTIONS,
  VIP_HALL_PRODUCT_TYPE_OPTIONS,
  applyProductTypeFromModule,
  cloneModuleRow,
  createEmptyModuleRow,
  displayZhName,
  vipHallChannelLabel,
  vipHallCurrencyLabel,
  vipHallLangLabel,
  vipHallModuleStore,
  vipHallProductStore,
  vipHallProductTypeLabel,
  type VipHallAssetPair,
  type VipHallCurrency,
  type VipHallLang,
  type VipHallModuleRow,
} from '../../constants/vipHallManage'
import { VIP_HALL_MODULE_ANNOT_MAP } from '../../constants/vipHallModuleSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  lang: '' | VipHallLang
  currency: '' | VipHallCurrency
}

type ModalMode = 'add' | 'edit' | 'detail'

const defaultFilter = (): ListFilter => ({ channel: '', lang: '', currency: '' })

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const actionHint = ref('')
const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const form = ref<VipHallModuleRow>(createEmptyModuleRow())
const formHint = ref('')
const uploadKind = ref<{ field: 'icon'; side: 'mobile' | 'pc' } | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const filterAnnot = VIP_HALL_MODULE_ANNOT_MAP.filter
const addAnnot = VIP_HALL_MODULE_ANNOT_MAP.addButton
const listAnnot = VIP_HALL_MODULE_ANNOT_MAP.list
const modalAnnot = VIP_HALL_MODULE_ANNOT_MAP.modal

const readonly = computed(() => modalMode.value === 'detail')
const modalTitle = computed(() =>
  modalMode.value === 'add' ? '新增' : modalMode.value === 'edit' ? '编辑' : '查看详情',
)
const nextSort = computed(() => Math.max(0, ...vipHallModuleStore.value.map((row) => row.sort)) + 1)
const selectedLangs = computed(() =>
  VIP_HALL_LANG_OPTIONS.filter((item) => form.value.languages.includes(item.value)),
)
const filteredRows = computed(() =>
  vipHallModuleStore.value.filter(matchRow).sort((a, b) => a.sort - b.sort),
)

function matchRow(row: VipHallModuleRow) {
  const f = appliedFilter.value
  if (f.channel && row.channel !== f.channel) return false
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
  form.value = createEmptyModuleRow(nextSort.value)
  formHint.value = ''
  modalVisible.value = true
}

function openEdit(row: VipHallModuleRow, mode: 'edit' | 'detail') {
  modalMode.value = mode
  editingId.value = row.id
  form.value = cloneModuleRow(row)
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

function triggerUpload(field: 'icon', side: 'mobile' | 'pc') {
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
  if (!form.value.channel) return '请选择所属渠道'
  if (!form.value.type) return '请选择类型'
  if (!form.value.currencies.length) return '请至少选择 1 个支持币种'
  if (!form.value.languages.length) return '请至少选择 1 个支持语种'
  for (const lang of form.value.languages) {
    if (!form.value.names[lang]?.trim()) return `请输入名称（${vipHallLangLabel(lang)}）`
    if (!form.value.descriptions[lang]?.trim()) return `请输入描述（${vipHallLangLabel(lang)}）`
  }
  if (!form.value.icon.mobileUrl || !form.value.icon.pcUrl) return '请上传移动端与 PC 端图片'
  const sort = Number(form.value.sort)
  if (!Number.isInteger(sort) || sort < 1) return '排序须为正整数'
  return ''
}

function confirmModal() {
  const error = validateForm()
  if (error) {
    formHint.value = error
    return
  }
  const payload = cloneModuleRow(form.value)
  payload.sort = Number(payload.sort)
  if (modalMode.value === 'add') {
    vipHallModuleStore.value.unshift(payload)
    actionHint.value = `已新增「${displayZhName(payload.names)}」`
  } else if (editingId.value) {
    const idx = vipHallModuleStore.value.findIndex((item) => item.id === editingId.value)
    if (idx >= 0) vipHallModuleStore.value[idx] = payload
    vipHallProductStore.value.forEach((item) => {
      if (item.moduleId === payload.id) applyProductTypeFromModule(item, payload.type)
    })
    actionHint.value = `已保存「${displayZhName(payload.names)}」`
  }
  closeModal()
}

function toggleEnabled(row: VipHallModuleRow) {
  row.enabled = !row.enabled
  actionHint.value = `已${row.enabled ? '启用' : '禁用'}「${displayZhName(row.names)}」`
}

function removeRow(row: VipHallModuleRow) {
  const used = vipHallProductStore.value.some((item) => item.moduleId === row.id)
  if (used) {
    actionHint.value = `「${displayZhName(row.names)}」下仍有产品，请先在产品管理中删除`
    return
  }
  if (!window.confirm(`确定删除模块「${displayZhName(row.names)}」吗？`)) return
  vipHallModuleStore.value = vipHallModuleStore.value.filter((item) => item.id !== row.id)
  actionHint.value = `已删除「${displayZhName(row.names)}」`
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="vhm-title">模块管理</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          所属渠道：
          <WfSpecAnnot
            :no="filterAnnot.no"
            :title="filterAnnot.title"
            :items="[...filterAnnot.items]"
            placement="bottom"
          />
        </label>
        <select v-model="filter.channel" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in VIP_HALL_CHANNEL_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
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
        <div class="vhm-list-head">
          <WfSpecAnnot :no="listAnnot.no" :title="listAnnot.title" :items="[...listAnnot.items]" />
        </div>
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">序号</th>
              <th class="wf-th">所属渠道</th>
              <th class="wf-th">类型</th>
              <th class="wf-th">图片</th>
              <th class="wf-th">中文名称</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">语种</th>
              <th class="wf-th">排序</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="10" class="wf-td wf-td--empty">暂无模块数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ vipHallChannelLabel(row.channel) }}</td>
              <td class="wf-td">{{ vipHallProductTypeLabel(row.type) }}</td>
              <td class="wf-td wf-td--center">
                <img v-if="row.icon.mobileUrl" :src="row.icon.mobileUrl" :alt="displayZhName(row.names)" class="vhm-thumb" />
                <span v-else class="wf-muted">无图</span>
              </td>
              <td class="wf-td">{{ displayZhName(row.names) }}</td>
              <td class="wf-td">
                <span v-for="item in row.currencies" :key="`${row.id}-${item}`" class="vhm-tag">
                  {{ vipHallCurrencyLabel(item) }}
                </span>
              </td>
              <td class="wf-td">
                <span v-for="item in row.languages" :key="`${row.id}-${item}`" class="vhm-tag">
                  {{ vipHallLangLabel(item) }}
                </span>
              </td>
              <td class="wf-td wf-td--center">{{ row.sort }}</td>
              <td class="wf-td wf-td--center">
                <button
                  type="button"
                  class="vhm-switch"
                  :class="{ 'vhm-switch--on': row.enabled }"
                  role="switch"
                  :aria-checked="row.enabled"
                  @click="toggleEnabled(row)"
                >
                  <span class="vhm-switch__knob" />
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
        <div class="wf-modal wf-modal--scroll vhm-modal" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title wf-modal__title--with-spec">
              {{ modalTitle }}
              <WfSpecAnnot :no="modalAnnot.no" :title="modalAnnot.title" :items="[...modalAnnot.items]" />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </header>
          <div class="wf-modal__body">
            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">所属渠道</label>
              <select v-model="form.channel" class="wf-select wf-select--full" :disabled="readonly">
                <option value="">请选择</option>
                <option v-for="opt in VIP_HALL_CHANNEL_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">类型</label>
              <select v-model="form.type" class="wf-select wf-select--full" :disabled="readonly">
                <option v-for="opt in VIP_HALL_PRODUCT_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">图片</label>
              <div class="vhm-asset-pair">
                <div>
                  <p class="vhm-asset-pair__label">移动端</p>
                  <button type="button" class="vhm-upload" :disabled="readonly" @click="triggerUpload('icon', 'mobile')">
                    <img v-if="form.icon.mobileUrl" :src="form.icon.mobileUrl" alt="移动端图片" class="vhm-upload__preview" />
                    <span v-else class="vhm-upload__placeholder">点击上传图片</span>
                  </button>
                </div>
                <div>
                  <p class="vhm-asset-pair__label">PC端</p>
                  <button type="button" class="vhm-upload" :disabled="readonly" @click="triggerUpload('icon', 'pc')">
                    <img v-if="form.icon.pcUrl" :src="form.icon.pcUrl" alt="PC 图片" class="vhm-upload__preview" />
                    <span v-else class="vhm-upload__placeholder">点击上传图片</span>
                  </button>
                </div>
                <p class="wf-form-row__hint vhm-asset-pair__hint">仅支持格式为 jpg、png、webp</p>
              </div>
            </div>

            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">支持币种</label>
              <div class="vhm-checks">
                <label v-for="opt in VIP_HALL_CURRENCY_OPTIONS" :key="opt.value" class="vhm-check">
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

            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">支持语种</label>
              <div class="vhm-checks">
                <label v-for="opt in VIP_HALL_LANG_OPTIONS" :key="opt.value" class="vhm-check">
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
              <div class="wf-form-row vhm-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">名称（{{ lang.label }}）</label>
                <input
                  v-model="form.names[lang.value]"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入名称"
                  :disabled="readonly"
                />
              </div>
              <div class="wf-form-row vhm-form-row">
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

            <div class="wf-form-row vhm-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">排序</label>
              <input v-model.number="form.sort" type="number" min="1" class="wf-input wf-input--full" :disabled="readonly" />
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
            <input
              ref="fileInputRef"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              class="vhm-file-input"
              @change="onFileChange"
            />
          </div>
          <div class="wf-modal__footer vhm-modal__footer">
            <button v-if="readonly" type="button" class="wf-btn wf-btn--default" @click="closeModal">关闭</button>
            <template v-else>
              <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">确定</button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.vhm-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #262626);
}
.vhm-list-head { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.vhm-thumb { width: 40px; height: 40px; object-fit: contain; background: #111; border-radius: 6px; }
.vhm-tag {
  display: inline-block; margin: 0 6px 4px 0; padding: 0 8px; border-radius: 4px;
  background: #e6f4ff; color: #1677ff; font-size: 12px; line-height: 22px;
}
.vhm-switch {
  position: relative; width: 44px; height: 22px; padding: 0; border: none; border-radius: 11px;
  background: #bfbfbf; cursor: pointer;
}
.vhm-switch--on { background: #1677ff; }
.vhm-switch__knob {
  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform 0.2s ease;
}
.vhm-switch--on .vhm-switch__knob { transform: translateX(22px); }
.vhm-modal { width: min(680px, 92vw); }
.vhm-modal__footer { justify-content: flex-end; }
.vhm-form-row { grid-template-columns: 140px 1fr; }
.vhm-checks { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.vhm-check { display: inline-flex; align-items: center; gap: 6px; }
.vhm-asset-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; width: 100%; }
.vhm-asset-pair__label { margin: 0 0 6px; color: #666; font-size: 13px; }
.vhm-asset-pair__hint { grid-column: 1 / -1; }
.vhm-upload {
  display: flex; align-items: center; justify-content: center; width: 120px; height: 120px;
  padding: 0; border: 1px dashed #d9d9d9; border-radius: 4px; background: #fafafa; cursor: pointer;
}
.vhm-upload:disabled { cursor: not-allowed; }
.vhm-upload__placeholder { color: #999; font-size: 13px; }
.vhm-upload__preview { width: 100%; height: 100%; object-fit: contain; }
.vhm-file-input { display: none; }
</style>
