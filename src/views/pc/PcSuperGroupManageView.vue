<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import '../../styles/pc-wireframe.css'

type SuperGroupStatus = 'normal' | 'frozen' | 'dissolved'

type ConfigItemKey = 'floating_link' | 'pinned_game' | 'floating_game'

type ConfigPanelFields = {
  currencies: string[]
  languages: string[]
  nameZhCn: string
  nameZhTw: string
  miniProgram: string
  product: string
  sortOrder: string
  enabled: boolean
  suffixAddress: string
  icon: string
}

type FloatingLinkFields = {
  titleZhCn: string
  titleZhTw: string
  titleEn: string
  titleTh: string
  titleVi: string
  url: string
  icon: string
}

type SuperGroupEditConfig = {
  configItems: ConfigItemKey[]
  pinnedGame: ConfigPanelFields
  floatingLink: FloatingLinkFields
  floatingGame: ConfigPanelFields
}

type SuperGroupRow = {
  id: number
  name: string
  groupId: string
  memberCount: number
  ownerName: string
  ownerId: string
  creatorName: string
  creatorId: string
  status: SuperGroupStatus
  createdAt: string
  edit: SuperGroupEditConfig
}

const CURRENCY_OPTIONS = ['KKC', 'KKV', 'USDT-TRON', 'X币'] as const
const LANGUAGE_OPTIONS = ['中文', '繁体', '英文', '越南文', '泰文'] as const

const CONFIG_ITEM_OPTIONS: { value: ConfigItemKey; label: string }[] = [
  { value: 'pinned_game', label: '置顶游戏' },
  { value: 'floating_link', label: '悬浮链接' },
  { value: 'floating_game', label: '悬浮游戏' },
]

const MINI_PROGRAM_OPTIONS = [
  { value: '', label: '请选择小程序' },
  { value: 'kk_live', label: 'KK直播小程序' },
  { value: 'community_helper', label: '社群助手' },
  { value: 'activity_square', label: '活动广场' },
] as const

const PRODUCT_OPTIONS = [
  { value: '', label: '请选择产品' },
  { value: 'kk_live', label: 'KK直播' },
  { value: 'kk_wallet', label: 'KK钱包' },
  { value: 'activity_center', label: '活动中心' },
] as const

function createDefaultPanel(overrides: Partial<ConfigPanelFields> = {}): ConfigPanelFields {
  return {
    currencies: [],
    languages: ['中文', '繁体'],
    nameZhCn: '',
    nameZhTw: '',
    miniProgram: '',
    product: '',
    sortOrder: '1',
    enabled: true,
    suffixAddress: '',
    icon: '',
    ...overrides,
  }
}

function createDefaultFloatingLink(overrides: Partial<FloatingLinkFields> = {}): FloatingLinkFields {
  return {
    titleZhCn: '',
    titleZhTw: '',
    titleEn: '',
    titleTh: '',
    titleVi: '',
    url: '',
    icon: '',
    ...overrides,
  }
}

function createDefaultEditConfig(overrides: Partial<SuperGroupEditConfig> = {}): SuperGroupEditConfig {
  return {
    configItems: [],
    pinnedGame: createDefaultPanel(),
    floatingLink: createDefaultFloatingLink(),
    floatingGame: createDefaultPanel(),
    ...overrides,
  }
}

function clonePanel(panel: ConfigPanelFields): ConfigPanelFields {
  return {
    ...panel,
    currencies: [...panel.currencies],
    languages: [...panel.languages],
  }
}

function cloneEditConfig(config: SuperGroupEditConfig): SuperGroupEditConfig {
  return {
    configItems: [...config.configItems],
    pinnedGame: clonePanel(config.pinnedGame),
    floatingLink: { ...config.floatingLink },
    floatingGame: clonePanel(config.floatingGame),
  }
}

function gamePanelConfig(key: ConfigItemKey, form: SuperGroupEditConfig): ConfigPanelFields {
  if (key === 'floating_game') return form.floatingGame
  return form.pinnedGame
}

const STATUS_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'normal', label: '正常' },
  { value: 'frozen', label: '已冻结' },
  { value: 'dissolved', label: '已解散' },
] as const

const filter = ref({
  groupId: '',
  ownerId: '',
  creatorId: '',
  createdStart: '',
  createdEnd: '',
  status: '' as '' | SuperGroupStatus,
})

