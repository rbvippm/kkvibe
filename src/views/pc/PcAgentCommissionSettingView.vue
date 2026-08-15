<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfAgentCommissionSettingAnnot from '../../components/wireframe/WfAgentCommissionSettingAnnot.vue'
import {
  COMMISSION_CURRENCY_OPTIONS,
  MIN_ACTIVE_MEMBERS_TIP,
  MONTHLY_TOTAL_PROFIT_TIP,
  createEmptyMonthlyTier,
  formatPct,
  formatProfit,
  getDefaultCommissionConfigs,
  type CommissionCurrency,
  type MonthlyCommissionTier,
} from '../../constants/agentCommissionSetting'
import '../../styles/pc-wireframe.css'

const configs = ref(getDefaultCommissionConfigs())
const filterCurrency = ref<CommissionCurrency>('KKC')
const appliedCurrency = ref<CommissionCurrency>('KKC')

const currentConfig = computed(() => configs.value[appliedCurrency.value])

type ColumnTipId = 'profit' | 'active'
type ColumnTipSource = 'list' | 'modal'
type ColumnTipKey = `${ColumnTipId}-${ColumnTipSource}`

const COLUMN_TIP_TEXT: Record<ColumnTipId, string> = {
  profit: MONTHLY_TOTAL_PROFIT_TIP,
  active: MIN_ACTIVE_MEMBERS_TIP,
}

const columnTipKey = ref<ColumnTipKey | null>(null)
const columnTipStyle = ref<Record<string, string>>({})
const columnTipTriggerRef = ref<HTMLButtonElement | null>(null)

const columnTipText = computed(() => {
  if (!columnTipKey.value) return ''
  const id = columnTipKey.value.split('-')[0] as ColumnTipId
  return COLUMN_TIP_TEXT[id]
})

function updateColumnTipPosition() {
  const trigger = columnTipTriggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const panelWidth = 320
  const gap = 8
  let left = rect.left + rect.width / 2
  const minLeft = panelWidth / 2 + 8
  const maxLeft = window.innerWidth - panelWidth / 2 - 8
  left = Math.min(Math.max(left, minLeft), maxLeft)
  columnTipStyle.value = {
    left: `${left}px`,
    top: `${rect.bottom + gap}px`,
  }
}

function bindColumnTipListeners() {
  window.addEventListener('scroll', updateColumnTipPosition, true)
  window.addEventListener('resize', updateColumnTipPosition)
  document.addEventListener('pointerdown', onColumnTipPointerDown)
}

function unbindColumnTipListeners() {
  window.removeEventListener('scroll', updateColumnTipPosition, true)
  window.removeEventListener('resize', updateColumnTipPosition)
  document.removeEventListener('pointerdown', onColumnTipPointerDown)
}

function closeColumnTip() {
  columnTipKey.value = null
  columnTipTriggerRef.value = null
  unbindColumnTipListeners()
}

function onColumnTipPointerDown(event: PointerEvent) {
  if (!columnTipKey.value) return
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('.commission-setting__tip-btn')) return
  const panel = document.getElementById('commission-column-tip')
  if (panel?.contains(target)) return
  closeColumnTip()
}

async function toggleColumnTip(id: ColumnTipId, source: ColumnTipSource, event: MouseEvent) {
  event.stopPropagation()
  const key: ColumnTipKey = `${id}-${source}`
  const trigger = event.currentTarget as HTMLButtonElement
  if (columnTipKey.value === key) {
    closeColumnTip()
    return
  }
  unbindColumnTipListeners()
  columnTipKey.value = key
  columnTipTriggerRef.value = trigger
  await nextTick()
  updateColumnTipPosition()
  bindColumnTipListeners()
}

onUnmounted(() => {
  unbindColumnTipListeners()
})

function applyFilter() {
  appliedCurrency.value = filterCurrency.value
}

function resetFilter() {
  filterCurrency.value = 'KKC'
  appliedCurrency.value = 'KKC'
}

/* ---------- 编辑当月佣金 ---------- */
const monthlyEditVisible = ref(false)
const monthlyDraft = ref<MonthlyCommissionTier[]>([])
const monthlySelectedIds = ref<string[]>([])
const monthlyHint = ref('')

function openMonthlyEdit() {
  monthlyDraft.value = currentConfig.value.monthlyTiers.map((t) => ({ ...t }))
  monthlySelectedIds.value = []
  monthlyHint.value = ''
  monthlyEditVisible.value = true
}

