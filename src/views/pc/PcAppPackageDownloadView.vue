<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  APP_CATEGORY_FILTER_OPTIONS,
  APP_CATEGORY_LABEL,
  APP_STATUS_FILTER_OPTIONS,
  APP_TERMINAL_FILTER_OPTIONS,
  APP_TERMINAL_LABEL,
  CURRENT_APP_PACKAGE_OPERATOR,
  cloneAppPackageRows,
  formatAppPackageNow,
  resetAppPackageSlot,
  snapshotAppPackage,
  validateAppPackageForm,
  type AppPackageCategory,
  type AppPackageForm,
  type AppPackageRow,
  type AppPackageStatus,
  type AppTerminal,
} from '../../constants/appPackageDownload'
import { APP_PACKAGE_DOWNLOAD_ANNOT_MAP } from '../../constants/appPackageDownloadSpec'
import '../../styles/pc-wireframe.css'

const rows = ref<AppPackageRow[]>(cloneAppPackageRows())

const filter = ref({
  terminal: '' as '' | AppTerminal,
  category: '' as '' | AppPackageCategory,
  status: '' as '' | AppPackageStatus | 'unconfigured',
  keyword: '',
})
const appliedFilter = ref({ ...filter.value })

const filteredRows = computed(() => {
  const current = appliedFilter.value
  const keyword = current.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (current.terminal && row.terminal !== current.terminal) return false
    if (current.category && row.category !== current.category) return false
    if (current.status === 'unconfigured' && row.configured) return false
    if (current.status && current.status !== 'unconfigured' && (!row.configured || row.status !== current.status)) return false
    if (!keyword) return true
    const haystack = [row.appName, row.versionNumber, row.downloadUrl].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = { terminal: '', category: '', status: '', keyword: '' }
  appliedFilter.value = { ...filter.value }
}

function slotLabel(row: AppPackageRow) {
  return `${APP_TERMINAL_LABEL[row.terminal]}${APP_CATEGORY_LABEL[row.category]}`
}

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRow = ref<AppPackageRow | null>(null)
const form = ref<AppPackageForm>({
  appName: '',
  versionNumber: '',
  downloadUrl: '',
  updateLog: '',
  status: 'enabled',
  remarks: '',
})
const formError = ref('')

const isIosSuper = computed(() => formRow.value?.terminal === 'ios' && formRow.value.category === 'super')

function openAdd(row: AppPackageRow) {
  formMode.value = 'add'
  formRow.value = row
  form.value = {
    appName: row.appName,
    versionNumber: '',
    downloadUrl: '',
    updateLog: '',
    status: 'enabled',
    remarks: row.remarks,
  }
  formError.value = ''
  formVisible.value = true
}

function openEdit(row: AppPackageRow) {
  if (!row.configured) return
  formMode.value = 'edit'
  formRow.value = row
  form.value = {
    appName: row.appName,
    versionNumber: row.versionNumber,
    downloadUrl: row.downloadUrl,
    updateLog: row.updateLog,
    status: row.status,
    remarks: row.remarks,
  }
  formError.value = ''
  formVisible.value = true
}

function closeForm() {
  if (confirmState.value) return
  formVisible.value = false
}

function commitSave() {
  const row = formRow.value
  if (!row) return
  const isAdd = formMode.value === 'add'
  if (isAdd) {
    if (row.configured) row.history = [snapshotAppPackage(row), ...row.history]
    row.configured = true
    row.versionNumber = form.value.versionNumber.trim()
    row.downloadUrl = form.value.downloadUrl.trim()
  }
  row.appName = form.value.appName.trim()
  row.updateLog = form.value.updateLog.trim()
  row.status = form.value.status
  row.remarks = form.value.remarks.trim()
  row.updatedAt = formatAppPackageNow()
  row.operator = CURRENT_APP_PACKAGE_OPERATOR
  showPcToast(isAdd ? `已新增 v${row.versionNumber}` : '保存成功')
  formVisible.value = false
}

function requestSave() {
  const row = formRow.value
  if (!row) return
  const message = validateAppPackageForm(
    form.value,
    row,
    formMode.value,
    row.configured ? row.versionNumber : null,
    row.history.map((item) => item.versionNumber),
  )
  formError.value = message
  if (message) return

  if (formMode.value === 'add' && row.configured) {
    openConfirm(
      '新增版本',
      `「${slotLabel(row)}」当前为 v${row.versionNumber}。新增 v${form.value.versionNumber.trim()} 后将替换为当前下载版本，v${row.versionNumber} 写入历史。`,
      '确认新增',
      commitSave,
    )
    return
  }

  commitSave()
}

const confirmState = ref<null | {
  title: string
  message: string
  confirmText: string
  action: () => void
}>(null)

function openConfirm(title: string, message: string, confirmText: string, action: () => void) {
  confirmState.value = { title, message, confirmText, action }
}

function closeConfirm() {
  confirmState.value = null
}

function runConfirm() {
  const action = confirmState.value?.action
  confirmState.value = null
  action?.()
}

function requestToggle(row: AppPackageRow) {
  if (!row.configured) return
  if (row.status === 'enabled') {
    openConfirm(
      '停用下载配置',
      '确定要停用此包吗？这可能导致正在下载的用户中断。',
      '停用',
      () => {
        row.status = 'disabled'
        row.updatedAt = formatAppPackageNow()
        row.operator = CURRENT_APP_PACKAGE_OPERATOR
        showPcToast('已停用该包')
      },
    )
    return
  }
  row.status = 'enabled'
  row.updatedAt = formatAppPackageNow()
  row.operator = CURRENT_APP_PACKAGE_OPERATOR
  showPcToast('已启用该包')
}

function deleteDisabledReason(row: AppPackageRow) {
  if (!row.configured) return '该包位未配置'
  if (row.status === 'enabled') return '请先关闭开关再删除'
  return ''
}

function requestDelete(row: AppPackageRow) {
  if (deleteDisabledReason(row)) return
  openConfirm(
    '删除下载配置',
    `确定删除「${slotLabel(row)}」的当前配置吗？v${row.versionNumber} 会写入历史，该行恢复为未配置。`,
    '删除',
    () => {
      row.history = [snapshotAppPackage(row), ...row.history]
      resetAppPackageSlot(row)
      row.updatedAt = formatAppPackageNow()
      row.operator = CURRENT_APP_PACKAGE_OPERATOR
      showPcToast('已删除')
    },
  )
}

async function copyDownload(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    showPcToast('已复制下载链接')
  } catch {
    showPcToast('复制失败，请手动选择链接', 'error')
  }
}

