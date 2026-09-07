<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import WfGamePickerBox from '../../components/wireframe/WfGamePickerBox.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import { LIVE_ANCHOR_LIST_ANNOT_MAP } from '../../constants/liveAnchorListSpec'
import {
  ANCHOR_BAN_STATUS_OPTIONS,
  ANCHOR_CHANNELS,
  ANCHOR_CHANNEL_PAGE_SIZE,
  ANCHOR_LIVE_STATUS_OPTIONS,
  ANCHOR_METRIC_SOURCE_OPTIONS,
  DEFAULT_HEAT_PREVIEW,
  HEAT_PREVIEW_BY_PRESET,
  METRIC_PRESETS,
  METRIC_PRESET_OPTIONS,
  anchorBanStatusLabel,
  anchorLiveStatusLabel,
  anchorMetricSourceLabel,
  cloneMetricConfig,
  createDefaultMetricConfig,
  effectiveMetricConfig,
  filterAnchorChannels,
  formatAnchorTag,
  formatGiftShare,
  formatRange,
  liveAnchorGlobalConfig,
  liveAnchorStore,
  metricPresetLabel,
  previewHeat,
  type AnchorBanStatus,
  type AnchorLiveStatus,
  type AnchorMetricConfig,
  type AnchorMetricSource,
  type HeatPreviewInput,
  type LiveAnchorRow,
  type MetricPreset,
  type MetricRange,
} from '../../constants/liveAnchorMetric'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  id: string
  roomId: string
  nickname: string
  liveStatus: '' | AnchorLiveStatus
  banStatus: '' | AnchorBanStatus
  source: '' | AnchorMetricSource
  channelId: string
}

type ModalKind = 'global' | 'anchor'