const sourceRows = ref<SuperGroupRow[]>([
  {
    id: 1,
    name: 'You',
    groupId: '2662058052844112809',
    memberCount: 1,
    ownerName: 'Hj888',
    ownerId: '4710359942108371055',
    creatorName: 'Hj888',
    creatorId: '4710359942108371055',
    status: 'normal',
    createdAt: '2026-05-28 14:22:10',
    edit: createDefaultEditConfig({
      configItems: ['pinned_game'],
      pinnedGame: createDefaultPanel({
        currencies: ['KKC', 'USDT-TRON'],
        nameZhCn: 'You 社群',
        nameZhTw: 'You 社群',
        miniProgram: 'kk_live',
        product: 'kk_live',
        sortOrder: '2',
        suffixAddress: 'you-group',
      }),
    }),
  },
  {
    id: 2,
    name: "I'll",
    groupId: '2825734960101539870',
    memberCount: 1,
    ownerName: 'Feature1',
    ownerId: '4179787047017586694',
    creatorName: 'Feature1',
    creatorId: '4179787047017586694',
    status: 'normal',
    createdAt: '2026-05-27 09:15:33',
    edit: createDefaultEditConfig({
      configItems: ['floating_link', 'pinned_game'],
      pinnedGame: createDefaultPanel({
        languages: ['中文', '英文'],
        nameZhCn: "I'll 社群",
        sortOrder: '3',
      }),
      floatingLink: createDefaultFloatingLink({
        titleZhCn: "I'll 客服",
        titleZhTw: "I'll 客服",
        titleEn: "I'll Support",
        titleTh: 'ฝ่ายบริการ',
        titleVi: 'Chăm sóc khách hàng',
        url: 'https://support.kk.example/ill',
        icon: 'https://cdn.kk.example/icon/support.png',
      }),
    }),
  },
  {
    id: 3,
    name: 'H5测试',
    groupId: '2823314448703320074',
    memberCount: 2,
    ownerName: '1bb8883333',
    ownerId: '3485197927430602751',
    creatorName: '1bb8883333',
    creatorId: '3485197927430602751',
    status: 'normal',
    createdAt: '2026-05-26 18:40:02',
    edit: createDefaultEditConfig({
      configItems: ['pinned_game', 'floating_game'],
      pinnedGame: createDefaultPanel({
        nameZhCn: '超级群测试06',
        nameZhTw: '超級群測試06',
        miniProgram: 'community_helper',
        product: 'activity_center',
        sortOrder: '1',
        suffixAddress: 'h5-test-06',
      }),
      floatingGame: createDefaultPanel({
        nameZhCn: '超级群测试06',
        nameZhTw: '超級群測試06',
        miniProgram: 'community_helper',
        product: 'activity_center',
        sortOrder: '2',
        suffixAddress: 'h5-float-game',
        icon: 'https://cdn.kk.example/icon/float-game.png',
      }),
    }),
  },
  {
    id: 4,
    name: '889',
    groupId: '3485197927430602751',
    memberCount: 2,
    ownerName: 'Feature1',
    ownerId: '4179787047017586694',
    creatorName: 'Feature1',
    creatorId: '4179787047017586694',
    status: 'frozen',
    createdAt: '2026-05-25 11:08:47',
    edit: createDefaultEditConfig({
      configItems: ['pinned_game'],
      pinnedGame: createDefaultPanel({
        currencies: ['KKV'],
        languages: ['中文'],
        enabled: false,
        sortOrder: '4',
      }),
    }),
  },
  {
    id: 5,
    name: '直播粉丝群',
    groupId: '3198821044556677889',
    memberCount: 128,
    ownerName: 'dx01',
    ownerId: '3180664521199420635',
    creatorName: 'ruby',
    creatorId: '76',
    status: 'normal',
    createdAt: '2026-05-20 20:05:15',
    edit: createDefaultEditConfig({
      configItems: ['pinned_game'],
      pinnedGame: createDefaultPanel({
        currencies: ['KKC', 'KKV', 'USDT-TRON'],
        languages: ['中文', '繁体', '英文'],
        nameZhCn: '直播粉丝群',
        nameZhTw: '直播粉絲群',
        miniProgram: 'kk_live',
        product: 'kk_live',
        sortOrder: '1',
        suffixAddress: 'live-fans',
      }),
    }),
  },
  {
    id: 6,
    name: '活动通知群',
    groupId: '3198821044556677890',
    memberCount: 56,
    ownerName: 'wade',
    ownerId: '3180664521199420636',
    creatorName: 'Wade',
    creatorId: '103',
    status: 'dissolved',
    createdAt: '2026-05-18 16:30:44',
    edit: createDefaultEditConfig({
      configItems: ['pinned_game'],
      pinnedGame: createDefaultPanel({
        enabled: false,
        sortOrder: '5',
      }),
    }),
  },
])

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(end + 'T23:59:59').getTime()) return false
  return true
}