const historyRow = ref<AppPackageRow | null>(null)
const HISTORY_PAGE_SIZE = 5
const historyFilter = ref({ version: '', log: '' })
const historyApplied = ref({ version: '', log: '' })
const historyPage = ref(1)

const historyFiltered = computed(() => {
  const list = historyRow.value?.history ?? []
  const version = historyApplied.value.version.trim().toLowerCase().replace(/^v/, '')
  const log = historyApplied.value.log.trim().toLowerCase()
  return list.filter((item) => {
    if (version && !item.versionNumber.toLowerCase().includes(version)) return false
    if (log && !item.updateLog.toLowerCase().includes(log)) return false
    return true
  })
})
const historyTotalPages = computed(() => Math.max(1, Math.ceil(historyFiltered.value.length / HISTORY_PAGE_SIZE)))
const historyPageItems = computed(() => {
  const start = (historyPage.value - 1) * HISTORY_PAGE_SIZE
  return historyFiltered.value.slice(start, start + HISTORY_PAGE_SIZE)
})
const historyPageNumbers = computed(() => Array.from({ length: historyTotalPages.value }, (_, index) => index + 1))

watch(historyTotalPages, (last) => {
  if (historyPage.value > last) historyPage.value = last
})

function applyHistoryFilter() {
  historyApplied.value = { ...historyFilter.value }
  historyPage.value = 1
}

function resetHistoryFilter() {
  historyFilter.value = { version: '', log: '' }
  applyHistoryFilter()
}

function goHistoryPage(page: number) {
  if (page < 1 || page > historyTotalPages.value) return
  historyPage.value = page
}

function openHistory(row: AppPackageRow) {
  historyRow.value = row
  resetHistoryFilter()
}

function closeHistory() {
  if (confirmState.value) return
  historyRow.value = null
}