function closeMonthlyEdit() {
  monthlyEditVisible.value = false
  monthlyDraft.value = []
  monthlySelectedIds.value = []
  monthlyHint.value = ''
  if (columnTipKey.value?.endsWith('-modal')) closeColumnTip()
}

function toggleMonthlySelect(id: string, checked: boolean) {
  if (checked) {
    if (!monthlySelectedIds.value.includes(id)) {
      monthlySelectedIds.value = [...monthlySelectedIds.value, id]
    }
    return
  }
  monthlySelectedIds.value = monthlySelectedIds.value.filter((x) => x !== id)
}

function addMonthlyRow() {
  monthlyDraft.value = [...monthlyDraft.value, createEmptyMonthlyTier()]
  monthlyHint.value = ''
}

function removeMonthlyRows() {
  if (!monthlySelectedIds.value.length) {
    monthlyHint.value = '请先勾选要删除的档位'
    return
  }
  const remainCount = monthlyDraft.value.length - monthlySelectedIds.value.length
  if (remainCount < 1) {
    monthlyHint.value = '每个币种至少保留 1 条档位作为兜底，无法全部删除'
    return
  }
  const idSet = new Set(monthlySelectedIds.value)
  monthlyDraft.value = monthlyDraft.value.filter((row) => !idSet.has(row.id))
  monthlySelectedIds.value = []
  monthlyHint.value = ''
}

