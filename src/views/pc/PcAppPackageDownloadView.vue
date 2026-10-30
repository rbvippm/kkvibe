<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  APP_CATEGORY_FILTER_OPTIONS,
  APP_CATEGORY_LABEL,
  APP_STATUS_FILTER_OPTIONS,
  APP_TERMINAL_FILTER_OPTIONS,
  APP_TERMINAL_LABEL,
  APP_UPDATE_LABEL,
  CURRENT_APP_PACKAGE_OPERATOR,
  appPackageIdentity,
  cloneAppPackageRows,
  formatAppPackageNow,
  showsPlistField,
  snapshotAppPackage,
  validateAppPackageForm,
  type AppPackageCategory,
  type AppPackageForm,
  type AppPackageRow,
  type AppPackageStatus,
  type AppTerminal,
  type AppUpdateMode,
} from '../../constants/appPackageDownload'
import { APP_PACKAGE_DOWNLOAD_ANNOT_MAP } from '../../constants/appPackageDownloadSpec'
import '../../styles/pc-wireframe.css'

const rows = ref<AppPackageRow[]>(cloneAppPackageRows())

const filter = ref({
  terminal: '' as '' | AppTerminal,
  category: '' as '' | AppPackageCategory,
  status: '' as '' | AppPackageStatus,
  keyword: '',
})
const appliedFilter = ref({ ...filter.value })

const filteredRows = computed(() => {
  const current = appliedFilter.value
  const keyword = current.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (current.terminal && row.terminal !== current.terminal) return false
    if (current.category && row.category !== current.category) return false
    if (current.status && row.status !== current.status) return false
    if (!keyword) return true
    const haystack = [row.appName, row.versionNumber, row.downloadUrl, row.plistUrl].join(' ').toLowerCase()
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

function emptyForm(): AppPackageForm {
  return {
    appName: '',
    terminal: 'ios',
    category: 'chat',
    versionNumber: '',
    downloadUrl: '',
    plistUrl: '',
    updateMode: 'optional',
    updateLog: '',
    status: 'enabled',
    remarks: '',
  }
}

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref<AppPackageForm>(emptyForm())
const formError = ref('')
const originalDownloadUrl = ref('')

const matchedRow = computed(() => {
  const identity = appPackageIdentity({
    appName: form.value.appName,
    terminal: form.value.terminal,
    category: form.value.category,
  })
  return rows.value.find((row) => appPackageIdentity(row) === identity && row.id !== editingId.value) ?? null
})

const saveMode = computed(() => {
  if (formMode.value === 'edit') return 'edit' as const
  return matchedRow.value ? 'publish' as const : 'create' as const
})

const plistVisible = computed(() => showsPlistField(form.value.terminal, form.value.category))

function openAdd() {
  formMode.value = 'add'
  editingId.value = null
  form.value = emptyForm()
  originalDownloadUrl.value = ''
  formError.value = ''
  formVisible.value = true
}

function openEdit(row: AppPackageRow) {
  formMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    appName: row.appName,
    terminal: row.terminal,
    category: row.category,
    versionNumber: row.versionNumber,
    downloadUrl: row.downloadUrl,
    plistUrl: row.plistUrl,
    updateMode: row.updateMode,
    updateLog: row.updateLog,
    status: row.status,
    remarks: row.remarks,
  }
  originalDownloadUrl.value = row.downloadUrl
  formError.value = ''
  formVisible.value = true
}

function closeForm() {
  if (confirmState.value) return
  formVisible.value = false
}

function applyFormToRow(target: AppPackageRow, pushHistory: boolean) {
  if (pushHistory) target.history = [snapshotAppPackage(target), ...target.history]
  target.appName = form.value.appName.trim()
  target.terminal = form.value.terminal
  target.category = form.value.category
  target.versionNumber = form.value.versionNumber.trim()
  target.downloadUrl = form.value.downloadUrl.trim()
  target.plistUrl = plistVisible.value ? form.value.plistUrl.trim() : ''
  target.updateMode = form.value.updateMode
  target.updateLog = form.value.updateLog.trim()
  target.status = form.value.status
  target.remarks = form.value.remarks.trim()
  target.updatedAt = formatAppPackageNow()
  target.operator = CURRENT_APP_PACKAGE_OPERATOR
  if (target.status === 'enabled') {
    const identity = appPackageIdentity(target)
    rows.value.forEach((row) => {
      if (row.id !== target.id && row.status === 'enabled' && appPackageIdentity(row) === identity) {
        row.status = 'disabled'
        row.updatedAt = target.updatedAt
        row.operator = CURRENT_APP_PACKAGE_OPERATOR
      }
    })
  }
}

function commitSave() {
  const mode = saveMode.value
  const versionChanged = (current: string) => form.value.versionNumber.trim() !== current
  const urlChanged = form.value.downloadUrl.trim() !== originalDownloadUrl.value.trim()

  if (mode === 'create') {
    rows.value.unshift({
      id: `pkg_${Date.now()}`,
      appName: form.value.appName.trim(),
      terminal: form.value.terminal,
      category: form.value.category,
      versionNumber: form.value.versionNumber.trim(),
      downloadUrl: form.value.downloadUrl.trim(),
      plistUrl: plistVisible.value ? form.value.plistUrl.trim() : '',
      updateMode: form.value.updateMode,
      updateLog: form.value.updateLog.trim(),
      status: form.value.status,
      remarks: form.value.remarks.trim(),
      updatedAt: formatAppPackageNow(),
      operator: CURRENT_APP_PACKAGE_OPERATOR,
      history: [],
    })
    showPcToast('已新增下载配置')
  } else if (mode === 'publish' && matchedRow.value) {
    applyFormToRow(matchedRow.value, true)
    showPcToast('已发布新版本')
  } else if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      const shouldHistory = versionChanged(target.versionNumber) || urlChanged
      applyFormToRow(target, shouldHistory)
    }
    showPcToast('保存成功')
  }
  formVisible.value = false
}