function requestRollback(historyId: string) {
  const row = historyRow.value
  if (!row) return
  const item = row.history.find((history) => history.id === historyId)
  if (!item) return
  const message = row.configured
    ? `确定回滚到 v${item.versionNumber} 吗？当前 v${row.versionNumber} 会写入历史，列表版本号改为 v${item.versionNumber}。`
    : `确定回滚到 v${item.versionNumber} 吗？该包位将恢复为 v${item.versionNumber} 并启用。`
  openConfirm('回滚版本', message, '回滚', () => {
    const rest = row.history.filter((history) => history.id !== historyId)
    row.history = row.configured ? [snapshotAppPackage(row), ...rest] : rest
    row.configured = true
    row.versionNumber = item.versionNumber
    row.downloadUrl = item.downloadUrl
    row.updateLog = item.updateLog
    row.status = 'enabled'
    row.updatedAt = formatAppPackageNow()
    row.operator = CURRENT_APP_PACKAGE_OPERATOR
    showPcToast(`已回滚至 v${item.versionNumber}`)
  })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <span class="wf-app-pkg-filter">
          <label class="wf-label wf-label--with-spec">
            终端：
            <WfSpecAnnot
              :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.filter.no"
              :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.filter.title"
              :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.filter.items]"
            />
          </label>
          <select v-model="filter.terminal" class="wf-input wf-input--select">
            <option v-for="opt in APP_TERMINAL_FILTER_OPTIONS" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </span>
        <span class="wf-app-pkg-filter">
          <label class="wf-label">包分类：</label>
          <select v-model="filter.category" class="wf-input wf-input--select">
            <option v-for="opt in APP_CATEGORY_FILTER_OPTIONS" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </span>
        <span class="wf-app-pkg-filter">
          <label class="wf-label">状态：</label>
          <select v-model="filter.status" class="wf-input wf-input--select">
            <option v-for="opt in APP_STATUS_FILTER_OPTIONS" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </span>
      </div>
      <div class="wf-toolbar wf-toolbar--filters">
        <span class="wf-app-pkg-filter wf-app-pkg-filter--grow">
          <label class="wf-label">应用搜索：</label>
          <input
            v-model="filter.keyword"
            type="text"
            class="wf-input wf-input--grow"
            placeholder="应用名称、版本号、下载链接"
            @keyup.enter="applyFilter"
          />
        </span>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--app-pkg">
          <thead>
            <tr>
              <th class="wf-th wf-th--with-spec">
                终端 / 包分类
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.slots.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.slots.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.slots.items]"
                />
              </th>
              <th class="wf-th">应用/包名称</th>
              <th class="wf-th">版本号</th>
              <th class="wf-th wf-th--with-spec">
                下载链接
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.items]"
                />
              </th>
              <th class="wf-th wf-th--with-spec">
                历史版本
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.history.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.history.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.history.items]"
                />
              </th>
              <th class="wf-th wf-th--with-spec">
                状态
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.status.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.status.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.status.items]"
                />
              </th>
              <th class="wf-th">更新时间 / 操作人</th>
              <th class="wf-th wf-th--op wf-th--with-spec">
                操作
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.rowActions.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.rowActions.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.rowActions.items]"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="8" class="wf-td wf-td--empty">暂无符合条件的下载配置</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id" :class="{ 'wf-app-pkg-row--empty': !row.configured }">
              <td class="wf-td">
                <div class="wf-app-pkg-slot">
                  <span class="wf-app-pkg-terminal" :class="`wf-app-pkg-terminal--${row.terminal}`">
                    {{ APP_TERMINAL_LABEL[row.terminal] }}
                  </span>
                  <span class="wf-app-pkg-cat" :class="`wf-app-pkg-cat--${row.category}`">
                    {{ APP_CATEGORY_LABEL[row.category] }}
                  </span>
                </div>
              </td>
              <td class="wf-td">
                <div v-if="row.configured" class="wf-app-pkg-name">
                  <span class="wf-app-pkg-mark">{{ row.appName.slice(0, 1) }}</span>
                  <span>{{ row.appName }}</span>
                </div>
                <span v-else class="wf-muted">未配置</span>
              </td>
              <td class="wf-td wf-td--nowrap">
                <template v-if="row.configured">v{{ row.versionNumber }}</template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td">
                <div v-if="row.configured" class="wf-app-pkg-url">
                  <span>{{ row.downloadUrl }}</span>
                  <button type="button" class="wf-link-action" @click="copyDownload(row.downloadUrl)">复制</button>
                </div>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td wf-td--nowrap">
                <button
                  v-if="row.history.length"
                  type="button"
                  class="wf-link-action"
                  @click="openHistory(row)"
                >
                  查看历史
                </button>
                <span v-else class="wf-muted">暂无</span>
              </td>
              <td class="wf-td">
                <button
                  v-if="row.configured"
                  type="button"
                  class="wf-app-pkg-switch"
                  :class="{ 'wf-app-pkg-switch--on': row.status === 'enabled' }"
                  :aria-pressed="row.status === 'enabled'"
                  :aria-label="row.status === 'enabled' ? '停用' : '启用'"
                  @click="requestToggle(row)"
                />
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td">
                <template v-if="row.updatedAt">{{ row.updatedAt }}（{{ row.operator }}）</template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td wf-td--nowrap">
                <button type="button" class="wf-link-action" @click="openAdd(row)">新增</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action"
                  :disabled="!row.configured"
                  :title="row.configured ? '' : '该包位未配置，请先新增'"
                  @click="openEdit(row)"
                >
                  编辑
                </button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action wf-link-action--danger"
                  :disabled="!!deleteDisabledReason(row)"
                  :title="deleteDisabledReason(row)"
                  @click="requestDelete(row)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条（已配置 {{ filteredRows.filter((row) => row.configured).length }} 条）</span>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="formVisible && formRow" class="wf-modal-mask" @click.self="closeForm">
        <div class="wf-modal wf-modal--scroll wf-modal--detail-wide wf-app-pkg-form" role="dialog" aria-modal="true">
          <div class="wf-modal__header">
            <h3 class="wf-modal__title wf-modal__title--with-spec">
              {{ formMode === 'add' ? '新增版本' : '编辑下载配置' }}
              <WfSpecAnnot
                :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.form.no"
                :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.form.title"
                :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.form.items]"
                placement="bottom"
              />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeForm">×</button>
          </div>
          <div class="wf-modal__body" @input="formError = ''">
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">应用/包名称</label>
              <div>
                <input v-model="form.appName" type="text" class="wf-input wf-input--full" maxlength="100" placeholder="如金刚聊天" />
              </div>
            </div>
            <div class="wf-form-row">
              <span class="wf-form-row__label">终端 / 包分类</span>
              <div class="wf-app-pkg-slot">
                <span class="wf-app-pkg-terminal" :class="`wf-app-pkg-terminal--${formRow.terminal}`">
                  {{ APP_TERMINAL_LABEL[formRow.terminal] }}
                </span>
                <span class="wf-app-pkg-cat" :class="`wf-app-pkg-cat--${formRow.category}`">
                  {{ APP_CATEGORY_LABEL[formRow.category] }}
                </span>
                <span class="wf-muted">固定包位，不可修改</span>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label" :class="{ 'wf-form-row__label--required': formMode === 'add' }">版本号</label>
              <div>
                <input
                  v-model="form.versionNumber"
                  type="text"
                  class="wf-input"
                  :disabled="formMode === 'edit'"
                  :placeholder="formMode === 'add' && formRow.configured ? `当前 v${formRow.versionNumber}，填写新版本号` : '1.0.3'"
                />
                <p v-if="formMode === 'add' && formRow.configured" class="wf-form-row__hint">
                  当前 v{{ formRow.versionNumber }}，保存后替换为当前下载版本，v{{ formRow.versionNumber }} 写入历史；版本号不能与当前、历史相同。
                </p>
                <p v-else-if="formMode === 'edit'" class="wf-form-row__hint">版本号、下载链接不可编辑；如需换包，请在列表点「新增」发布新版本。</p>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label" :class="{ 'wf-form-row__label--required': formMode === 'add' }">下载链接</label>
              <div>
                <input
                  v-model="form.downloadUrl"
                  type="text"
                  class="wf-input wf-input--full"
                  :disabled="formMode === 'edit'"
                  :placeholder="isIosSuper ? 'https:// 或 itms-services://' : 'https://'"
                />
                <p v-if="isIosSuper" class="wf-form-row__hint">iOS 超签包填写安装页地址，或以 itms-services:// 开头的安装地址。</p>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label">更新日志</label>
              <textarea v-model="form.updateLog" class="wf-input wf-app-pkg-textarea" rows="3" placeholder="下载页展示的版本说明，如本次新增功能" />
            </div>
            <div class="wf-form-row">
              <span class="wf-form-row__label">状态</span>
              <div class="wf-app-pkg-status-field">
                <button
                  type="button"
                  class="wf-app-pkg-switch"
                  :class="{ 'wf-app-pkg-switch--on': form.status === 'enabled' }"
                  @click="form.status = form.status === 'enabled' ? 'disabled' : 'enabled'"
                />
                <span>{{ form.status === 'enabled' ? '启用' : '禁用' }}</span>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label">备注</label>
              <textarea v-model="form.remarks" class="wf-input wf-app-pkg-textarea" rows="2" maxlength="255" placeholder="内部备注，例如企业签 1 号" />
            </div>
            <p v-if="formError" class="wf-modal__hint">{{ formError }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeForm">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="requestSave">
              {{ formMode === 'add' ? '确认新增' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="historyRow" class="wf-modal-mask" @click.self="closeHistory">
        <div class="wf-modal wf-modal--scroll wf-app-pkg-history-modal" role="dialog" aria-modal="true">
          <div class="wf-modal__header">
            <h3 class="wf-modal__title">
              {{ APP_TERMINAL_LABEL[historyRow.terminal] }} · {{ APP_CATEGORY_LABEL[historyRow.category] }} 历史版本
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeHistory">×</button>
          </div>
          <div class="wf-modal__body">
            <p class="wf-app-pkg-history-current">
              <template v-if="historyRow.configured">
                当前下载版本：<strong>v{{ historyRow.versionNumber }}</strong>
                <span class="wf-muted">（{{ historyRow.downloadUrl }}）</span>
              </template>
              <template v-else>当前下载版本：<span class="wf-muted">未配置，可回滚到下方任一版本恢复</span></template>
            </p>
            <div class="wf-toolbar wf-toolbar--filters wf-app-pkg-history-filter">
              <span class="wf-app-pkg-filter">
                <label class="wf-label">版本号：</label>
                <input
                  v-model="historyFilter.version"
                  type="text"
                  class="wf-input"
                  placeholder="如 2.3 或 v2.3.0"
                  @keyup.enter="applyHistoryFilter"
                />
              </span>
              <span class="wf-app-pkg-filter wf-app-pkg-filter--grow">
                <label class="wf-label">更新日志：</label>
                <input
                  v-model="historyFilter.log"
                  type="text"
                  class="wf-input wf-input--grow"
                  placeholder="输入关键字，如 修复"
                  @keyup.enter="applyHistoryFilter"
                />
              </span>
              <span class="wf-toolbar__actions">
                <button type="button" class="wf-btn wf-btn--primary" @click="applyHistoryFilter">搜索</button>
                <button type="button" class="wf-btn wf-btn--danger" @click="resetHistoryFilter">清除</button>
              </span>
            </div>
            <div class="wf-table-wrap">
              <table class="wf-table wf-table--app-pkg-history">
                <colgroup>
                  <col class="wf-app-pkg-history-col--version" />
                  <col class="wf-app-pkg-history-col--url" />
                  <col class="wf-app-pkg-history-col--log" />
                  <col class="wf-app-pkg-history-col--operator" />
                  <col class="wf-app-pkg-history-col--time" />
                  <col class="wf-app-pkg-history-col--op" />
                </colgroup>
                <thead>
                  <tr>
                    <th class="wf-th">版本号</th>
                    <th class="wf-th">下载链接</th>
                    <th class="wf-th">更新日志</th>
                    <th class="wf-th">操作人</th>
                    <th class="wf-th">更新时间</th>
                    <th class="wf-th">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="historyFiltered.length === 0">
                    <td colspan="6" class="wf-td wf-td--empty">
                      {{ historyRow.history.length ? '暂无符合条件的历史版本' : '暂无历史版本' }}
                    </td>
                  </tr>
                  <tr v-for="item in historyPageItems" :key="item.id">
                    <td class="wf-td wf-td--nowrap">v{{ item.versionNumber }}</td>
                    <td class="wf-td">{{ item.downloadUrl }}</td>
                    <td class="wf-td">{{ item.updateLog || '—' }}</td>
                    <td class="wf-td">{{ item.operator }}</td>
                    <td class="wf-td wf-app-pkg-history-time">
                      <span>{{ item.updatedAt.split(' ')[0] }}</span> <span>{{ item.updatedAt.split(' ')[1] }}</span>
                    </td>
                    <td class="wf-td">
                      <button type="button" class="wf-link-action" @click="requestRollback(item.id)">回滚至此版本</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="historyFiltered.length" class="wf-pagination wf-app-pkg-history-pages">
              <span class="wf-pagination__info">共 {{ historyFiltered.length }} 条</span>
              <button type="button" class="wf-btn wf-btn--default" :disabled="historyPage <= 1" @click="goHistoryPage(historyPage - 1)">
                上一页
              </button>
              <button
                v-for="page in historyPageNumbers"
                :key="page"
                type="button"
                class="wf-btn"
                :class="page === historyPage ? 'wf-btn--primary' : 'wf-btn--default'"
                @click="goHistoryPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="historyPage >= historyTotalPages"
                @click="goHistoryPage(historyPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeHistory">关闭</button>
          </div>
        </div>
      </div>

      <div v-if="confirmState" class="wf-modal-mask" @click.self="closeConfirm">
        <div class="wf-modal wf-app-pkg-confirm" role="dialog" aria-modal="true">
          <div class="wf-modal__header">
            <h3 class="wf-modal__title">{{ confirmState.title }}</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeConfirm">×</button>
          </div>
          <div class="wf-modal__body">
            <p class="wf-app-pkg-confirm__text">{{ confirmState.message }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeConfirm">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="runConfirm">{{ confirmState.confirmText }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