const defaultFilter = (): ListFilter => ({
  id: '',
  roomId: '',
  nickname: '',
  liveStatus: '',
  banStatus: '',
  source: '',
  channelId: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const modalKind = ref<ModalKind | null>(null)
const editingId = ref<string | null>(null)
const formSource = ref<AnchorMetricSource>('global')
const form = ref<AnchorMetricConfig>(createDefaultMetricConfig())
const formHint = ref('')
const heatSample = ref<HeatPreviewInput>({ ...DEFAULT_HEAT_PREVIEW })

const globalBaseAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.globalBase
const globalAdvancedAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.globalAdvanced
const filterAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.filter
const listAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.list
const metricDisplayAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.metricDisplay
const sourceAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.sourceAndBase
const anchorAdvancedAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.anchorAdvanced
const presetAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.preset
const channelAuthAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.channelAuth
const gameAuthAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.gameAuth
const applyingPreset = ref(false)
const channelRowId = ref<string | null>(null)
const channelKeyword = ref('')
const channelAppliedKeyword = ref('')
const channelDraftIds = ref<string[]>([])
const channelPage = ref(1)
const channelHint = ref('')
const gameRowId = ref<string | null>(null)
const gameKeyword = ref('')
const gameAppliedKeyword = ref('')
const gameDraftIds = ref<string[]>([])
const gameHint = ref('')

const modalVisible = computed(() => modalKind.value !== null)
const isGlobalModal = computed(() => modalKind.value === 'global')
const formReadonly = computed(() => modalKind.value === 'anchor' && formSource.value === 'global')
const modalTitle = computed(() => {
  if (modalKind.value === 'global') return '全局基准配置'
  const row = liveAnchorStore.value.find((item) => item.id === editingId.value)
  return row ? `配置指标 · ${row.nickname}` : '配置指标'
})
const heatPreview = computed(() => previewHeat(form.value, heatSample.value))
const filteredRows = computed(() => liveAnchorStore.value.filter(matchRow))
const isSystemPreset = computed(
  () => !formReadonly.value && form.value.preset !== 'custom',
)

function matchRow(row: LiveAnchorRow) {
  const f = appliedFilter.value
  if (f.id && !row.id.includes(f.id.trim())) return false
  if (f.roomId && !row.roomId.includes(f.roomId.trim())) return false
  if (f.nickname && !row.nickname.includes(f.nickname.trim())) return false
  if (f.liveStatus && row.liveStatus !== f.liveStatus) return false
  if (f.banStatus && row.banStatus !== f.banStatus) return false
  if (f.source && row.source !== f.source) return false
  if (f.channelId && !row.channelIds.includes(f.channelId)) return false
  return true
}

function rowConfig(row: LiveAnchorRow) {
  return effectiveMetricConfig(row, liveAnchorGlobalConfig.value)
}

const channelEditingRow = computed(
  () => liveAnchorStore.value.find((item) => item.id === channelRowId.value) ?? null,
)
const channelModalVisible = computed(() => channelRowId.value !== null)
const channelFilteredList = computed(() => filterAnchorChannels(channelAppliedKeyword.value))
const channelTotalPages = computed(() =>
  Math.max(1, Math.ceil(channelFilteredList.value.length / ANCHOR_CHANNEL_PAGE_SIZE)),
)
const channelPageItems = computed(() => {
  const start = (channelPage.value - 1) * ANCHOR_CHANNEL_PAGE_SIZE
  return channelFilteredList.value.slice(start, start + ANCHOR_CHANNEL_PAGE_SIZE)
})
const channelPageIds = computed(() => channelPageItems.value.map((item) => item.id))
const channelSelectedCount = computed(() => channelDraftIds.value.length)
const channelPageAllSelected = computed(
  () => channelPageIds.value.length > 0 && channelPageIds.value.every((id) => channelDraftIds.value.includes(id)),
)
const channelPagePartialSelected = computed(
  () =>
    !channelPageAllSelected.value && channelPageIds.value.some((id) => channelDraftIds.value.includes(id)),
)
const channelPageNumbers = computed(() =>
  Array.from({ length: channelTotalPages.value }, (_, index) => index + 1),
)

const gameEditingRow = computed(
  () => liveAnchorStore.value.find((item) => item.id === gameRowId.value) ?? null,
)
const gameModalVisible = computed(() => gameRowId.value !== null)

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function hydrateForm(config: AnchorMetricConfig) {
  applyingPreset.value = true
  form.value = cloneMetricConfig(config)
  heatSample.value = { ...HEAT_PREVIEW_BY_PRESET[config.preset ?? 'custom'] }
  formHint.value = ''
  nextTick(() => {
    applyingPreset.value = false
  })
}

function openGlobal() {
  modalKind.value = 'global'
  editingId.value = null
  formSource.value = 'global'
  hydrateForm(liveAnchorGlobalConfig.value)
}

function openAnchor(row: LiveAnchorRow) {
  modalKind.value = 'anchor'
  editingId.value = row.id
  formSource.value = row.source
  hydrateForm(effectiveMetricConfig(row, liveAnchorGlobalConfig.value))
}

function closeModal() {
  modalKind.value = null
  editingId.value = null
  formHint.value = ''
}

function openChannelAuth(row: LiveAnchorRow) {
  channelRowId.value = row.id
  channelKeyword.value = ''
  channelAppliedKeyword.value = ''
  channelDraftIds.value = [...row.channelIds]
  channelPage.value = 1
  channelHint.value = ''
}

function closeChannelAuth() {
  channelRowId.value = null
  channelKeyword.value = ''
  channelAppliedKeyword.value = ''
  channelDraftIds.value = []
  channelPage.value = 1
  channelHint.value = ''
}

function searchChannels() {
  channelAppliedKeyword.value = channelKeyword.value
  channelPage.value = 1
}

function isChannelChecked(id: string) {
  return channelDraftIds.value.includes(id)
}

function toggleChannel(id: string) {
  const index = channelDraftIds.value.indexOf(id)
  if (index >= 0) {
    channelDraftIds.value = channelDraftIds.value.filter((item) => item !== id)
    return
  }
  channelDraftIds.value = [...channelDraftIds.value, id]
}

function toggleChannelPageAll() {
  if (!channelPageIds.value.length) return
  if (channelPageAllSelected.value) {
    channelDraftIds.value = channelDraftIds.value.filter((id) => !channelPageIds.value.includes(id))
    return
  }
  const next = new Set(channelDraftIds.value)
  channelPageIds.value.forEach((id) => next.add(id))
  channelDraftIds.value = [...next]
}

function goChannelPage(page: number) {
  if (page < 1 || page > channelTotalPages.value) return
  channelPage.value = page
}

function confirmChannelAuth() {
  const idx = liveAnchorStore.value.findIndex((item) => item.id === channelRowId.value)
  if (idx < 0) {
    channelHint.value = '未找到该主播'
    return
  }
  liveAnchorStore.value[idx].channelIds = [...channelDraftIds.value]
  showPcToast(`已更新「${liveAnchorStore.value[idx].nickname}」的授权渠道`)
  closeChannelAuth()
}

function openGameAuth(row: LiveAnchorRow) {
  gameRowId.value = row.id
  gameKeyword.value = ''
  gameAppliedKeyword.value = ''
  gameDraftIds.value = [...row.gameIds]
  gameHint.value = ''
}

function closeGameAuth() {
  gameRowId.value = null
  gameKeyword.value = ''
  gameAppliedKeyword.value = ''
  gameDraftIds.value = []
  gameHint.value = ''
}

function searchGames() {
  gameAppliedKeyword.value = gameKeyword.value
}

function confirmGameAuth() {
  const idx = liveAnchorStore.value.findIndex((item) => item.id === gameRowId.value)
  if (idx < 0) {
    gameHint.value = '未找到该主播'
    return
  }
  liveAnchorStore.value[idx].gameIds = [...gameDraftIds.value]
  showPcToast(`已更新「${liveAnchorStore.value[idx].nickname}」的授权游戏`)
  closeGameAuth()
}

function onSourceChange(source: AnchorMetricSource) {
  formSource.value = source
  formHint.value = ''
  if (source === 'global') {
    hydrateForm(liveAnchorGlobalConfig.value)
    return
  }
  const row = liveAnchorStore.value.find((item) => item.id === editingId.value)
  hydrateForm(row?.custom ?? liveAnchorGlobalConfig.value)
}

function applyPreset(preset: MetricPreset) {
  if (formReadonly.value) return
  applyingPreset.value = true
  if (preset === 'custom') {
    form.value.preset = 'custom'
    applyingPreset.value = false
    return
  }
  form.value = cloneMetricConfig(METRIC_PRESETS[preset])
  heatSample.value = { ...HEAT_PREVIEW_BY_PRESET[preset] }
  nextTick(() => {
    applyingPreset.value = false
  })
}

watch(
  form,
  () => {
    if (applyingPreset.value || formReadonly.value) return
    if (form.value.preset !== 'custom') form.value.preset = 'custom'
  },
  { deep: true },
)

function asNonNegInt(value: unknown, label: string) {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return `${label}须为非负整数`
  return ''
}

function asNonNegDecimal(value: unknown, label: string) {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return `${label}须为不小于 0 的数字`
  if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim())) return `${label}最多保留两位小数`
  return ''
}