function matchRow(row: SuperGroupRow) {
  const f = filter.value
  if (f.groupId && !row.groupId.includes(f.groupId.trim())) return false
  if (f.ownerId && !row.ownerId.includes(f.ownerId.trim())) return false
  if (f.creatorId && !row.creatorId.includes(f.creatorId.trim())) return false
  if (f.status && row.status !== f.status) return false
  if (!inRange(row.createdAt, f.createdStart, f.createdEnd)) return false
  return true
}

const tableRows = computed(() => sourceRows.value.filter(matchRow))

function resetFilter() {
  filter.value = {
    groupId: '',
    ownerId: '',
    creatorId: '',
    createdStart: '',
    createdEnd: '',
    status: '',
  }
}

function exportRows() {
  window.alert(`演示：导出 ${tableRows.value.length} 条超级群记录`)
}

function openDetail(row: SuperGroupRow) {
  window.alert(`演示：查看超级群「${row.name}」详情\n超级群ID：${row.groupId}`)
}

const editVisible = ref(false)
const editingRow = ref<SuperGroupRow | null>(null)
const editForm = ref<SuperGroupEditConfig>(createDefaultEditConfig())
const editHint = ref('')
const editConfigTab = ref<ConfigItemKey>('pinned_game')
const floatingLinkIconInputRef = ref<HTMLInputElement | null>(null)
const gamePanelIconInputRef = ref<HTMLInputElement | null>(null)

function revokeIconIfBlob(icon: string) {
  if (icon.startsWith('blob:')) {
    URL.revokeObjectURL(icon)
  }
}

const visibleConfigTabs = computed(() =>
  CONFIG_ITEM_OPTIONS.filter((opt) => editForm.value.configItems.includes(opt.value)),
)

const activePanel = computed(() => {
  if (editConfigTab.value === 'floating_game') return editForm.value.floatingGame
  return editForm.value.pinnedGame
})

watch(
  () => editForm.value.configItems,
  (items) => {
    if (!items.length) return
    if (!items.includes(editConfigTab.value)) {
      editConfigTab.value = items[0]
    }
  },
  { deep: true },
)

function openEdit(row: SuperGroupRow) {
  editingRow.value = row
  editForm.value = cloneEditConfig(row.edit)
  editConfigTab.value = row.edit.configItems[0] ?? 'pinned_game'
  editHint.value = ''
  editVisible.value = true
}

function closeEdit() {
  revokeIconIfBlob(editForm.value.floatingLink.icon)
  revokeIconIfBlob(editForm.value.pinnedGame.icon)
  revokeIconIfBlob(editForm.value.floatingGame.icon)
  editVisible.value = false
  editingRow.value = null
  editHint.value = ''
}

function hasFloatingLinkIcon() {
  return !!editForm.value.floatingLink.icon.trim()
}

function triggerFloatingLinkIconUpload() {
  floatingLinkIconInputRef.value?.click()
}

function onFloatingLinkIconChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    editHint.value = '请上传图片格式的 icon'
    input.value = ''
    return
  }

  revokeIconIfBlob(editForm.value.floatingLink.icon)
  editForm.value.floatingLink.icon = URL.createObjectURL(file)
  editHint.value = ''
  input.value = ''
}

function removeFloatingLinkIcon() {
  revokeIconIfBlob(editForm.value.floatingLink.icon)
  editForm.value.floatingLink.icon = ''
}

function hasActivePanelIcon() {
  return !!activePanel.value.icon.trim()
}

function triggerActivePanelIconUpload() {
  gamePanelIconInputRef.value?.click()
}

function onActivePanelIconChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    editHint.value = '请上传图片格式的 icon'
    input.value = ''
    return
  }

  revokeIconIfBlob(activePanel.value.icon)
  activePanel.value.icon = URL.createObjectURL(file)
  editHint.value = ''
  input.value = ''
}

function removeActivePanelIcon() {
  revokeIconIfBlob(activePanel.value.icon)
  activePanel.value.icon = ''
}

function togglePanelCurrency(currency: string) {
  const list = activePanel.value.currencies
  const index = list.indexOf(currency)
  if (index >= 0) {
    list.splice(index, 1)
  } else {
    list.push(currency)
  }
}

