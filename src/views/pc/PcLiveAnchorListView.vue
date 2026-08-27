<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { LIVE_ANCHOR_LIST_ANNOT_MAP } from '../../constants/liveAnchorListSpec'
import {
  ANCHOR_METRIC_SOURCE_OPTIONS,
  DEFAULT_HEAT_PREVIEW,
  HEAT_PREVIEW_BY_PRESET,
  METRIC_PRESETS,
  METRIC_PRESET_OPTIONS,
  anchorMetricSourceLabel,
  cloneMetricConfig,
  createDefaultMetricConfig,
  effectiveMetricConfig,
  formatRange,
  liveAnchorGlobalConfig,
  liveAnchorStore,
  previewHeat,
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
  nickname: string
  source: '' | AnchorMetricSource
}

type ModalKind = 'global' | 'anchor'

const defaultFilter = (): ListFilter => ({ id: '', nickname: '', source: '' })

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const actionHint = ref('')
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
const configActionAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.configAction
const sourceAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.sourceAndBase
const anchorAdvancedAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.anchorAdvanced
const presetAnnot = LIVE_ANCHOR_LIST_ANNOT_MAP.preset
const applyingPreset = ref(false)

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

function matchRow(row: LiveAnchorRow) {
  const f = appliedFilter.value
  if (f.id && row.id !== f.id.trim()) return false
  if (f.nickname && !row.nickname.includes(f.nickname.trim())) return false
  if (f.source && row.source !== f.source) return false
  return true
}

