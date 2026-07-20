<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { ACTIVITY_CENTER_ANNOT_MAP } from '../../constants/activityCenterSpec'
import {
  ACTIVITY_CHANNEL_FORM_OPTIONS,
  ACTIVITY_CHANNEL_OPTIONS,
  ACTIVITY_CURRENCY_OPTIONS,
  ACTIVITY_GAME_CATEGORIES,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_TYPE_FORM_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  activityStatusLabel,
  activityTypeLabel,
  channelLabel,
  cloneActivityRow,
  createEmptyActivityForm,
  createEmptyVipDailyCap,
  formatAmount,
  formatPhonePrefixesLabel,
  formatVipCapLabel,
  isInviteRechargeRebateVip,
  MOCK_ACTIVITY_CENTER_ROWS,
  syncCurrencyConfigs,
  uniquePhoneDialOptions,
  VIP_CAP_MODE_OPTIONS,
  VIP_LEVEL_OPTIONS,
  type ActivityCenterRow,
  type ActivityCurrency,
  type ActivityCurrencyConfig,
  type ActivityJumpType,
  type ActivityStatus,
  type ActivityType,
  type VipCapMode,
  type VipDailyCapRow,
} from '../../constants/activityCenter'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  channel: string
  title: string
  type: '' | ActivityType
  startDate: string
  endDate: string
  status: '' | ActivityStatus
}

type ModalMode = 'edit' | 'detail'