function isPanelCurrencyChecked(currency: string) {
  return activePanel.value.currencies.includes(currency)
}

function togglePanelLanguage(language: string) {
  const list = activePanel.value.languages
  const index = list.indexOf(language)
  if (index >= 0) {
    list.splice(index, 1)
  } else {
    list.push(language)
  }
}

function isPanelLanguageChecked(language: string) {
  return activePanel.value.languages.includes(language)
}

function isConfigItemChecked(key: ConfigItemKey) {
  return editForm.value.configItems.includes(key)
}

function toggleConfigItem(key: ConfigItemKey) {
  const list = editForm.value.configItems
  const index = list.indexOf(key)
  if (index >= 0) {
    list.splice(index, 1)
  } else {
    list.push(key)
    editConfigTab.value = key
  }
}

function validatePanel(panel: ConfigPanelFields, label: string, requireIcon = false): string | null {
  if (!panel.languages.length) return `${label}：请至少选择一种支持语种`
  if (requireIcon && !panel.icon.trim()) return `${label}：请上传 icon`
  return null
}

function validateFloatingLink(link: FloatingLinkFields): string | null {
  if (!link.titleZhCn.trim()) return '悬浮链接：请输入标题中文'
  if (!link.titleZhTw.trim()) return '悬浮链接：请输入标题繁体'
  if (!link.titleEn.trim()) return '悬浮链接：请输入标题英文'
  if (!link.titleTh.trim()) return '悬浮链接：请输入标题泰语'
  if (!link.titleVi.trim()) return '悬浮链接：请输入标题越南语'
  if (!link.url.trim()) return '悬浮链接：请输入跳转地址'
  if (!link.icon.trim()) return '悬浮链接：请上传 icon'
  return null
}

