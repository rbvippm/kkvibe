<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfAgentCommissionSettingAnnot from '../../components/wireframe/WfAgentCommissionSettingAnnot.vue'
import {
  COMMISSION_CURRENCY_OPTIONS,
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
  const idSet = new Set(monthlySelectedIds.value)
  monthlyDraft.value = monthlyDraft.value.filter((row) => !idSet.has(row.id))
  monthlySelectedIds.value = []
  monthlyHint.value = ''
}

function submitMonthlyEdit() {
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
                <th class="wf-th">当月团队游戏输赢</th>
                <th class="wf-th">最低活跃会员要求</th>
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
                    <th class="wf-th">当月团队游戏输赢</th>
                    <th class="wf-th">最低活跃会员要求</th>
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
</style>