function rowConfig(row: LiveAnchorRow) {
  return effectiveMetricConfig(row, liveAnchorGlobalConfig.value)
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

function openGlobal() {
  modalKind.value = 'global'
  editingId.value = null
  formSource.value = 'global'
  form.value = cloneMetricConfig(liveAnchorGlobalConfig.value)
  heatSample.value = { ...DEFAULT_HEAT_PREVIEW }
  formHint.value = ''
}

function openAnchor(row: LiveAnchorRow) {
  modalKind.value = 'anchor'
  editingId.value = row.id
  formSource.value = row.source
  form.value = effectiveMetricConfig(row, liveAnchorGlobalConfig.value)
  heatSample.value = { ...DEFAULT_HEAT_PREVIEW }
  formHint.value = ''
}

function closeModal() {
  modalKind.value = null
  editingId.value = null
  formHint.value = ''
}

function onSourceChange(source: AnchorMetricSource) {
  formSource.value = source
  formHint.value = ''
  if (source === 'global') {
    form.value = cloneMetricConfig(liveAnchorGlobalConfig.value)
    return
  }
  const row = liveAnchorStore.value.find((item) => item.id === editingId.value)
  form.value = row?.custom
    ? cloneMetricConfig(row.custom)
    : cloneMetricConfig(liveAnchorGlobalConfig.value)
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
    validateRange(config.like.tap, '用户点赞随机范围') ||
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

function confirmModal() {
  if (modalKind.value === 'anchor' && formSource.value === 'global') {
    const idx = liveAnchorStore.value.findIndex((item) => item.id === editingId.value)
    if (idx < 0) {
      formHint.value = '未找到该主播'
      return
    }
    liveAnchorStore.value[idx].source = 'global'
    liveAnchorStore.value[idx].custom = null
    actionHint.value = `「${liveAnchorStore.value[idx].nickname}」已改为跟随全局`
    closeModal()
    return
  }

  const error = validateMetricConfig(form.value)
  if (error) {
    formHint.value = error
    return
  }

  const payload = normalizeConfig(form.value)
  if (modalKind.value === 'global') {
    liveAnchorGlobalConfig.value = payload
    actionHint.value = '已保存全局基准配置，跟随全局的主播即时生效'
    closeModal()
    return
  }

  const idx = liveAnchorStore.value.findIndex((item) => item.id === editingId.value)
  if (idx < 0) {
    formHint.value = '未找到该主播'
    return
  }
  liveAnchorStore.value[idx].source = 'custom'
  liveAnchorStore.value[idx].custom = payload
  actionHint.value = `已保存「${liveAnchorStore.value[idx].nickname}」的自定义指标`
  closeModal()
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
        <input v-model="filter.id" type="text" class="wf-input" placeholder="请输入完整主播ID" />

        <label class="wf-label">主播昵称：</label>
        <input v-model="filter.nickname" type="text" class="wf-input" placeholder="请输入主播昵称" />

        <label class="wf-label">配置来源：</label>
        <select v-model="filter.source" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in ANCHOR_METRIC_SOURCE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
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
        <p v-if="actionHint" class="wf-modal__hint">{{ actionHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <div class="lal-list-head">
          <WfSpecAnnot :no="listAnnot.no" :title="listAnnot.title" :items="[...listAnnot.items]" />
        </div>
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">序号</th>
              <th class="wf-th">主播</th>
              <th class="wf-th">主播ID</th>
              <th class="wf-th">配置来源</th>
              <th class="wf-th">基准人数</th>
              <th class="wf-th">基础预约</th>
              <th class="wf-th">基础热度</th>
              <th class="wf-th">本场点赞</th>
              <th class="wf-th wf-th--op">
                <span class="lal-op-head">
                  操作
                  <WfSpecAnnot
                    :no="configActionAnnot.no"
                    :title="configActionAnnot.title"
                    :items="[...configActionAnnot.items]"
                    placement="top"
                  />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="9" class="wf-td wf-td--empty">暂无主播数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">{{ row.id }}</td>
              <td class="wf-td">
                <span :class="row.source === 'custom' ? 'lal-badge lal-badge--custom' : 'lal-badge'">
                  {{ anchorMetricSourceLabel(row.source) }}
                </span>
              </td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).peopleBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).appointmentBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).heatBase }}</td>
              <td class="wf-td wf-td--center">{{ rowConfig(row).likeBase }}</td>
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

            <div class="wf-form-row lal-form-row">
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
                    <span class="lal-radio__hint">{{ opt.hint }}</span>
                  </label>
                  <WfSpecAnnot
                    :no="presetAnnot.no"
                    :title="presetAnnot.title"
                    :items="[...presetAnnot.items]"
                  />
                </div>
                <p class="wf-form-row__hint">
                  低约几十人、中约几百人、高约几千人。选档后回填基准与高阶；再改数字即视为自定义。
                </p>
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
                <div>
                  <input
                    v-model.number="form.likeBase"
                    type="number"
                    min="0"
                    step="1"
                    class="wf-input wf-input--full"
                    :disabled="formReadonly"
                    placeholder="请输入本场点赞底数"
                  />
                  <p class="wf-form-row__hint">开场展示底数；之后只由登录用户点赞叠加，游客点赞不计入。</p>
                </div>
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
                  每人进入直播间，展示人数 + 范围内随机整数；每人退出，展示人数 − 范围内随机整数；结果不低于 0。
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
                <label class="lal-check">
                  <input v-model="form.people.includeGuest" type="checkbox" :disabled="formReadonly" />
                  计入游客（未登录观众进入 / 退出同样加减）
                </label>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">预约增减</h5>
                <p class="lal-sub__desc">
                  每人点击预约，展示预约 + 范围内随机整数；每人取消预约，展示预约 − 范围内随机整数；结果不低于 0。
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
                <label class="lal-check">
                  <input v-model="form.appointment.includeGuest" type="checkbox" :disabled="formReadonly" />
                  计入游客（未登录观众点击 / 取消预约同样加减）
                </label>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">本场点赞</h5>
                <p class="lal-sub__desc">
                  仅登录用户每次点赞，本场点赞 + 范围内随机整数；游客点赞、取消点赞均不改值。结果不低于 0。
                </p>
                <div class="wf-form-row lal-form-row">
                  <label class="wf-form-row__label">用户点赞</label>
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
                <p class="lal-check lal-check--text">不计入游客，无勾选项。</p>
              </div>

              <div class="lal-sub">
                <h5 class="lal-sub__title">热度综合</h5>
                <p class="lal-sub__desc">
                  展示热度 = 基础热度 + 展示人数×人数系数 + 弹幕条数×弹幕系数 + 礼物金额×礼物系数 + 本场点赞×点赞系数。点赞项只取本场点赞（登录用户累计），游客点赞不进热度。
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
                      人数
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
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">确定</button>
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

.lal-badge {
  color: var(--pc-text-muted);
}

.lal-badge--custom {
  color: var(--pc-primary);
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
.lal-range,
.lal-check {
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

.lal-radio__hint {
  color: var(--pc-text-muted);
  font-size: 12px;
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

.lal-check {
  margin: 0 0 4px 104px;
  font-size: 13px;
  color: var(--pc-text);
}

.lal-check--text {
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