function confirmEdit() {
  if (!editingRow.value) return

  for (const key of editForm.value.configItems) {
    const label = CONFIG_ITEM_OPTIONS.find((opt) => opt.value === key)?.label ?? ''
    const error =
      key === 'floating_link'
        ? validateFloatingLink(editForm.value.floatingLink)
        : validatePanel(gamePanelConfig(key, editForm.value), label, key === 'floating_game')
    if (error) {
      editHint.value = error
      editConfigTab.value = key
      return
    }
  }

  editingRow.value.edit = cloneEditConfig(editForm.value)
  closeEdit()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">超级群ID：</label>
        <input v-model="filter.groupId" type="text" class="wf-input" placeholder="请输入群组ID" />

        <label class="wf-label">群主ID：</label>
        <input v-model="filter.ownerId" type="text" class="wf-input" placeholder="请输入群主ID" />

        <label class="wf-label">创建人ID：</label>
        <input v-model="filter.creatorId" type="text" class="wf-input" placeholder="请输入创建人ID" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">创建时间：</label>
        <input v-model="filter.createdStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.createdEnd" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">超级群状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option v-for="opt in STATUS_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
          <button type="button" class="wf-btn super-group-export-btn" @click="exportRows">导出</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--super-group">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">超级群名称</th>
              <th class="wf-th wf-th--group-id">超级群ID</th>
              <th class="wf-th wf-th--center">成员数量</th>
              <th class="wf-th">群主名称</th>
              <th class="wf-th wf-th--user-id">群主ID</th>
              <th class="wf-th">创建人名称</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.name }}</td>
              <td class="wf-td wf-td--group-id">{{ row.groupId }}</td>
              <td class="wf-td wf-td--center">{{ row.memberCount }}</td>
              <td class="wf-td">{{ row.ownerName }}</td>
              <td class="wf-td wf-td--user-id">{{ row.ownerId }}</td>
              <td class="wf-td">{{ row.creatorName }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openDetail(row)">查看详情</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="openEdit(row)">编辑</button>
              </td>
            </tr>
            <tr v-if="tableRows.length === 0">
              <td colspan="8" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-pagination__info">共 {{ tableRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="editVisible && editingRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeEdit"
      >
        <div
          class="wf-modal wf-modal--super-group-edit"
          role="dialog"
          aria-labelledby="super-group-edit-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="super-group-edit-title" class="wf-modal__title">编辑超级群</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeEdit">×</button>
          </div>
          <div class="wf-modal__body">
            <form class="super-group-edit-form" @submit.prevent="confirmEdit">
              <div class="wf-form-row">
                <label class="wf-form-row__label">配置项</label>
                <div class="super-group-check-group">
                  <label
                    v-for="opt in CONFIG_ITEM_OPTIONS"
                    :key="opt.value"
                    class="super-group-check"
                  >
                    <input
                      type="checkbox"
                      :checked="isConfigItemChecked(opt.value)"
                      @change="toggleConfigItem(opt.value)"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>
              </div>

              <div v-if="visibleConfigTabs.length" class="super-group-config-tabs">
                <div class="wf-tabs super-group-config-tabs__bar">
                  <button
                    v-for="tab in visibleConfigTabs"
                    :key="tab.value"
                    type="button"
                    class="wf-tab"
                    :class="{ 'wf-tab--active': editConfigTab === tab.value }"
                    @click="editConfigTab = tab.value"
                  >
                    {{ tab.label }}
                  </button>
                </div>

                <div class="super-group-config-tabs__panel super-group-panel-form">
                  <template v-if="editConfigTab === 'floating_link'">
                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">标题中文</label>
                      <input
                        v-model="editForm.floatingLink.titleZhCn"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入标题中文"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">标题繁体</label>
                      <input
                        v-model="editForm.floatingLink.titleZhTw"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入标题繁体"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">标题英文</label>
                      <input
                        v-model="editForm.floatingLink.titleEn"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入标题英文"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">标题泰语</label>
                      <input
                        v-model="editForm.floatingLink.titleTh"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入标题泰语"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">标题越南语</label>
                      <input
                        v-model="editForm.floatingLink.titleVi"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入标题越南语"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">跳转地址</label>
                      <input
                        v-model="editForm.floatingLink.url"
                        type="text"
                        class="wf-input wf-input--full"
                        placeholder="请输入跳转地址"
                      />
                    </div>

                    <div class="wf-form-row">
                      <label class="wf-form-row__label wf-form-row__label--required">icon</label>
                      <div class="super-group-icon-upload">
                        <input
                          ref="floatingLinkIconInputRef"
                          type="file"
                          accept="image/*"
                          class="super-group-icon-upload__input"
                          @change="onFloatingLinkIconChange"
                        />
                        <div v-if="hasFloatingLinkIcon()" class="super-group-icon-upload__preview">
                          <img
                            :src="editForm.floatingLink.icon"
                            alt="icon 预览"
                            class="super-group-icon-upload__image"
                          />
                          <div class="super-group-icon-upload__actions">
                            <button
                              type="button"
                              class="wf-btn wf-btn--default wf-btn--sm"
                              @click="triggerFloatingLinkIconUpload"
                            >
                              重新上传
                            </button>
                            <button type="button" class="wf-link-del" @click="removeFloatingLinkIcon">
                              移除
                            </button>
                          </div>
                        </div>
                        <button
                          v-else
                          type="button"
                          class="super-group-icon-upload__trigger"
                          @click="triggerFloatingLinkIconUpload"
                        >
                          <span class="super-group-icon-upload__plus" aria-hidden="true">+</span>
                          <span>点击上传</span>
                        </button>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="editConfigTab === 'pinned_game' || editConfigTab === 'floating_game'">
                  <div class="wf-form-row">
                    <label class="wf-form-row__label">支持币种</label>
                    <div class="super-group-check-group">
                      <label
                        v-for="currency in CURRENCY_OPTIONS"
                        :key="currency"
                        class="super-group-check"
                      >
                        <input
                          type="checkbox"
                          :checked="isPanelCurrencyChecked(currency)"
                          @change="togglePanelCurrency(currency)"
                        />
                        <span>{{ currency }}</span>
                      </label>
                    </div>
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label wf-form-row__label--required">支持语种</label>
                    <div class="super-group-check-group">
                      <label
                        v-for="language in LANGUAGE_OPTIONS"
                        :key="language"
                        class="super-group-check"
                      >
                        <input
                          type="checkbox"
                          :checked="isPanelLanguageChecked(language)"
                          @change="togglePanelLanguage(language)"
                        />
                        <span>{{ language }}</span>
                      </label>
                    </div>
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label">名称（简体中文）</label>
                    <input
                      v-model="activePanel.nameZhCn"
                      type="text"
                      class="wf-input wf-input--full"
                      placeholder="请输入"
                    />
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label">名称（繁体中文）</label>
                    <input
                      v-model="activePanel.nameZhTw"
                      type="text"
                      class="wf-input wf-input--full"
                      placeholder="请输入"
                    />
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label">小程序</label>
                    <select v-model="activePanel.miniProgram" class="wf-select wf-select--full">
                      <option
                        v-for="opt in MINI_PROGRAM_OPTIONS"
                        :key="opt.value || 'empty'"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label">产品</label>
                    <select v-model="activePanel.product" class="wf-select wf-select--full">
                      <option
                        v-for="opt in PRODUCT_OPTIONS"
                        :key="opt.value || 'empty'"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>

                  <div class="wf-form-row">
                    <label class="wf-form-row__label">后缀地址</label>
                    <input
                      v-model="activePanel.suffixAddress"
                      type="text"
                      class="wf-input wf-input--full"
                      placeholder="请输入后缀地址"
                    />
                  </div>

                  <div v-if="editConfigTab === 'floating_game'" class="wf-form-row">
                    <label class="wf-form-row__label wf-form-row__label--required">icon</label>
                    <div class="super-group-icon-upload">
                      <input
                        ref="gamePanelIconInputRef"
                        type="file"
                        accept="image/*"
                        class="super-group-icon-upload__input"
                        @change="onActivePanelIconChange"
                      />
                      <div v-if="hasActivePanelIcon()" class="super-group-icon-upload__preview">
                        <img
                          :src="activePanel.icon"
                          alt="icon 预览"
                          class="super-group-icon-upload__image"
                        />
                        <div class="super-group-icon-upload__actions">
                          <button
                            type="button"
                            class="wf-btn wf-btn--default wf-btn--sm"
                            @click="triggerActivePanelIconUpload"
                          >
                            重新上传
                          </button>
                          <button type="button" class="wf-link-del" @click="removeActivePanelIcon">
                            移除
                          </button>
                        </div>
                      </div>
                      <button
                        v-else
                        type="button"
                        class="super-group-icon-upload__trigger"
                        @click="triggerActivePanelIconUpload"
                      >
                        <span class="super-group-icon-upload__plus" aria-hidden="true">+</span>
                        <span>点击上传</span>
                      </button>
                    </div>
                  </div>
                  </template>
                </div>
              </div>

              <p v-if="editHint" class="wf-modal__hint">{{ editHint }}</p>
            </form>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeEdit">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmEdit">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.super-group-export-btn {
  color: #d46b08;
  background: #fff7e6;
  border-color: #ffd591;
}

.super-group-export-btn:hover {
  color: #ad4e00;
  background: #ffe7ba;
  border-color: #ffc069;
}

.wf-td--group-id,
.wf-th--group-id {
  min-width: 180px;
}

.wf-td--user-id,
.wf-th--user-id {
  min-width: 180px;
}

.wf-modal--super-group-edit {
  max-width: 560px;
}

.super-group-config-tabs {
  margin-bottom: 4px;
}

.super-group-config-tabs__bar {
  margin-bottom: 0;
}

.super-group-config-tabs__panel {
  padding: 16px 12px 4px;
  border: 1px solid var(--pc-border-light);
  border-top: none;
  background: #fff;
}

.super-group-panel-form .wf-form-row:last-child {
  margin-bottom: 0;
}

.super-group-edit-form {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.super-group-edit-form .wf-form-row,
.super-group-panel-form .wf-form-row {
  grid-template-columns: 132px 1fr;
}

.super-group-edit-form .wf-form-row:has(.super-group-check-group),
.super-group-panel-form .wf-form-row:has(.super-group-check-group) {
  align-items: start;
}

.super-group-check-group,
.super-group-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding-top: 6px;
}

.super-group-check,
.super-group-radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--pc-font-size);
  color: var(--pc-text);
  cursor: pointer;
}

.super-group-check input,
.super-group-radio input {
  margin: 0;
  cursor: pointer;
}

.super-group-icon-upload__input {
  display: none;
}

.super-group-icon-upload__trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 96px;
  height: 96px;
  padding: 8px;
  color: var(--pc-text-secondary);
  background: #fafafa;
  border: 1px dashed var(--pc-border);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.super-group-icon-upload__trigger:hover {
  color: var(--pc-primary);
  border-color: var(--pc-primary);
}

.super-group-icon-upload__plus {
  font-size: 28px;
  line-height: 1;
  font-weight: 300;
}

.super-group-icon-upload__preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.super-group-icon-upload__image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border: 1px solid var(--pc-border-light);
  border-radius: 4px;
  background: #fff;
}

.super-group-icon-upload__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.wf-btn--sm {
  padding: 4px 12px;
  font-size: 13px;
}
</style>