function validateRange(range: MetricRange, label: string) {
  const minError = asNonNegInt(range.min, `${label}最小值`)
  if (minError) return minError
  const maxError = asNonNegInt(range.max, `${label}最大值`)
  if (maxError) return maxError
  if (Number(range.max) < Number(range.min)) return `${label}最大值不能小于最小值`
  return ''
}

function validateMetricConfig(config: AnchorMetricConfig) {
  return (
    asNonNegInt(config.peopleBase, '基准人数') ||
    asNonNegInt(config.appointmentBase, '基础预约') ||
    asNonNegInt(config.heatBase, '基础热度') ||
    asNonNegInt(config.likeBase, '本场点赞') ||
    validateRange(config.people.enter, '进入随机范围') ||
    validateRange(config.people.leave, '退出随机范围') ||
    validateRange(config.appointment.book, '点击预约随机范围') ||
    validateRange(config.appointment.cancel, '取消预约随机范围') ||
    validateRange(config.like.tap, '点赞随机范围') ||
    asNonNegDecimal(config.heat.peopleWeight, '人数系数') ||
    asNonNegDecimal(config.heat.danmakuWeight, '弹幕系数') ||
    asNonNegDecimal(config.heat.giftWeight, '礼物系数') ||
    asNonNegDecimal(config.heat.likeWeight, '点赞系数')
  )
}

function normalizeConfig(config: AnchorMetricConfig): AnchorMetricConfig {
  const next = cloneMetricConfig(config)
  next.preset = next.preset ?? 'custom'
  next.peopleBase = Number(next.peopleBase)
  next.appointmentBase = Number(next.appointmentBase)
  next.heatBase = Number(next.heatBase)
  next.likeBase = Number(next.likeBase)
  next.people.enter.min = Number(next.people.enter.min)
  next.people.enter.max = Number(next.people.enter.max)
  next.people.leave.min = Number(next.people.leave.min)
  next.people.leave.max = Number(next.people.leave.max)
  next.appointment.book.min = Number(next.appointment.book.min)
  next.appointment.book.max = Number(next.appointment.book.max)
  next.appointment.cancel.min = Number(next.appointment.cancel.min)
  next.appointment.cancel.max = Number(next.appointment.cancel.max)
  next.like.tap.min = Number(next.like.tap.min)
  next.like.tap.max = Number(next.like.tap.max)
  next.heat.peopleWeight = Number(next.heat.peopleWeight)
  next.heat.danmakuWeight = Number(next.heat.danmakuWeight)
  next.heat.giftWeight = Number(next.heat.giftWeight)
  next.heat.likeWeight = Number(next.heat.likeWeight)
  return next
}