const defaultFilter = (): ListFilter => ({
  channel: '',
  title: '',
  type: '',
  startDate: '',
  endDate: '',
  status: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const rows = ref<ActivityCenterRow[]>(MOCK_ACTIVITY_CENTER_ROWS.map(cloneActivityRow))
const filterHint = ref('')
const actionHint = ref('')

const modalVisible = ref(false)
const modalMode = ref<ModalMode>('edit')
const form = ref<ActivityCenterRow>(createEmptyActivityForm())
const formHint = ref('')
const readonly = computed(() => modalMode.value === 'detail')
const channelDropdownOpen = ref(false)
/** 活动规则区当前编辑的币种 Tab */
const activeRuleCurrency = ref<ActivityCurrency>('KKC')
const dialDropdownOpen = ref(false)
const dialSearch = ref('')
const uniqueDialOptions = uniquePhoneDialOptions()

const selectedChannelText = computed(() => {
  if (!form.value.channels.length) return ''
  return form.value.channels.map(channelLabel).join('、')
})

const showRuleCurrencyTabs = computed(() => form.value.currencyConfigs.length > 1)

const activeCurrencyConfig = computed(() =>
  form.value.currencyConfigs.find((c) => c.currency === activeRuleCurrency.value) ??
  form.value.currencyConfigs[0] ??
  null,
)

const selectedDialText = computed(() =>
  formatPhonePrefixesLabel(activeCurrencyConfig.value?.phonePrefixes ?? []),
)

const filteredDialOptions = computed(() => {
  const q = dialSearch.value.trim().toLowerCase().replace(/^\+/, '')
  if (!q) return uniqueDialOptions
  return uniqueDialOptions.filter((o) => {
    const label = `${o.code}-${o.name}`.toLowerCase()
    return label.includes(q) || o.code.includes(q) || o.name.includes(dialSearch.value.trim())
  })
})

function ensureActiveRuleCurrency(preferred?: ActivityCurrency) {
  const list = form.value.currencyConfigs
  if (!list.length) {
    activeRuleCurrency.value = 'KKC'
    return
  }
  if (preferred && list.some((c) => c.currency === preferred)) {
    activeRuleCurrency.value = preferred
    return
  }
  if (!list.some((c) => c.currency === activeRuleCurrency.value)) {
    activeRuleCurrency.value = list[0].currency
  }
}

function openDialDropdown() {
  if (readonly.value || !activeCurrencyConfig.value) return
  dialSearch.value = ''
  dialDropdownOpen.value = true
}

function closeDialDropdown() {
  dialDropdownOpen.value = false
  dialSearch.value = ''
}

function toggleDialCode(code: string) {
  if (!activeCurrencyConfig.value || readonly.value) return
  const list = activeCurrencyConfig.value.phonePrefixes
  const idx = list.indexOf(code)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(code)
}

function setInviterPhoneBound(bound: boolean) {
  if (!activeCurrencyConfig.value || readonly.value) return
  activeCurrencyConfig.value.inviterRequirePhoneBound = bound
  if (!bound) closeDialDropdown()
}

const nextActivityId = computed(() => Math.max(0, ...rows.value.map((r) => r.activityId)) + 1)

function applyFilter() {
  if (filter.value.startDate && filter.value.endDate && filter.value.startDate > filter.value.endDate) {
    filterHint.value = '结束日期不能早于开始日期'
    return
  }
  filterHint.value = ''
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  filterHint.value = ''
}

function matchRow(row: ActivityCenterRow) {
  const f = appliedFilter.value
  if (f.channel && !row.channels.includes(f.channel)) return false
  if (f.title && !row.title.includes(f.title.trim())) return false
  if (f.type && row.type !== f.type) return false
  if (f.status && row.status !== f.status) return false
  if (f.startDate && row.startAt.slice(0, 10) < f.startDate) return false
  if (f.endDate && row.endAt.slice(0, 10) > f.endDate) return false
  return true
}

const filteredRows = computed(() =>
  rows.value.filter(matchRow).sort((a, b) => a.sort - b.sort || b.activityId - a.activityId),
)

function formatDateTime(value: string) {
  if (!value) return '-'
  return value.replace('T', ' ') + (value.includes(':') && value.length === 16 ? ':00' : '')
}

function statusClass(status: ActivityStatus) {
  if (status === 'enabled') return 'activity-status--on'
  if (status === 'ended') return 'activity-status--ended'
  return 'activity-status--off'
}

function toggleEnable(row: ActivityCenterRow) {
  if (row.status === 'ended') {
    actionHint.value = '已结束活动不可启用/禁用'
    return
  }
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  actionHint.value = `已${row.status === 'enabled' ? '启用' : '禁用'}活动「${row.title}」`
}

function removeRow(row: ActivityCenterRow) {
  if (!window.confirm(`确定删除活动「${row.title}」吗？`)) return
  rows.value = rows.value.filter((item) => item.id !== row.id)
  actionHint.value = `已删除活动「${row.title}」`
}

function openCreate() {
  modalMode.value = 'edit'
  form.value = createEmptyActivityForm({
    id: `a-${Date.now()}`,
    activityId: nextActivityId.value,
    type: 'invite_recharge_rebate_vip',
    title: '邀请好友充值返利',
    subtitle: 'VIP阶梯自动派发',
  })
  formHint.value = ''
  channelDropdownOpen.value = false
  ensureActiveRuleCurrency(form.value.currencies[0])
  modalVisible.value = true
}

function openEdit(row: ActivityCenterRow) {
  modalMode.value = 'edit'
  form.value = cloneActivityRow(row)
  formHint.value = ''
  channelDropdownOpen.value = false
  ensureActiveRuleCurrency(row.currencies[0])
  modalVisible.value = true
}

function openDetail(row: ActivityCenterRow) {
  modalMode.value = 'detail'
  form.value = cloneActivityRow(row)
  formHint.value = ''
  channelDropdownOpen.value = false
  ensureActiveRuleCurrency(row.currencies[0])
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  channelDropdownOpen.value = false
  closeDialDropdown()
}

function toggleChannelDropdown() {
  if (readonly.value) return
  channelDropdownOpen.value = !channelDropdownOpen.value
}

function toggleChannel(value: string) {
  if (readonly.value) return
  const list = form.value.channels
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function toggleCurrency(value: ActivityCurrency) {
  if (readonly.value) return
  const list = form.value.currencies
  const idx = list.indexOf(value)
  const next =
    idx >= 0 ? list.filter((c) => c !== value) : [...list, value]
  form.value.currencies = next
  form.value.currencyConfigs = syncCurrencyConfigs(form.value, next)
  ensureActiveRuleCurrency(idx >= 0 ? undefined : value)
  closeDialDropdown()
}

function toggleGame(name: string) {
  if (readonly.value) return
  const list = form.value.gameCategories
  const idx = list.indexOf(name)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(name)
}

function addRule(cfg: ActivityCurrencyConfig) {
  cfg.rules.push({
    id: `${cfg.currency}-rule-${Date.now()}`,
    startAt: form.value.startAt,
    endAt: form.value.endAt,
    giftAmount: cfg.currency === 'USDT' ? 10 : 100,
    turnoverMultiple: 1,
  })
}

function removeRule(cfg: ActivityCurrencyConfig, id: string) {
  cfg.rules = cfg.rules.filter((r) => r.id !== id)
}

function addVipCap(cfg: ActivityCurrencyConfig) {
  cfg.vipDailyCaps.push(createEmptyVipDailyCap(cfg.currency))
}

function removeVipCap(cfg: ActivityCurrencyConfig, id: string) {
  cfg.vipDailyCaps = cfg.vipDailyCaps.filter((r) => r.id !== id)
}

function onVipModeChange(row: VipDailyCapRow, mode: VipCapMode) {
  row.mode = mode
  if (mode === 'single') row.vipTo = row.vipFrom
  if (mode === 'and_above') row.vipTo = row.vipFrom
  if (mode === 'range' && row.vipTo < row.vipFrom) row.vipTo = row.vipFrom
}

function onVipFromChange(row: VipDailyCapRow) {
  if (row.mode === 'single' || row.mode === 'and_above') row.vipTo = row.vipFrom
  if (row.mode === 'range' && row.vipTo < row.vipFrom) row.vipTo = row.vipFrom
}

function validateForm() {
  if (!form.value.channels.length) return '请选择所属渠道'
  if (!form.value.type) return '请选择活动类型'
  if (!form.value.currencies.length) return '请选择币种'
  if (!form.value.startAt || !form.value.endAt) return '请填写活动时间'
  if (form.value.startAt > form.value.endAt) return '活动结束时间不能早于开始时间'
  if (!form.value.title.trim()) return '请填写活动主标题'
  if (!form.value.subtitle.trim()) return '请填写活动副标题'
  if (isInviteRechargeRebateVip(form.value.type)) {
    for (const cfg of form.value.currencyConfigs) {
      if (cfg.inviterRequirePhoneBound) {
        if (!cfg.phonePrefixes.length) {
          return `请为 ${cfg.currency} 至少选择一个区号`
        }
        for (const code of cfg.phonePrefixes) {
          if (!uniqueDialOptions.some((o) => o.code === code)) {
            return `${cfg.currency} 区号 ${code} 不在可选列表中`
          }
        }
      }
      if (cfg.inviterHistoryDeposit < 0) {
        return `${cfg.currency} 邀请人历史累计存款不能为负数`
      }
      if (cfg.inviterDailyMinDeposit < 0) {
        return `${cfg.currency} 邀请人每日最低存款不能为负数`
      }
      if (cfg.inviteeHistoryDeposit < 0) {
        return `${cfg.currency} 被邀请人历史累计存款不能为负数`
      }
      if (cfg.inviteeDailyMinDeposit < 0) {
        return `${cfg.currency} 被邀请人每日最低存款不能为负数`
      }
      if (!cfg.vipDailyCaps.length) return `请配置 ${cfg.currency} 的 VIP 阶梯日上限`
      for (const row of cfg.vipDailyCaps) {
        if (!VIP_LEVEL_OPTIONS.includes(row.vipFrom as (typeof VIP_LEVEL_OPTIONS)[number])) {
          return `${cfg.currency} VIP 起始等级须在 0～9`
        }
        if (row.mode === 'range') {
          if (!VIP_LEVEL_OPTIONS.includes(row.vipTo as (typeof VIP_LEVEL_OPTIONS)[number])) {
            return `${cfg.currency} VIP 结束等级须在 0～9`
          }
          if (row.vipTo < row.vipFrom) {
            return `${cfg.currency} VIP 区间结束等级须大于等于起始等级`
          }
        }
        if (row.dailyCap < 0) return `${cfg.currency} 每日返利上限不能为负数`
      }
    }
  } else {
    for (const cfg of form.value.currencyConfigs) {
      if (!cfg.rules.length) return `请至少为 ${cfg.currency} 新增一条活动条件`
    }
  }
  return ''
}

function saveForm() {
  const err = validateForm()
  if (err) {
    formHint.value = err
    return
  }
  formHint.value = ''
  const payload = cloneActivityRow(form.value)
  const idx = rows.value.findIndex((r) => r.id === payload.id)
  if (idx >= 0) rows.value[idx] = payload
  else rows.value = [...rows.value, payload]
  actionHint.value = `已保存活动「${payload.title}」`
  closeModal()
}

function setJumpType(type: ActivityJumpType) {
  if (readonly.value) return
  form.value.jumpType = type
}

function setStatus(status: 'enabled' | 'disabled') {
  if (readonly.value) return
  form.value.status = status
}

function setShowInList(value: boolean) {
  if (readonly.value) return
  form.value.showInList = value
}
</script>

<template>
  <div class="pc-wireframe-page activity-center-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="activity-center-page__title">活动中心</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">所属渠道：</label>
        <select v-model="filter.channel" class="wf-input wf-input--select">
          <option v-for="opt in ACTIVITY_CHANNEL_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">活动主标题：</label>
        <input
          v-model="filter.title"
          type="text"
          class="wf-input"
          placeholder="请输入活动主标题"
        />

        <label class="wf-label wf-label--with-spec">
          活动类型：
          <WfSpecAnnot
            :no="ACTIVITY_CENTER_ANNOT_MAP.activityTypeFilter.no"
            :title="ACTIVITY_CENTER_ANNOT_MAP.activityTypeFilter.title"
            :items="[...ACTIVITY_CENTER_ANNOT_MAP.activityTypeFilter.items]"
          />
        </label>
        <select v-model="filter.type" class="wf-input wf-input--select activity-center-page__type-select">
          <option v-for="opt in ACTIVITY_TYPE_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">活动时间：</label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">活动状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option v-for="opt in ACTIVITY_STATUS_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openCreate">新增活动</button>
        </span>
        <p v-if="filterHint || actionHint" class="wf-modal__hint">{{ filterHint || actionHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table activity-center-page__table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">序号</th>
              <th class="wf-th">活动ID</th>
              <th class="wf-th">活动主标题</th>
              <th class="wf-th">活动副标题</th>
              <th class="wf-th">活动类型</th>
              <th class="wf-th">活动开始时间</th>
              <th class="wf-th">活动结束时间</th>
              <th class="wf-th">活动状态</th>
              <th class="wf-th">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="9" class="wf-td wf-td--empty">暂无活动数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--center">{{ row.activityId }}</td>
              <td class="wf-td">{{ row.title }}</td>
              <td class="wf-td">{{ row.subtitle }}</td>
              <td class="wf-td">{{ activityTypeLabel(row.type) }}</td>
              <td class="wf-td">{{ formatDateTime(row.startAt) }}</td>
              <td class="wf-td">{{ formatDateTime(row.endAt) }}</td>
              <td class="wf-td wf-td--center">
                <span :class="statusClass(row.status)">{{ activityStatusLabel(row.status) }}</span>
              </td>
              <td class="wf-td wf-td--actions">
                <button
                  type="button"
                  class="wf-link-action"
                  :class="{ 'wf-link-action--danger': row.status === 'enabled' }"
                  :disabled="row.status === 'ended'"
                  @click="toggleEnable(row)"
                >
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </button>
                <button type="button" class="wf-link-action" @click="openEdit(row)">编辑</button>
                <button type="button" class="wf-link-action" @click="openDetail(row)">查看详情</button>
                <button type="button" class="wf-link-action wf-link-action--danger" @click="removeRow(row)">
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
      <div v-if="modalVisible" class="wf-modal-mask" @click.self="closeModal">
        <div
          class="wf-modal wf-modal--scroll activity-center-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'activity-modal-title'"
        >
          <header class="wf-modal__header">
            <h3 id="activity-modal-title" class="wf-modal__title wf-modal__title--with-spec">
              {{ readonly ? '活动详情' : '编辑活动' }}
              <WfSpecAnnot
                :no="ACTIVITY_CENTER_ANNOT_MAP.inviteRebateConfig.no"
                :title="ACTIVITY_CENTER_ANNOT_MAP.inviteRebateConfig.title"
                :items="[...ACTIVITY_CENTER_ANNOT_MAP.inviteRebateConfig.items]"
              />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </header>

          <div class="wf-modal__body">
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">所属渠道</label>
              <div class="activity-center-modal__multi">
                <button
                  type="button"
                  class="activity-center-modal__multi-trigger"
                  :disabled="readonly"
                  @click="toggleChannelDropdown"
                >
                  <span v-if="selectedChannelText">{{ selectedChannelText }}</span>
                  <span v-else class="activity-center-modal__multi-placeholder">请选择所属渠道</span>
                  <span class="activity-center-modal__multi-arrow">▾</span>
                </button>
                <div
                  v-if="channelDropdownOpen && !readonly"
                  class="activity-center-modal__multi-panel"
                >
                  <label
                    v-for="opt in ACTIVITY_CHANNEL_FORM_OPTIONS"
                    :key="opt.value"
                    class="activity-center-modal__multi-option"
                  >
                    <input
                      type="checkbox"
                      :checked="form.channels.includes(opt.value)"
                      @change="toggleChannel(opt.value)"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动类型</label>
              <select
                v-model="form.type"
                class="wf-select wf-select--full"
                :disabled="readonly"
              >
                <option v-for="opt in ACTIVITY_TYPE_FORM_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">币种</label>
              <div class="activity-center-modal__checks">
                <label v-for="currency in ACTIVITY_CURRENCY_OPTIONS" :key="currency" class="activity-center-modal__check">
                  <input
                    type="checkbox"
                    :checked="form.currencies.includes(currency)"
                    :disabled="readonly"
                    @change="toggleCurrency(currency)"
                  />
                  {{ currency }}
                </label>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动时间</label>
              <div class="activity-center-modal__range">
                <input v-model="form.startAt" type="datetime-local" class="wf-input" :disabled="readonly" />
                <span class="wf-range-sep">-</span>
                <input v-model="form.endAt" type="datetime-local" class="wf-input" :disabled="readonly" />
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label">会员创建时间</label>
              <div class="activity-center-modal__range">
                <input
                  v-model="form.memberCreatedStart"
                  type="datetime-local"
                  class="wf-input"
                  :disabled="readonly"
                />
                <span class="wf-range-sep">-</span>
                <input
                  v-model="form.memberCreatedEnd"
                  type="datetime-local"
                  class="wf-input"
                  :disabled="readonly"
                />
              </div>
            </div>

            <!-- 邀请好友充值返利 · 按币种 Tab 配置规则 -->
            <section v-if="isInviteRechargeRebateVip(form.type)" class="activity-center-modal__rules">
              <h4 class="activity-center-modal__rules-title">
                活动规则--邀请好友充值返利（VIP阶梯自动版）
              </h4>
              <p class="activity-center-modal__rules-desc">
                仅邀请人与被邀请人均为普通会员时计算返利；任一方成为代理即取消返利资格。金额条件与到账返利均按币种区分配置与派发。结算周期：隔天以业务时区
                GMT+8 中午 12:00，向邀请人派发「昨天」产生的返利，且要求昨天邀请人、被邀请人每日最低存款均达标，并且历史累计存款也要达标。返利上限取返利计算日当日
                23:59:59 被邀请人 VIP 等级对应档位；落库当日返利金额时同步落库当日返利上限；派发时若当日应发合计超过各被邀请人上限之和，则扣减超出部分后再派发。
              </p>

              <p v-if="!form.currencyConfigs.length" class="activity-center-modal__currency-empty">
                请先勾选币种，再配置对应活动规则
              </p>

              <template v-else>
                <div v-if="showRuleCurrencyTabs" class="activity-center-modal__tabs">
                  <button
                    v-for="cfg in form.currencyConfigs"
                    :key="`tab-${cfg.currency}`"
                    type="button"
                    class="activity-center-modal__tab"
                    :class="{ 'activity-center-modal__tab--active': activeRuleCurrency === cfg.currency }"
                    @click="activeRuleCurrency = cfg.currency; closeDialDropdown()"
                  >
                    {{ cfg.currency }}
                  </button>
                </div>

                <div v-if="activeCurrencyConfig" class="activity-center-modal__tab-panel">
                  <p v-if="!showRuleCurrencyTabs" class="activity-center-modal__currency-badge">
                    当前币种：{{ activeCurrencyConfig.currency }}
                  </p>

                  <div class="activity-center-modal__condition-group">
                    <h5 class="activity-center-modal__sub-title">邀请人条件</h5>
                    <p class="activity-center-modal__condition-hint">
                      本 Tab 金额均以 {{ activeCurrencyConfig.currency }} 计量；返利亦按此币种派发给邀请人。
                    </p>
                    <div class="activity-center-modal__grid2">
                      <div class="wf-form-row activity-center-modal__phone-row">
                        <label class="wf-form-row__label wf-form-row__label--required">绑定手机号</label>
                        <div class="activity-center-modal__phone-fields">
                          <div class="activity-center-modal__radios">
                            <label>
                              <input
                                type="radio"
                                :name="`inviter-phone-bound-${activeCurrencyConfig.currency}`"
                                :checked="activeCurrencyConfig.inviterRequirePhoneBound"
                                :disabled="readonly"
                                @change="setInviterPhoneBound(true)"
                              />
                              是
                            </label>
                            <label>
                              <input
                                type="radio"
                                :name="`inviter-phone-bound-${activeCurrencyConfig.currency}`"
                                :checked="!activeCurrencyConfig.inviterRequirePhoneBound"
                                :disabled="readonly"
                                @change="setInviterPhoneBound(false)"
                              />
                              否
                            </label>
                          </div>
                          <div
                            v-if="activeCurrencyConfig.inviterRequirePhoneBound"
                            class="activity-center-modal__dial"
                          >
                            <span class="activity-center-modal__dial-label">区号</span>
                            <div class="activity-center-modal__multi activity-center-modal__dial-multi">
                              <button
                                type="button"
                                class="activity-center-modal__multi-trigger"
                                :disabled="readonly"
                                @click="dialDropdownOpen ? closeDialDropdown() : openDialDropdown()"
                              >
                                <span v-if="selectedDialText">{{ selectedDialText }}</span>
                                <span v-else class="activity-center-modal__multi-placeholder">
                                  请选择区号（可多选）
                                </span>
                                <span class="activity-center-modal__multi-arrow">
                                  {{ dialDropdownOpen ? '⌃' : '▾' }}
                                </span>
                              </button>
                              <div
                                v-if="dialDropdownOpen && !readonly"
                                class="activity-center-modal__multi-panel activity-center-modal__dial-panel"
                              >
                                <input
                                  v-model="dialSearch"
                                  type="text"
                                  class="wf-input activity-center-modal__dial-search"
                                  placeholder="搜索区号 / 国家"
                                  @click.stop
                                />
                                <label
                                  v-for="opt in filteredDialOptions"
                                  :key="`dial-${opt.code}`"
                                  class="activity-center-modal__multi-option"
                                >
                                  <input
                                    type="checkbox"
                                    :checked="activeCurrencyConfig.phonePrefixes.includes(opt.code)"
                                    @change="toggleDialCode(opt.code)"
                                  />
                                  <span>{{ opt.code }}-{{ opt.name }}</span>
                                </label>
                                <p
                                  v-if="!filteredDialOptions.length"
                                  class="activity-center-modal__dial-empty"
                                >
                                  无匹配区号
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="wf-form-row">
                        <label class="wf-form-row__label wf-form-row__label--required">历史累计存款</label>
                        <div class="activity-center-modal__suffix-field">
                          <input
                            v-model.number="activeCurrencyConfig.inviterHistoryDeposit"
                            type="number"
                            min="0"
                            step="1000"
                            class="wf-input wf-input--full"
                            :disabled="readonly"
                          />
                          <span>{{ activeCurrencyConfig.currency }}</span>
                        </div>
                      </div>
                      <div class="wf-form-row">
                        <label class="wf-form-row__label wf-form-row__label--required">每日最低存款</label>
                        <div class="activity-center-modal__suffix-field">
                          <input
                            v-model.number="activeCurrencyConfig.inviterDailyMinDeposit"
                            type="number"
                            min="0"
                            step="1000"
                            class="wf-input wf-input--full"
                            :disabled="readonly"
                          />
                          <span>{{ activeCurrencyConfig.currency }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="activity-center-modal__condition-group">
                    <h5 class="activity-center-modal__sub-title">被邀请人条件</h5>
                    <p class="activity-center-modal__condition-hint">
                      门槛按本币种 {{ activeCurrencyConfig.currency }} 配置；结算日校验「昨天」每日最低存款是否达标。
                    </p>
                    <div class="activity-center-modal__grid2">
                      <div class="wf-form-row">
                        <label class="wf-form-row__label wf-form-row__label--required">历史累计存款</label>
                        <div class="activity-center-modal__suffix-field">
                          <input
                            v-model.number="activeCurrencyConfig.inviteeHistoryDeposit"
                            type="number"
                            min="0"
                            step="1000"
                            class="wf-input wf-input--full"
                            :disabled="readonly"
                          />
                          <span>{{ activeCurrencyConfig.currency }}</span>
                        </div>
                      </div>
                      <div class="wf-form-row">
                        <label class="wf-form-row__label wf-form-row__label--required">每日最低存款</label>
                        <div class="activity-center-modal__suffix-field">
                          <input
                            v-model.number="activeCurrencyConfig.inviteeDailyMinDeposit"
                            type="number"
                            min="0"
                            step="1000"
                            class="wf-input wf-input--full"
                            :disabled="readonly"
                          />
                          <span>{{ activeCurrencyConfig.currency }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 class="activity-center-modal__sub-title">
                    被邀请人VIP对应 · 邀请人日返利上限（{{ activeCurrencyConfig.currency }}）
                  </h5>
                  <div class="wf-table-wrap">
                    <table class="wf-table">
                      <thead>
                        <tr>
                          <th class="wf-th">设置方式</th>
                          <th class="wf-th">被邀请人VIP等级</th>
                          <th class="wf-th">
                            邀请人每日返利最高上限（{{ activeCurrencyConfig.currency }}）
                          </th>
                          <th v-if="!readonly" class="wf-th">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="cap in activeCurrencyConfig.vipDailyCaps"
                          :key="cap.id"
                        >
                          <td class="wf-td">
                            <select
                              v-if="!readonly"
                              class="wf-input wf-input--select"
                              :value="cap.mode"
                              @change="
                                onVipModeChange(
                                  cap,
                                  ($event.target as HTMLSelectElement).value as VipCapMode,
                                )
                              "
                            >
                              <option
                                v-for="opt in VIP_CAP_MODE_OPTIONS"
                                :key="opt.value"
                                :value="opt.value"
                              >
                                {{ opt.label }}
                              </option>
                            </select>
                            <span v-else>
                              {{ VIP_CAP_MODE_OPTIONS.find((o) => o.value === cap.mode)?.label }}
                            </span>
                          </td>
                          <td class="wf-td">
                            <div v-if="!readonly" class="activity-center-modal__vip-level">
                              <span>VIP</span>
                              <select
                                v-model.number="cap.vipFrom"
                                class="wf-input wf-input--select activity-center-modal__vip-select"
                                @change="onVipFromChange(cap)"
                              >
                                <option
                                  v-for="level in VIP_LEVEL_OPTIONS"
                                  :key="`from-${activeCurrencyConfig.currency}-${level}`"
                                  :value="level"
                                >
                                  {{ level }}
                                </option>
                              </select>
                              <template v-if="cap.mode === 'range'">
                                <span>至</span>
                                <span>VIP</span>
                                <select
                                  v-model.number="cap.vipTo"
                                  class="wf-input wf-input--select activity-center-modal__vip-select"
                                >
                                  <option
                                    v-for="level in VIP_LEVEL_OPTIONS"
                                    :key="`to-${activeCurrencyConfig.currency}-${level}`"
                                    :value="level"
                                    :disabled="level < cap.vipFrom"
                                  >
                                    {{ level }}
                                  </option>
                                </select>
                              </template>
                              <span v-else-if="cap.mode === 'and_above'">及以上</span>
                            </div>
                            <span v-else>{{ formatVipCapLabel(cap) }}</span>
                          </td>
                          <td class="wf-td">
                            <input
                              v-if="!readonly"
                              v-model.number="cap.dailyCap"
                              type="number"
                              min="0"
                              step="1000"
                              class="wf-input"
                            />
                            <span v-else>{{ formatAmount(cap.dailyCap) }}</span>
                          </td>
                          <td v-if="!readonly" class="wf-td">
                            <button
                              type="button"
                              class="wf-link-action wf-link-action--danger"
                              @click="removeVipCap(activeCurrencyConfig, cap.id)"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!activeCurrencyConfig.vipDailyCaps.length">
                          <td :colspan="readonly ? 3 : 4" class="wf-td wf-td--empty">
                            暂无 VIP 阶梯配置
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    v-if="!readonly"
                    type="button"
                    class="wf-btn wf-btn--primary activity-center-modal__add-rule"
                    @click="addVipCap(activeCurrencyConfig)"
                  >
                    新增 VIP 阶梯
                  </button>
                </div>
              </template>
            </section>

            <!-- 通用活动规则表：多币种 Tab -->
            <section v-else class="activity-center-modal__rules">
              <h4 class="activity-center-modal__rules-title">
                活动规则--{{ activityTypeLabel(form.type) }}
              </h4>
              <p v-if="!form.currencyConfigs.length" class="activity-center-modal__currency-empty">
                请先勾选币种，再配置对应金额条件
              </p>
              <template v-else>
                <div v-if="showRuleCurrencyTabs" class="activity-center-modal__tabs">
                  <button
                    v-for="cfg in form.currencyConfigs"
                    :key="`rule-tab-${cfg.currency}`"
                    type="button"
                    class="activity-center-modal__tab"
                    :class="{ 'activity-center-modal__tab--active': activeRuleCurrency === cfg.currency }"
                    @click="activeRuleCurrency = cfg.currency"
                  >
                    {{ cfg.currency }}
                  </button>
                </div>
                <div v-if="activeCurrencyConfig" class="activity-center-modal__tab-panel">
                  <p v-if="!showRuleCurrencyTabs" class="activity-center-modal__currency-badge">
                    当前币种：{{ activeCurrencyConfig.currency }}
                  </p>
                  <div class="wf-table-wrap">
                    <table class="wf-table">
                      <thead>
                        <tr>
                          <th class="wf-th">触发规则 / 新增日期</th>
                          <th class="wf-th">
                            赠送形式 / 固定优惠金额（{{ activeCurrencyConfig.currency }}）
                          </th>
                          <th class="wf-th">提现规则 / 流水倍数</th>
                          <th v-if="!readonly" class="wf-th">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="rule in activeCurrencyConfig.rules" :key="rule.id">
                          <td class="wf-td">
                            <div class="activity-center-modal__range">
                              <input
                                v-model="rule.startAt"
                                type="datetime-local"
                                class="wf-input"
                                :disabled="readonly"
                              />
                              <span class="wf-range-sep">-</span>
                              <input
                                v-model="rule.endAt"
                                type="datetime-local"
                                class="wf-input"
                                :disabled="readonly"
                              />
                            </div>
                          </td>
                          <td class="wf-td">
                            <div class="activity-center-modal__suffix-field">
                              <input
                                v-model.number="rule.giftAmount"
                                type="number"
                                min="0"
                                class="wf-input"
                                :disabled="readonly"
                              />
                              <span>{{ activeCurrencyConfig.currency }}</span>
                            </div>
                          </td>
                          <td class="wf-td">
                            <div class="activity-center-modal__suffix-field">
                              <input
                                v-model.number="rule.turnoverMultiple"
                                type="number"
                                min="0"
                                class="wf-input"
                                :disabled="readonly"
                              />
                              <span>倍</span>
                            </div>
                          </td>
                          <td v-if="!readonly" class="wf-td">
                            <button
                              type="button"
                              class="wf-link-action wf-link-action--danger"
                              @click="removeRule(activeCurrencyConfig, rule.id)"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!activeCurrencyConfig.rules.length">
                          <td :colspan="readonly ? 3 : 4" class="wf-td wf-td--empty">
                            暂无 {{ activeCurrencyConfig.currency }} 活动条件
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    v-if="!readonly"
                    type="button"
                    class="wf-btn wf-btn--primary activity-center-modal__add-rule"
                    @click="addRule(activeCurrencyConfig)"
                  >
                    新增活动条件
                  </button>
                </div>
              </template>
            </section>

            <div class="wf-form-row">
              <label class="wf-form-row__label">游戏种类</label>
              <div class="activity-center-modal__chips">
                <button
                  v-for="game in ACTIVITY_GAME_CATEGORIES"
                  :key="game"
                  type="button"
                  class="activity-center-modal__chip"
                  :class="{ 'activity-center-modal__chip--active': form.gameCategories.includes(game) }"
                  :disabled="readonly"
                  @click="toggleGame(game)"
                >
                  {{ game }}
                </button>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动主标题</label>
              <input
                v-model="form.title"
                type="text"
                class="wf-input wf-input--full"
                :disabled="readonly"
                placeholder="请输入活动主标题"
              />
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动副标题</label>
              <input
                v-model="form.subtitle"
                type="text"
                class="wf-input wf-input--full"
                :disabled="readonly"
                placeholder="请输入活动副标题"
              />
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动主图</label>
              <div class="activity-center-modal__cover">
                <div class="activity-center-modal__cover-box">
                  {{ form.coverUrl ? '已上传主图' : '点击上传（原型占位）' }}
                </div>
                <p class="activity-center-modal__cover-tip">仅支持格式为 jpg、jpeg、png</p>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动状态</label>
              <div class="activity-center-modal__radios">
                <label>
                  <input
                    type="radio"
                    name="activity-status"
                    :checked="form.status === 'enabled'"
                    :disabled="readonly"
                    @change="setStatus('enabled')"
                  />
                  启用
                </label>
                <label>
                  <input
                    type="radio"
                    name="activity-status"
                    :checked="form.status !== 'enabled'"
                    :disabled="readonly"
                    @change="setStatus('disabled')"
                  />
                  禁用
                </label>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">是否显示在列表</label>
              <div class="activity-center-modal__radios">
                <label>
                  <input
                    type="radio"
                    name="show-in-list"
                    :checked="form.showInList"
                    :disabled="readonly"
                    @change="setShowInList(true)"
                  />
                  是
                </label>
                <label>
                  <input
                    type="radio"
                    name="show-in-list"
                    :checked="!form.showInList"
                    :disabled="readonly"
                    @change="setShowInList(false)"
                  />
                  否
                </label>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">活动跳转链接</label>
              <div class="activity-center-modal__radios">
                <label>
                  <input
                    type="radio"
                    name="jump-type"
                    :checked="form.jumpType === 'internal'"
                    :disabled="readonly"
                    @change="setJumpType('internal')"
                  />
                  内部页面
                </label>
                <label>
                  <input
                    type="radio"
                    name="jump-type"
                    :checked="form.jumpType === 'external'"
                    :disabled="readonly"
                    @change="setJumpType('external')"
                  />
                  外部链接
                </label>
                <label>
                  <input
                    type="radio"
                    name="jump-type"
                    :checked="form.jumpType === 'none'"
                    :disabled="readonly"
                    @change="setJumpType('none')"
                  />
                  无跳转
                </label>
              </div>
            </div>

            <div v-if="form.jumpType !== 'none'" class="wf-form-row">
              <label class="wf-form-row__label">APP跳转地址</label>
              <input
                v-model="form.appJumpUrl"
                type="text"
                class="wf-input wf-input--full"
                :disabled="readonly"
                placeholder="请输入 APP 跳转地址"
              />
            </div>

            <div v-if="form.jumpType !== 'none'" class="wf-form-row">
              <label class="wf-form-row__label">H5跳转地址</label>
              <input
                v-model="form.h5JumpUrl"
                type="text"
                class="wf-input wf-input--full"
                :disabled="readonly"
                placeholder="请输入 H5 跳转地址"
              />
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label">排序</label>
              <input
                v-model.number="form.sort"
                type="number"
                min="0"
                class="wf-input"
                :disabled="readonly"
              />
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>

            <div v-if="readonly && isInviteRechargeRebateVip(form.type)" class="activity-center-modal__readonly-note">
              <p><strong>自动派发逻辑摘要：</strong></p>
              <ol>
                <li>
                  资格：邀请人与被邀请人均须为普通会员；任一方成为代理则取消返利资格。返利仅发放给邀请人。
                </li>
                <li>
                  邀请人条件（按币种）：
                  <template v-for="(cfg, idx) in form.currencyConfigs" :key="`inv-${cfg.currency}`">
                    {{ cfg.currency }}
                    {{
                      cfg.inviterRequirePhoneBound
                        ? `须绑手机（区号 ${formatPhonePrefixesLabel(cfg.phonePrefixes) || '-'}）`
                        : '不强制绑手机'
                    }}，历史累计 ≥
                    {{ formatAmount(cfg.inviterHistoryDeposit) }}，每日最低 ≥
                    {{ formatAmount(cfg.inviterDailyMinDeposit)
                    }}{{ idx < form.currencyConfigs.length - 1 ? '；' : '' }}
                  </template>
                </li>
                <li>
                  被邀请人条件（按币种）：
                  <template v-for="(cfg, idx) in form.currencyConfigs" :key="`ivt-${cfg.currency}`">
                    {{ cfg.currency }} 历史累计 ≥ {{ formatAmount(cfg.inviteeHistoryDeposit) }}，每日最低 ≥
                    {{ formatAmount(cfg.inviteeDailyMinDeposit)
                    }}{{ idx < form.currencyConfigs.length - 1 ? '；' : '' }}
                  </template>
                </li>
                <li>
                  结算：隔天 GMT+8 12:00 派发「昨天」返利；须昨天邀请人、被邀请人每日最低存款均达标，并且历史累计存款也要达标。
                </li>
                <li>
                  上限：以返利计算日 23:59:59 被邀请人 VIP 对应日上限；落库返利金额时同步落库当日上限；若当日应发合计超过各被邀请人上限之和，扣减超出后再派发。
                </li>
              </ol>
              <p>
                当前渠道：{{ form.channels.map(channelLabel).join('、') || '-' }}；按币种配置金额条件与返利派发。
              </p>
            </div>
          </div>

          <footer class="wf-modal__footer wf-modal__footer--center">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">
              {{ readonly ? '关闭' : '取消' }}
            </button>
            <button v-if="!readonly" type="button" class="wf-btn wf-btn--primary wf-btn--lg" @click="saveForm">
              确认
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.activity-center-page__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.activity-center-page__type-select {
  min-width: 240px;
  width: auto;
}

.activity-center-page__table {
  table-layout: auto;
  min-width: 1200px;
}

.activity-center-page__table .wf-td--actions .wf-link-action {
  margin-right: 10px;
}

.activity-status--on {
  color: #67c23a;
}

.activity-status--off {
  color: var(--pc-text-secondary, #666);
}

.activity-status--ended {
  color: #f56c6c;
}

.activity-center-modal {
  max-width: 920px;
}

.activity-center-modal__chips,
.activity-center-modal__checks,
.activity-center-modal__radios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}

.activity-center-modal__multi {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.activity-center-modal__multi-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: var(--pc-control-height, 32px);
  padding: 4px 11px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: var(--pc-radius, 2px);
  background: #fff;
  color: var(--pc-text, #333);
  text-align: left;
  cursor: pointer;
}

.activity-center-modal__multi-trigger:disabled {
  cursor: not-allowed;
  background: #f5f5f5;
  color: var(--pc-text-secondary, #666);
}

.activity-center-modal__multi-placeholder {
  color: var(--pc-text-muted, #999);
}

.activity-center-modal__multi-arrow {
  color: var(--pc-text-muted, #999);
  font-size: 12px;
}

.activity-center-modal__multi-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 20;
  width: 100%;
  max-height: 200px;
  overflow: auto;
  padding: 6px 0;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: var(--pc-radius, 2px);
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.activity-center-modal__multi-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
}

.activity-center-modal__multi-option:hover {
  background: #f5f7fa;
}

.activity-center-modal__chip {
  padding: 4px 10px;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 2px;
  background: #fff;
  cursor: pointer;
}

.activity-center-modal__chip--active {
  border-color: var(--pc-primary, #1890ff);
  background: #e6f4ff;
  color: var(--pc-primary, #1890ff);
}

.activity-center-modal__chip:disabled,
.activity-center-modal__check input:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.activity-center-modal__range,
.activity-center-modal__suffix-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-center-modal__rules {
  margin: 8px 0 20px;
  padding: 12px;
  border: 1px solid var(--pc-border-light, #e8e8e8);
  border-radius: 4px;
  background: #fafafa;
}

.activity-center-modal__rules-title,
.activity-center-modal__sub-title {
  margin: 0 0 10px;
  padding-left: 8px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 14px;
  font-weight: 600;
}

.activity-center-modal__currency-block {
  margin-top: 12px;
  padding: 12px 14px 14px;
  border: 1px solid var(--pc-border, #e5e5e5);
  border-radius: 6px;
  background: #fff;
}

.activity-center-modal__currency-block .activity-center-modal__sub-title {
  margin-top: 12px;
}

.activity-center-modal__currency-block .activity-center-modal__sub-title:first-child {
  margin-top: 0;
}

.activity-center-modal__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0 0 14px;
  border-bottom: 1px solid var(--pc-border, #e5e5e5);
}

.activity-center-modal__tab {
  margin-bottom: -1px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: transparent;
  color: var(--pc-text-secondary, #666);
  font-size: 13px;
  cursor: pointer;
}

.activity-center-modal__tab:hover {
  color: var(--pc-primary, #1890ff);
}

.activity-center-modal__tab--active {
  border-color: var(--pc-border, #e5e5e5);
  background: #fff;
  color: var(--pc-primary, #1890ff);
  font-weight: 600;
}

.activity-center-modal__tab-panel {
  padding-top: 4px;
}

.activity-center-modal__help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  border-radius: 50%;
  background: #faad14;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  vertical-align: middle;
  cursor: help;
}

.activity-center-modal__help-tip {
  position: absolute;
  z-index: 30;
  left: 50%;
  bottom: calc(100% + 8px);
  width: 260px;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.55;
  text-align: left;
  white-space: normal;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.activity-center-modal__help-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.activity-center-modal__help:hover .activity-center-modal__help-tip,
.activity-center-modal__help:focus .activity-center-modal__help-tip,
.activity-center-modal__help:focus-within .activity-center-modal__help-tip {
  opacity: 1;
  visibility: visible;
}

.activity-center-modal__condition-group {
  margin-bottom: 16px;
  padding: 12px 14px 14px;
  border: 1px solid var(--pc-border, #e8e8e8);
  border-radius: 6px;
  background: #fff;
}

.activity-center-modal__condition-group .activity-center-modal__sub-title {
  margin-top: 0;
}

.activity-center-modal__condition-hint {
  margin: 0 0 12px;
  color: var(--pc-text-secondary, #666);
  font-size: 12px;
  line-height: 1.5;
}

.activity-center-modal__currency-badge {
  margin: 0 0 12px;
  color: var(--pc-text-secondary, #666);
  font-size: 12px;
}

.activity-center-modal__currency-empty {
  margin: 12px 0 0;
  color: var(--pc-text-muted, #999);
  font-size: 13px;
}

.activity-center-modal__phone-row {
  grid-column: 1 / -1;
}

.activity-center-modal__phone-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 16px;
  width: 100%;
}

.activity-center-modal__dial {
  display: flex;
  flex: 1 1 280px;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 420px;
}

.activity-center-modal__dial-label {
  flex-shrink: 0;
  color: var(--pc-text, #333);
  font-size: 13px;
  white-space: nowrap;
}

.activity-center-modal__dial-label::before {
  content: '*';
  margin-right: 2px;
  color: #f56c6c;
}

.activity-center-modal__dial-multi {
  flex: 1;
  max-width: none;
}

.activity-center-modal__dial-search {
  width: calc(100% - 16px);
  margin: 8px 8px 4px;
}

.activity-center-modal__dial-trigger {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.activity-center-modal__dial-trigger--open {
  border-color: var(--pc-primary, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
}

.activity-center-modal__dial-input {
  flex: 1;
  min-width: 0;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.activity-center-modal__dial-arrow {
  flex: none;
  width: 32px;
  border: none;
  background: transparent;
  color: var(--pc-text-secondary, #666);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.activity-center-modal__dial-arrow:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.activity-center-modal__dial-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow: auto;
  padding: 6px 0;
  border: 1px solid var(--pc-border, #e5e5e5);
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.activity-center-modal__dial-panel::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 24px;
  width: 10px;
  height: 10px;
  border-left: 1px solid var(--pc-border, #e5e5e5);
  border-top: 1px solid var(--pc-border, #e5e5e5);
  background: #fff;
  transform: rotate(45deg);
}

.activity-center-modal__dial-option {
  display: block;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: var(--pc-text, #333);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.activity-center-modal__dial-option:hover {
  background: #f5f7fa;
}

.activity-center-modal__dial-option--active {
  background: #e6f4ff;
  color: var(--pc-primary, #1890ff);
}

.activity-center-modal__dial-empty {
  margin: 0;
  padding: 12px;
  color: var(--pc-text-muted, #999);
  font-size: 12px;
  text-align: center;
}

.activity-center-modal__prefix-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.activity-center-modal__prefix-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-center-modal__prefix-currency {
  min-width: 36px;
  color: var(--pc-text-secondary, #666);
  font-size: 12px;
}

.activity-center-modal__prefix-input {
  width: 88px;
}

.activity-center-modal__prefix-tip {
  color: var(--pc-text-muted, #999);
  font-size: 12px;
}

.activity-center-modal__rules-desc {
  margin: 0 0 14px;
  color: var(--pc-text-secondary, #666);
  font-size: 12px;
  line-height: 1.6;
}

.activity-center-modal__grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.activity-center-modal__add-rule {
  margin-top: 12px;
}

.activity-center-modal__vip-level {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.activity-center-modal__vip-select {
  width: 88px;
}

.activity-center-modal__cover-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 90px;
  border: 1px dashed var(--pc-border, #d9d9d9);
  background: #fff;
  color: var(--pc-text-muted, #999);
  font-size: 12px;
}

.activity-center-modal__cover-tip {
  margin: 6px 0 0;
  color: var(--pc-text-muted, #999);
  font-size: 12px;
}

.activity-center-modal__readonly-note {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  font-size: 13px;
  line-height: 1.6;
  color: var(--pc-text-secondary, #666);
}

.activity-center-modal__readonly-note ol {
  margin: 8px 0;
  padding-left: 18px;
}
</style>