function submitMonthlyEdit() {
  if (monthlyDraft.value.length < 1) {
    monthlyHint.value = '每个币种至少保留 1 条档位作为兜底'
    return
  }
  for (const row of monthlyDraft.value) {
    if (
      !Number.isFinite(row.monthlyProfit) ||
      row.monthlyProfit < 0 ||
      !Number.isFinite(row.minActiveMembers) ||
      row.minActiveMembers < 0 ||
      !Number.isFinite(row.commissionPct) ||
      row.commissionPct < 0
    ) {
      monthlyHint.value = '请填写有效的非负数值'
      return
    }
  }
  configs.value[appliedCurrency.value] = {
    ...configs.value[appliedCurrency.value],
    monthlyTiers: monthlyDraft.value.map((t) => ({ ...t })),
  }
  closeMonthlyEdit()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">币种：</label>
        <select v-model="filterCurrency" class="wf-input wf-input--select">
          <option v-for="opt in COMMISSION_CURRENCY_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <WfAgentCommissionSettingAnnot context="currencyFilter" placement="bottom" />
        <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">查询</button>
        <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
      </div>

      <div class="commission-setting__panel">
        <div class="commission-setting__panel-head">
          <h3 class="commission-setting__panel-title">
            {{ appliedCurrency }}-当月佣金设置
            <WfAgentCommissionSettingAnnot context="monthlyList" placement="bottom" />
          </h3>
          <span class="commission-setting__panel-actions">
            <button type="button" class="wf-link-action" @click="openMonthlyEdit">编辑</button>
            <WfAgentCommissionSettingAnnot context="monthlyEdit" placement="bottom" />
          </span>
        </div>
        <div class="wf-table-wrap">
          <table class="wf-table">
            <thead>
              <tr>
                <th class="wf-th">
                  <span class="commission-setting__th-label">
                    当月总盈利
                    <button
                      type="button"
                      class="commission-setting__tip-btn"
                      aria-label="查看当月总盈利说明"
                      :aria-expanded="columnTipKey === 'profit-list'"
                      @click="toggleColumnTip('profit', 'list', $event)"
                    >
                      !
                    </button>
                  </span>
                </th>
                <th class="wf-th">
                  <span class="commission-setting__th-label">
                    最低活跃人数
                    <button
                      type="button"
                      class="commission-setting__tip-btn"
                      aria-label="查看最低活跃人数说明"
                      :aria-expanded="columnTipKey === 'active-list'"
                      @click="toggleColumnTip('active', 'list', $event)"
                    >
                      !
                    </button>
                  </span>
                </th>
                <th class="wf-th">代理佣金(%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentConfig.monthlyTiers.length === 0">
                <td colspan="3" class="wf-td wf-td--empty">暂无数据</td>
              </tr>
              <tr v-for="row in currentConfig.monthlyTiers" :key="row.id">
                <td class="wf-td">{{ formatProfit(row.monthlyProfit) }}</td>
                <td class="wf-td">{{ row.minActiveMembers }}</td>
                <td class="wf-td">{{ formatPct(row.commissionPct) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="monthlyEditVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeMonthlyEdit"
      >
        <div
          class="wf-modal wf-modal--scroll"
          role="dialog"
          aria-labelledby="commission-monthly-edit-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="commission-monthly-edit-title" class="wf-modal__title">编辑当月佣金设置</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeMonthlyEdit">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <div class="commission-setting__modal-toolbar">
              <div class="commission-setting__modal-currency">
                <span class="wf-label">币种：</span>
                <span class="commission-setting__modal-currency-value">{{ appliedCurrency }}</span>
              </div>
              <span class="commission-setting__modal-btns">
                <button type="button" class="wf-btn wf-btn--add" @click="addMonthlyRow">添加</button>
                <button
                  type="button"
                  class="wf-btn wf-btn--danger"
                  :disabled="monthlySelectedIds.length === 0"
                  @click="removeMonthlyRows"
                >
                  删除
                </button>
              </span>
            </div>

            <div class="wf-table-wrap">
              <table class="wf-table">
                <thead>
                  <tr>
                    <th class="wf-th wf-th--no">选</th>
                    <th class="wf-th">
                      <span class="commission-setting__th-label">
                        当月总盈利
                        <button
                          type="button"
                          class="commission-setting__tip-btn"
                          aria-label="查看当月总盈利说明"
                          :aria-expanded="columnTipKey === 'profit-modal'"
                          @click="toggleColumnTip('profit', 'modal', $event)"
                        >
                          !
                        </button>
                      </span>
                    </th>
                    <th class="wf-th">
                      <span class="commission-setting__th-label">
                        最低活跃人数
                        <button
                          type="button"
                          class="commission-setting__tip-btn"
                          aria-label="查看最低活跃人数说明"
                          :aria-expanded="columnTipKey === 'active-modal'"
                          @click="toggleColumnTip('active', 'modal', $event)"
                        >
                          !
                        </button>
                      </span>
                    </th>
                    <th class="wf-th">代理佣金(%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="monthlyDraft.length === 0">
                    <td colspan="4" class="wf-td wf-td--empty">暂无档位，请点击「添加」</td>
                  </tr>
                  <tr v-for="row in monthlyDraft" :key="row.id">
                    <td class="wf-td wf-td--center">
                      <input
                        type="checkbox"
                        :checked="monthlySelectedIds.includes(row.id)"
                        @change="
                          toggleMonthlySelect(
                            row.id,
                            ($event.target as HTMLInputElement).checked,
                          )
                        "
                      />
                    </td>
                    <td class="wf-td">
                      <input
                        v-model.number="row.monthlyProfit"
                        type="number"
                        min="0"
                        class="wf-input wf-input--full"
                        placeholder="请输入数据"
                      />
                    </td>
                    <td class="wf-td">
                      <input
                        v-model.number="row.minActiveMembers"
                        type="number"
                        min="0"
                        class="wf-input wf-input--full"
                        placeholder="请输入数据"
                      />
                    </td>
                    <td class="wf-td">
                      <input
                        v-model.number="row.commissionPct"
                        type="number"
                        min="0"
                        step="0.01"
                        class="wf-input wf-input--full"
                        placeholder="请输入数据"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="monthlyHint" class="wf-modal__hint">{{ monthlyHint }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeMonthlyEdit">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="submitMonthlyEdit">提交</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="columnTipKey"
        id="commission-column-tip"
        class="commission-setting__tip-bubble"
        role="tooltip"
        :style="columnTipStyle"
      >
        {{ columnTipText }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.commission-setting__panel {
  border: 1px solid var(--pc-border-light, #e8e8e8);
  border-radius: var(--pc-radius, 2px);
  overflow: hidden;
}

.commission-setting__panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pc-border-light, #e8e8e8);
  background: #fafafa;
}

.commission-setting__panel-title {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--pc-text, #333);
}

.commission-setting__panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.commission-setting__modal-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.commission-setting__modal-currency {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.commission-setting__modal-currency-value {
  font-size: 14px;
  color: var(--pc-text, #333);
}

.commission-setting__modal-btns {
  display: inline-flex;
  gap: 8px;
}

.commission-setting__th-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.commission-setting__tip-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: #8c8c8c;
  background: #fff;
  border: 1px solid #bfbfbf;
  border-radius: 50%;
  cursor: pointer;
}

.commission-setting__tip-btn:hover,
.commission-setting__tip-btn:focus-visible,
.commission-setting__tip-btn[aria-expanded='true'] {
  color: #1677ff;
  border-color: #1677ff;
  outline: none;
}

.commission-setting__tip-bubble {
  position: fixed;
  z-index: 1200;
  width: min(320px, calc(100vw - 16px));
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.55;
  color: #fff;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  background: rgb(0 0 0 / 78%);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 16%);
  transform: translateX(-50%);
  pointer-events: auto;
}
</style>