function applyPayload(payload: AnchorMetricConfig, closeAfter: boolean) {
  if (modalKind.value === 'global') {
    liveAnchorGlobalConfig.value = payload
    showPcToast('已保存全局基准配置，跟随全局的主播即时生效')
    if (closeAfter) closeModal()
    return true
  }

  const idx = liveAnchorStore.value.findIndex((item) => item.id === editingId.value)
  if (idx < 0) {
    formHint.value = '未找到该主播'
    return false
  }
  liveAnchorStore.value[idx].source = 'custom'
  liveAnchorStore.value[idx].custom = { ...payload, preset: 'custom' }
  showPcToast(`已保存「${liveAnchorStore.value[idx].nickname}」的自定义指标`)
  if (closeAfter) closeModal()
  return true
}

function confirmFollowGlobal() {
  const idx = liveAnchorStore.value.findIndex((item) => item.id === editingId.value)
  if (idx < 0) {
    formHint.value = '未找到该主播'
    return
  }
  liveAnchorStore.value[idx].source = 'global'
  liveAnchorStore.value[idx].custom = null
  showPcToast(`「${liveAnchorStore.value[idx].nickname}」已改为跟随全局`)
  closeModal()
}

function confirmModal() {
  if (modalKind.value === 'anchor' && formSource.value === 'global') {
    confirmFollowGlobal()
    return
  }

  const error = validateMetricConfig(form.value)
  if (error) {
    formHint.value = error
    return
  }

  applyPayload(normalizeConfig(form.value), true)
}