function requestSave() {
  if (formMode.value === 'edit' && matchedRow.value) {
    formError.value = '该应用、终端、包分类已有配置，请直接编辑那一条'
    return
  }
  const currentVersion = saveMode.value === 'publish'
    ? matchedRow.value?.versionNumber ?? null
    : saveMode.value === 'edit'
      ? rows.value.find((row) => row.id === editingId.value)?.versionNumber ?? null
      : null
  const message = validateAppPackageForm(form.value, saveMode.value, currentVersion)
  formError.value = message
  if (message) return

  if (saveMode.value === 'publish' && matchedRow.value) {
    const row = matchedRow.value
    openConfirm(
      '发布新版本',
      `「${row.appName} / ${APP_TERMINAL_LABEL[row.terminal]} / ${APP_CATEGORY_LABEL[row.category]}」已有 v${row.versionNumber}。发布新版本将覆盖当前配置，并把旧版本写入历史。`,
      '发布新版本',
      commitSave,
    )
    return
  }

  if (saveMode.value === 'edit' && form.value.downloadUrl.trim() !== originalDownloadUrl.value.trim()) {
    openConfirm('修改下载链接', '确定要修改下载链接吗？线上用户将按新链接下载。', '确认修改', commitSave)
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
  const identity = appPackageIdentity(row)
  rows.value.forEach((item) => {
    if (item.id !== row.id && item.status === 'enabled' && appPackageIdentity(item) === identity) {
      item.status = 'disabled'
      item.updatedAt = row.updatedAt
      item.operator = CURRENT_APP_PACKAGE_OPERATOR
    }
  })
  showPcToast('已启用该包')
}

function requestDelete(row: AppPackageRow) {
  if (row.history.length) return
  openConfirm('删除下载配置', `确定删除「${row.appName}」的${APP_TERMINAL_LABEL[row.terminal]}${APP_CATEGORY_LABEL[row.category]}吗？删除后不可恢复。`, '删除', () => {
    rows.value = rows.value.filter((item) => item.id !== row.id)
    if (historyRow.value?.id === row.id) historyRow.value = null
    showPcToast('已删除')
  })
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

function openHistory(row: AppPackageRow) {
  historyRow.value = row
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
  openConfirm('回滚版本', `确定回滚到 v${item.versionNumber} 吗？当前版本会写入历史。`, '回滚', () => {
    const current = snapshotAppPackage(row)
    row.history = [current, ...row.history.filter((history) => history.id !== historyId)]
    row.versionNumber = item.versionNumber
    row.downloadUrl = item.downloadUrl
    row.plistUrl = item.plistUrl
    row.updateMode = item.updateMode
    row.updateLog = item.updateLog
    row.status = 'enabled'
    row.updatedAt = formatAppPackageNow()
    row.operator = CURRENT_APP_PACKAGE_OPERATOR
    showPcToast(`已回滚至 v${item.versionNumber}`)
  })
}

function setTerminal(value: AppTerminal) {
  form.value.terminal = value
  formError.value = ''
}

function setCategory(value: AppPackageCategory) {
  form.value.category = value
  formError.value = ''
}

function setUpdateMode(value: AppUpdateMode) {
  form.value.updateMode = value
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
        <span class="wf-toolbar__actions wf-action-with-spec">
          <button type="button" class="wf-btn wf-btn--add" @click="openAdd">新增下载配置</button>
          <WfSpecAnnot
            :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.add.no"
            :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.add.title"
            :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.add.items]"
          />
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--app-pkg">
          <thead>
            <tr>
              <th class="wf-th">应用/包名称</th>
              <th class="wf-th">终端</th>
              <th class="wf-th">包分类</th>
              <th class="wf-th">版本号</th>
              <th class="wf-th wf-th--with-spec">
                下载链接
                <WfSpecAnnot
                  :no="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.no"
                  :title="APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.title"
                  :items="[...APP_PACKAGE_DOWNLOAD_ANNOT_MAP.download.items]"
                />
              </th>
              <th class="wf-th">更新模式</th>
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
              <td colspan="10" class="wf-td wf-td--empty">暂无符合条件的下载配置</td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id">
              <td class="wf-td">
                <div class="wf-app-pkg-name">
                  <span class="wf-app-pkg-mark">{{ row.appName.slice(0, 1) }}</span>
                  <span>{{ row.appName }}</span>
                </div>
              </td>
              <td class="wf-td">
                <span class="wf-app-pkg-terminal" :class="`wf-app-pkg-terminal--${row.terminal}`">
                  {{ APP_TERMINAL_LABEL[row.terminal] }}
                </span>
              </td>
              <td class="wf-td">
                <span class="wf-app-pkg-cat" :class="`wf-app-pkg-cat--${row.category}`">
                  {{ APP_CATEGORY_LABEL[row.category] }}
                </span>
              </td>
              <td class="wf-td wf-td--nowrap">v{{ row.versionNumber }}</td>
              <td class="wf-td">
                <div class="wf-app-pkg-url">
                  <span>{{ row.downloadUrl }}</span>
                  <button type="button" class="wf-link-action" @click="copyDownload(row.downloadUrl)">复制</button>
                </div>
              </td>
              <td class="wf-td">
                <span class="wf-app-pkg-mode" :class="`wf-app-pkg-mode--${row.updateMode}`">
                  {{ APP_UPDATE_LABEL[row.updateMode] }}
                </span>
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
                  type="button"
                  class="wf-app-pkg-switch"
                  :class="{ 'wf-app-pkg-switch--on': row.status === 'enabled' }"
                  :aria-pressed="row.status === 'enabled'"
                  :aria-label="row.status === 'enabled' ? '停用' : '启用'"
                  @click="requestToggle(row)"
                />
              </td>
              <td class="wf-td">{{ row.updatedAt }}（{{ row.operator }}）</td>
              <td class="wf-td wf-td--nowrap">
                <button type="button" class="wf-link-action" @click="openEdit(row)">编辑</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action wf-link-action--danger"
                  :disabled="row.history.length > 0"
                  :title="row.history.length ? '已有历史版本，不可删除' : ''"
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
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="formVisible" class="wf-modal-mask" @click.self="closeForm">
        <div class="wf-modal wf-modal--scroll wf-modal--detail-wide" role="dialog" aria-modal="true">
          <div class="wf-modal__header">
            <h3 class="wf-modal__title wf-modal__title--with-spec">
              {{ formMode === 'add' ? '新增下载配置' : '编辑下载配置' }}
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
              <span class="wf-form-row__label wf-form-row__label--required">终端</span>
              <div class="wf-app-pkg-radios">
                <label><input :checked="form.terminal === 'ios'" type="radio" name="pkg-terminal" @change="setTerminal('ios')" /> iOS</label>
                <label><input :checked="form.terminal === 'android'" type="radio" name="pkg-terminal" @change="setTerminal('android')" /> Android</label>
              </div>
            </div>
            <div class="wf-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">包分类</span>
              <div>
                <div class="wf-app-pkg-radios">
                  <label><input :checked="form.category === 'super'" type="radio" name="pkg-category" @change="setCategory('super')" /> 超签包</label>
                  <label><input :checked="form.category === 'chat'" type="radio" name="pkg-category" @change="setCategory('chat')" /> 纯聊包</label>
                  <label><input :checked="form.category === 'store'" type="radio" name="pkg-category" @change="setCategory('store')" /> 上架包</label>
                </div>
                <p v-if="form.category === 'super' && form.terminal === 'android'" class="wf-form-row__hint">超签包只适用于 iOS。</p>
                <p v-else-if="saveMode === 'publish' && matchedRow" class="wf-form-row__hint">
                  该组合已有 v{{ matchedRow.versionNumber }}，保存将发布为新版本并覆盖。
                </p>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">当前版本号</label>
              <input v-model="form.versionNumber" type="text" class="wf-input" placeholder="1.0.3" />
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">下载链接</label>
              <input v-model="form.downloadUrl" type="text" class="wf-input wf-input--full" placeholder="https://" />
            </div>
            <div v-if="plistVisible" class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">Plist 链接</label>
              <div>
                <input v-model="form.plistUrl" type="text" class="wf-input wf-input--full" placeholder="https://example.com/manifest.plist" />
                <p class="wf-form-row__hint">用于触发 iOS 安装，须以 .plist 结尾，或以 itms-services:// 开头。</p>
              </div>
            </div>
            <div class="wf-form-row">
              <span class="wf-form-row__label wf-form-row__label--required">更新模式</span>
              <div class="wf-app-pkg-radios">
                <label><input :checked="form.updateMode === 'optional'" type="radio" name="pkg-update" @change="setUpdateMode('optional')" /> 弱更新</label>
                <label><input :checked="form.updateMode === 'force'" type="radio" name="pkg-update" @change="setUpdateMode('force')" /> 强更新</label>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label">更新日志</label>
              <textarea v-model="form.updateLog" class="wf-input wf-app-pkg-textarea" rows="3" placeholder="客户端检查更新时展示的文案" />
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
              {{ saveMode === 'publish' ? '发布新版本' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="historyRow" class="wf-modal-mask" @click.self="closeHistory">
        <div class="wf-modal wf-modal--scroll wf-modal--detail-wide" role="dialog" aria-modal="true">
          <div class="wf-modal__header">
            <h3 class="wf-modal__title">
              {{ historyRow.appName }} · {{ APP_TERMINAL_LABEL[historyRow.terminal] }} · {{ APP_CATEGORY_LABEL[historyRow.category] }} 历史版本
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeHistory">×</button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-table-wrap">
              <table class="wf-table">
                <thead>
                  <tr>
                    <th class="wf-th">版本号</th>
                    <th class="wf-th">下载链接</th>
                    <th class="wf-th">更新模式</th>
                    <th class="wf-th">更新日志</th>
                    <th class="wf-th">操作人</th>
                    <th class="wf-th">更新时间</th>
                    <th class="wf-th">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="historyRow.history.length === 0">
                    <td colspan="7" class="wf-td wf-td--empty">暂无历史版本</td>
                  </tr>
                  <tr v-for="item in historyRow.history" :key="item.id">
                    <td class="wf-td wf-td--nowrap">v{{ item.versionNumber }}</td>
                    <td class="wf-td">{{ item.downloadUrl }}</td>
                    <td class="wf-td">{{ APP_UPDATE_LABEL[item.updateMode] }}</td>
                    <td class="wf-td">{{ item.updateLog || '—' }}</td>
                    <td class="wf-td">{{ item.operator }}</td>
                    <td class="wf-td wf-td--nowrap">{{ item.updatedAt }}</td>
                    <td class="wf-td wf-td--nowrap">
                      <button type="button" class="wf-link-action" @click="requestRollback(item.id)">回滚至此版本</button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