function saveModal() {
  if (formReadonly.value || form.value.preset === 'custom') return

  const error = validateMetricConfig(form.value)
  if (error) {
    formHint.value = error
    return
  }

  const payload = normalizeConfig(form.value)
  const preset = payload.preset
  if (preset === 'custom') return
  METRIC_PRESETS[preset] = cloneMetricConfig(payload)
  HEAT_PREVIEW_BY_PRESET[preset] = { ...heatSample.value }
  formHint.value = ''
  showPcToast(`已保存「${metricPresetLabel(preset)}」档`)
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="lal-title">主播列表</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          主播ID：
          <WfSpecAnnot
            :no="filterAnnot.no"
            :title="filterAnnot.title"
            :items="[...filterAnnot.items]"
            placement="bottom"
          />
        </label>
        <input v-model="filter.id" type="text" class="wf-input" placeholder="请输入主播ID" />

        <label class="wf-label">直播间ID：</label>
        <input v-model="filter.roomId" type="text" class="wf-input" placeholder="请输入直播间ID" />

        <label class="wf-label">主播昵称：</label>
        <input v-model="filter.nickname" type="text" class="wf-input" placeholder="请输入主播昵称" />

        <label class="wf-label">直播状态：</label>
        <select v-model="filter.liveStatus" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in ANCHOR_LIVE_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">封禁状态：</label>
        <select v-model="filter.banStatus" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in ANCHOR_BAN_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">配置来源：</label>
        <select v-model="filter.source" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in ANCHOR_METRIC_SOURCE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">渠道：</label>
        <select v-model="filter.channelId" class="wf-input wf-input--select">
          <option value="">请选择渠道</option>
          <option v-for="item in ANCHOR_CHANNELS" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openGlobal">全局配置</button>
          <WfSpecAnnot
            :no="globalBaseAnnot.no"
            :title="globalBaseAnnot.title"
            :items="[...globalBaseAnnot.items]"
          />
        </span>
      </div>

      <div class="wf-table-wrap">
        <div class="lal-list-head">
          <WfSpecAnnot :no="listAnnot.no" :title="listAnnot.title" :items="[...listAnnot.items]" />
        </div>
        <table class="wf-table wf-table--manage lal-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">序号</th>
              <th class="wf-th">主播</th>
              <th class="wf-th">主播ID</th>
              <th class="wf-th">直播间ID</th>
              <th class="wf-th">直播场次ID</th>
              <th class="wf-th">礼物分成比例</th>
              <th class="wf-th">粉丝数</th>
              <th class="wf-th">主播标签</th>
              <th class="wf-th">直播状态</th>
              <th class="wf-th">封禁状态</th>
              <th class="wf-th">配置来源</th>
              <th class="wf-th">
                <span class="lal-op-head">
                  基准人数
                  <WfSpecAnnot
                    :no="metricDisplayAnnot.no"
                    :title="metricDisplayAnnot.title"
                    :items="[...metricDisplayAnnot.items]"
                    placement="top"
                  />
                </span>
              </th>
              <th class="wf-th">基础预约</th>
              <th class="wf-th">基础热度</th>
              <th class="wf-th">本场点赞</th>
              <th class="wf-th">
                <span class="lal-op-head">
                  渠道
                  <WfSpecAnnot
                    :no="channelAuthAnnot.no"
                    :title="channelAuthAnnot.title"
                    :items="[...channelAuthAnnot.items]"
                    placement="top"
                  />
                </span>
              </th>
              <th class="wf-th">
                <span class="lal-op-head">
                  游戏
                  <WfSpecAnnot
                    :no="gameAuthAnnot.no"
                    :title="gameAuthAnnot.title"
                    :items="[...gameAuthAnnot.items]"
                    placement="top"
                  />
                </span>
              </th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="18" class="wf-td wf-td--empty">暂无主播数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">{{ row.id }}</td>
              <td class="wf-td">{{ row.roomId }}</td>
              <td class="wf-td wf-td--center">{{ row.sessionId }}</td>
              <td class="wf-td wf-td--center">{{ formatGiftShare(row.giftSharePercent) }}</td>
              <td class="wf-td wf-td--center">{{ row.fans }}</td>
              <td class="wf-td">{{ formatAnchorTag(row.tag) }}</td>
              <td class="wf-td">
                <span
                  class="wf-status-badge"
                  :class="row.liveStatus === 'live' ? 'wf-status-badge--enabled' : 'wf-status-badge--disabled'"
                >
                  {{ anchorLiveStatusLabel(row.liveStatus) }}
                </span>
              </td>
              <td class="wf-td">
                <span
                  class="wf-status-badge"
                  :class="row.banStatus === 'banned' ? 'wf-status-badge--disabled' : 'wf-status-badge--enabled'"
                >
                  {{ anchorBanStatusLabel(row.banStatus) }}
                </span>
              </td>
              <td class="wf-td">
                <span
                  class="wf-status-badge"
                  :class="row.source === 'custom' ? 'lal-source-badge--custom' : 'lal-source-badge--global'"
                >
                  {{ anchorMetricSourceLabel(row.source) }}
                </span>
              </td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).peopleBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).appointmentBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).heatBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).likeBase }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openChannelAuth(row)">
                  {{ row.channelIds.length }}
                </button>
              </td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openGameAuth(row)">
                  {{ row.gameIds.length }}
                </button>
              </td>
              <td class="wf-td wf-td--actions">
                <button type="button" class="wf-link-action" @click="openAnchor(row)">配置指标</button>
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
        <div class="wf-modal wf-modal--scroll lal-modal" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">{{ modalTitle }}</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </header>

          <div class="wf-modal__body">
            <template v-if="isGlobalModal">
              <p class="lal-lead">未自定义的主播实时读取以下全站默认值。已有主播资料、分成、封禁不在本页改。</p>
            </template>
            <template v-else>
              <div class="wf-form-row lal-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">配置来源</label>
                <div>
                  <div class="lal-source">
                    <label v-for="opt in ANCHOR_METRIC_SOURCE_OPTIONS" :key="opt.value" class="lal-radio">
                      <input
                        type="radio"
                        name="anchor-metric-source"
                        :value="opt.value"
                        :checked="formSource === opt.value"
                        @change="onSourceChange(opt.value)"
                      />
                      {{ opt.label }}
                    </label>
                    <WfSpecAnnot
                      :no="sourceAnnot.no"
                      :title="sourceAnnot.title"
                      :items="[...sourceAnnot.items]"
                    />
                  </div>
                  <p class="wf-form-row__hint">
                    {{
                      formSource === 'global'
                        ? '保存后该主播实时读取全局配置，全局改完立即生效。'
                        : '保存后该主播使用下方自定义稿，不再跟随全局变更。'
                    }}
                  </p>
                </div>
              </div>
            </template>

            <div v-if="isGlobalModal" class="wf-form-row lal-form-row">
              <label class="wf-form-row__label">档位</label>
              <div>
                <div class="lal-source">
                  <label v-for="opt in METRIC_PRESET_OPTIONS" :key="opt.value" class="lal-radio">
                    <input
                      type="radio"
                      name="anchor-metric-preset"
                      :value="opt.value"
                      :checked="form.preset === opt.value"
                      :disabled="formReadonly"
                      @change="applyPreset(opt.value)"
                    />
                    {{ opt.label }}
                  </label>
                  <WfSpecAnnot
                    :no="presetAnnot.no"
                    :title="presetAnnot.title"
                    :items="[...presetAnnot.items]"
                  />
                </div>
              </div>
            </div>

            <div class="lal-section">
              <h4 class="lal-section__title">基准值</h4>
              <div class="wf-form-row lal-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">基准人数</label>
                <input
                  v-model.number="form.peopleBase"
                  type="number"
                  min="0"
                  step="1"
                  class="wf-input wf-input--full"
                  :disabled="formReadonly"
                  placeholder="请输入基准人数"
                />
              </div>
              <div class="wf-form-row lal-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">基础预约</label>
                <input
                  v-model.number="form.appointmentBase"
                  type="number"
                  min="0"
                  step="1"
                  class="wf-input wf-input--full"
                  :disabled="formReadonly"
                  placeholder="请输入基础预约"
                />
              </div>
              <div class="wf-form-row lal-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">基础热度</label>
                <input
                  v-model.number="form.heatBase"
                  type="number"
                  min="0"
                  step="1"
                  class="wf-input wf-input--full"
                  :disabled="formReadonly"
                  placeholder="请输入基础热度"
                />
              </div>
              <div class="wf-form-row lal-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">本场点赞</label>
                <input
                  v-model.number="form.likeBase"
                  type="number"
                  min="0"
                  step="1"
                  class="wf-input wf-input--full"
                  :disabled="formReadonly"
                  placeholder="请输入本场点赞底数"
                />
              </div>
            </div>

            <div class="lal-section">
              <h4 class="lal-section__title lal-section__title--with-spec">
                高阶设置
                <WfSpecAnnot
                  v-if="isGlobalModal"
                  :no="globalAdvancedAnnot.no"
                  :title="globalAdvancedAnnot.title"
                  :items="[...globalAdvancedAnnot.items]"
                />
                <WfSpecAnnot
                  v-else
                  :no="anchorAdvancedAnnot.no"
                  :title="anchorAdvancedAnnot.title"
                  :items="[...anchorAdvancedAnnot.items]"
                />
              </h4>

              <div class="lal-sub">
                <h5 class="lal-sub__title">人数增减</h5>
                <p class="lal-sub__desc">
                  登录用户进入直播间，展示人数 + 范围内随机整数；登录用户退出，展示人数 − 范围内随机整数；结果不低于 0。游客进出不计入。
                </p>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">进入增加</label>
                  <div class="lal-range">
                    <input
                      v-model.number="form.people.enter.min"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="lal-range__sep">~</span>
                    <input
                      v-model.number="form.people.enter.max"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="wf-muted">当前 {{ formatRange(form.people.enter) }}</span>
                  </div>
                </div>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">退出减少</label>
                  <div class="lal-range">
                    <input
                      v-model.number="form.people.leave.min"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="lal-range__sep">~</span>
                    <input
                      v-model.number="form.people.leave.max"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="wf-muted">当前 {{ formatRange(form.people.leave) }}</span>
                  </div>
                </div>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">预约增减</h5>
                <p class="lal-sub__desc">
                  登录用户点击预约，展示预约 + 范围内随机整数；登录用户取消预约，展示预约 − 范围内随机整数；结果不低于 0。游客不计入。
                </p>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">点击增加</label>
                  <div class="lal-range">
                    <input
                      v-model.number="form.appointment.book.min"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="lal-range__sep">~</span>
                    <input
                      v-model.number="form.appointment.book.max"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="wf-muted">当前 {{ formatRange(form.appointment.book) }}</span>
                  </div>
                </div>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">取消减少</label>
                  <div class="lal-range">
                    <input
                      v-model.number="form.appointment.cancel.min"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="lal-range__sep">~</span>
                    <input
                      v-model.number="form.appointment.cancel.max"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="wf-muted">当前 {{ formatRange(form.appointment.cancel) }}</span>
                  </div>
                </div>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">本场点赞</h5>
                <p class="lal-sub__desc">
                  登录用户每次点赞，本场点赞 + 范围内随机整数；结果不低于 0。游客点赞不计入。
                </p>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">点赞增加</label>
                  <div class="lal-range">
                    <input
                      v-model.number="form.like.tap.min"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="lal-range__sep">~</span>
                    <input
                      v-model.number="form.like.tap.max"
                      type="number"
                      min="0"
                      step="1"
                      class="wf-input"
                      :disabled="formReadonly"
                    />
                    <span class="wf-muted">当前 {{ formatRange(form.like.tap) }}</span>
                  </div>
                </div>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">热度综合</h5>
                <p class="lal-sub__desc">
                  展示热度 = 基础热度 + 展示人数×人数系数 + 弹幕条数×弹幕系数 + 礼物金额×礼物系数 + 本场点赞×点赞系数。展示人数 = 基准人数 + 登录用户进出人数。弹幕、礼物、点赞均不计游客。
                </p>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">人数系数</label>
                  <input
                    v-model.number="form.heat.peopleWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    class="wf-input wf-input--full"
                    :disabled="formReadonly"
                    placeholder="每 1 个展示人数贡献的热度"
                  />
                </div>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">弹幕系数</label>
                  <input
                    v-model.number="form.heat.danmakuWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    class="wf-input wf-input--full"
                    :disabled="formReadonly"
                    placeholder="每 1 条弹幕贡献的热度"
                  />
                </div>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">礼物系数</label>
                  <input
                    v-model.number="form.heat.giftWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    class="wf-input wf-input--full"
                    :disabled="formReadonly"
                    placeholder="每 1 元礼物金额贡献的热度"
                  />
                </div>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">点赞系数</label>
                  <input
                    v-model.number="form.heat.likeWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    class="wf-input wf-input--full"
                    :disabled="formReadonly"
                    placeholder="每 1 个本场点赞贡献的热度"
                  />
                </div>
                <div class="lal-preview">
                  <p class="lal-preview__label">试算示例（可改数字，即时看热度）</p>
                  <div class="lal-preview__grid">
                    <label>
                      展示人数
                      <input v-model.number="heatSample.people" type="number" min="0" class="wf-input" />
                    </label>
                    <label>
                      弹幕
                      <input v-model.number="heatSample.danmaku" type="number" min="0" class="wf-input" />
                    </label>
                    <label>
                      礼物
                      <input v-model.number="heatSample.gift" type="number" min="0" class="wf-input" />
                    </label>
                    <label>
                      本场点赞
                      <input v-model.number="heatSample.like" type="number" min="0" class="wf-input" />
                    </label>
                  </div>
                  <p class="lal-preview__result">
                    展示热度 ≈ <strong>{{ heatPreview }}</strong>
                  </p>
                </div>
              </div>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
          </div>

          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
            <button
              v-if="isGlobalModal && isSystemPreset"
              type="button"
              class="wf-btn wf-btn--add"
              @click="saveModal"
            >
              更新档位
            </button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">确定</button>
          </footer>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="channelModalVisible" class="wf-modal-mask" @click.self="closeChannelAuth">
        <div class="wf-modal wf-modal--scroll lal-channel-modal" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">主播授权渠道</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeChannelAuth">×</button>
          </header>

          <div class="wf-modal__body">
            <p class="lal-lead">
              {{ channelEditingRow ? `${channelEditingRow.nickname} (${channelEditingRow.id})` : '—' }}
            </p>

            <div class="wf-modal__query">
              <label class="wf-label" for="lal-channel-keyword">渠道选择：</label>
              <input
                id="lal-channel-keyword"
                v-model="channelKeyword"
                type="text"
                class="wf-input"
                placeholder="请输入关键词"
                @keyup.enter="searchChannels"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="searchChannels">搜索</button>
            </div>

            <div class="lal-channel-box">
              <div class="lal-channel-box__bar">
                <label class="lal-channel-check">
                  <input
                    type="checkbox"
                    :checked="channelPageAllSelected"
                    :indeterminate="channelPagePartialSelected"
                    :disabled="!channelPageIds.length"
                    @change="toggleChannelPageAll"
                  />
                  全选
                </label>
                <span class="wf-muted">已选：{{ channelSelectedCount }}</span>
              </div>

              <div v-if="channelPageItems.length" class="lal-channel-grid">
                <label v-for="item in channelPageItems" :key="item.id" class="lal-channel-check">
                  <input type="checkbox" :checked="isChannelChecked(item.id)" @change="toggleChannel(item.id)" />
                  {{ item.name }}
                </label>
              </div>
              <p v-else class="wf-td--empty lal-channel-empty">暂无匹配渠道</p>
            </div>

            <div v-if="channelFilteredList.length" class="wf-pagination lal-channel-pages">
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="channelPage <= 1"
                @click="goChannelPage(channelPage - 1)"
              >
                上一页
              </button>
              <button
                v-for="page in channelPageNumbers"
                :key="page"
                type="button"
                class="wf-btn"
                :class="page === channelPage ? 'wf-btn--primary' : 'wf-btn--default'"
                @click="goChannelPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="channelPage >= channelTotalPages"
                @click="goChannelPage(channelPage + 1)"
              >
                下一页
              </button>
            </div>

            <p v-if="channelHint" class="wf-modal__hint">{{ channelHint }}</p>
          </div>

          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeChannelAuth">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmChannelAuth">确定</button>
          </footer>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="gameModalVisible" class="wf-modal-mask" @click.self="closeGameAuth">
        <div class="wf-modal wf-modal--scroll lal-channel-modal" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">主播授权游戏</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeGameAuth">×</button>
          </header>

          <div class="wf-modal__body">
            <p class="lal-lead">
              {{ gameEditingRow ? `${gameEditingRow.nickname} (${gameEditingRow.id})` : '—' }}
            </p>

            <div class="wf-modal__query">
              <label class="wf-label" for="lal-game-keyword">游戏选择：</label>
              <input
                id="lal-game-keyword"
                v-model="gameKeyword"
                type="text"
                class="wf-input"
                placeholder="请输入关键词"
                @keyup.enter="searchGames"
              />
              <button type="button" class="wf-btn wf-btn--primary" @click="searchGames">搜索</button>
            </div>

            <WfGamePickerBox
              v-model="gameDraftIds"
              :keyword="gameAppliedKeyword"
              :reset-key="gameRowId ?? ''"
            />

            <p v-if="gameHint" class="wf-modal__hint">{{ gameHint }}</p>
          </div>

          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeGameAuth">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmGameAuth">确定</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.lal-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text);
}

.lal-list-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.lal-op-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.lal-table {
  min-width: 2550px;
}

.lal-channel-modal {
  width: 640px;
}

.lal-channel-box {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--pc-border-light);
}

.lal-channel-box__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.lal-channel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.lal-channel-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pc-text);
  font-size: 14px;
  cursor: pointer;
}

.lal-channel-empty {
  padding: 24px 0;
  text-align: center;
}

.lal-channel-pages {
  height: auto;
  min-height: 56px;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
}

.lal-source-badge--global {
  color: #8c8c8c;
  background: #fafafa;
  border: 1px solid #d9d9d9;
}

.lal-source-badge--custom {
  color: #d46b08;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.lal-modal {
  width: 680px;
}

.lal-lead,
.lal-sub__desc {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--pc-text-secondary);
}

.lal-form-row {
  grid-template-columns: 104px 1fr;
}

.lal-source,
.lal-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lal-radio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.lal-source {
  flex-wrap: wrap;
}

.lal-range .wf-input {
  width: 88px;
}

.lal-range__sep {
  color: var(--pc-text-secondary);
}

.lal-section {
  margin-bottom: 16px;
  padding: 12px 12px 2px;
  border: 1px solid var(--pc-border-light);
  border-radius: 2px;
}

.lal-section__title,
.lal-sub__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pc-text);
}

.lal-section__title--with-spec {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lal-sub {
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--pc-border-light);
}

.lal-sub:last-child {
  margin-bottom: 0;
  border-bottom: 0;
}

.lal-preview {
  margin: 4px 0 12px;
  padding: 10px 12px;
  background: var(--pc-notice-bg);
}

.lal-preview__label,
.lal-preview__result {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--pc-text-secondary);
}

.lal-preview__result {
  margin-bottom: 0;
}

.lal-preview__result strong {
  font-size: 16px;
  color: var(--pc-text);
}

.lal-preview__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.lal-preview__grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--pc-text-secondary);
}

.lal-preview__grid .wf-input {
  width: 100%;
}
</style>
