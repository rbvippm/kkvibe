<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PcReconcileDataSection from '../../components/pc/PcReconcileDataSection.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  CHANNEL_DATA_STATS,
  CHANNEL_DETAIL_FIELDS,
  CHANNEL_HOLDINGS,
  formatReconcileValue,
  parseReconcileLedger,
  RECONCILE_AMOUNT_COLUMNS,
  RECONCILE_CHANNELS,
  RECONCILE_CURRENCIES,
  RECONCILE_LEDGER_TABS,
  RECONCILE_TIMEZONES,
  reconcileRowsOf,
  sumReconcileRows,
  type ReconcileChannel,
  type ReconcileLedger,
} from '../../constants/billingReconcile'
import {
  CHANNEL_RECONCILE_DETAIL_SPEC,
  CHANNEL_RECONCILE_FILTER_SPEC,
  CHANNEL_RECONCILE_SPEC_ANNOT_NO as ANNOT_NO,
  CHANNEL_RECONCILE_TABLE_SPEC,
  CHANNEL_RECONCILE_TABS_SPEC,
} from '../../constants/channelReconcileSpec'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import { showPcToast } from '../../composables/usePcToast'
import '../../styles/pc-wireframe.css'

type ChannelFilter = { channelNo: number | ''; currency: string; timezone: string }

const route = useRoute()
const router = useRouter()

const ledger = computed<ReconcileLedger>(() => parseReconcileLedger(route.query.tab))

const defaultFilter = (l: ReconcileLedger): ChannelFilter => ({
  channelNo: '',
  currency: RECONCILE_CURRENCIES[l][0]!,
  timezone: RECONCILE_TIMEZONES[0],
})

/** 各 Tab 的筛选独立保存 */
const filters = reactive<Record<ReconcileLedger, ChannelFilter>>({
  cash: defaultFilter('cash'),
  credit: defaultFilter('credit'),
})
const appliedFilters = reactive<Record<ReconcileLedger, ChannelFilter>>({
  cash: defaultFilter('cash'),
  credit: defaultFilter('credit'),
})

const filter = computed(() => filters[ledger.value])
const applied = computed(() => appliedFilters[ledger.value])
const columns = computed(() => RECONCILE_AMOUNT_COLUMNS[ledger.value])

const channelRows = computed(() => {
  const rows = reconcileRowsOf(ledger.value, applied.value.currency)
  return RECONCILE_CHANNELS.filter((ch) => applied.value.channelNo === '' || ch.no === applied.value.channelNo)
    .map((ch) => ({ channel: ch, totals: sumReconcileRows(rows.filter((r) => r.user.channelNo === ch.no)) }))
    .sort((a, b) => b.channel.no - a.channel.no)
})

function switchTab(tab: ReconcileLedger) {
  if (tab === ledger.value) return
  void router.replace({ query: { ...route.query, tab } })
}

function search() {
  appliedFilters[ledger.value] = { ...filter.value }
}

function clearFilter() {
  filters[ledger.value] = defaultFilter(ledger.value)
  appliedFilters[ledger.value] = defaultFilter(ledger.value)
}

function exportList() {
  const count = channelRows.value.length
  if (count) showPcToast(`已导出 ${applied.value.currency} 渠道对账 ${count} 条`)
  else showPcToast('暂无数据可导出', 'info')
}

const detail = ref<{ ledger: ReconcileLedger; currency: string; channel: ReconcileChannel } | null>(null)

const detailTotals = computed(() => {
  if (!detail.value) return null
  const { ledger: l, currency, channel } = detail.value
  return sumReconcileRows(reconcileRowsOf(l, currency).filter((r) => r.user.channelNo === channel.no))
})

function openDetail(channel: ReconcileChannel) {
  detail.value = { ledger: ledger.value, currency: applied.value.currency, channel }
}
</script>

<template>
  <div class="pc-wireframe-page channel-reconcile">
    <WfPagePathMenu />

    <div class="wf-top">
      <div class="wf-tabs">
        <div v-for="tab in RECONCILE_LEDGER_TABS" :key="tab.value" class="wf-tab-item">
          <button
            type="button"
            class="wf-tab"
            :class="{ 'wf-tab--active': ledger === tab.value }"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </button>
          <WfSpecAnnot
            v-if="tab.value === 'credit'"
            :no="ANNOT_NO.tabs"
            title="现金 / 信用 Tab"
            :items="[...CHANNEL_RECONCILE_TABS_SPEC]"
          />
        </div>
      </div>
    </div>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          所属渠道：
          <WfSpecAnnot :no="ANNOT_NO.filters" title="列表筛选" :items="[...CHANNEL_RECONCILE_FILTER_SPEC]" />
        </label>
        <select v-model="filter.channelNo" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="ch in RECONCILE_CHANNELS" :key="ch.no" :value="ch.no">{{ ch.name }}</option>
        </select>
        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="c in RECONCILE_CURRENCIES[ledger]" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">时区：</label>
        <select v-model="filter.timezone" class="wf-input wf-input--select">
          <option v-for="tz in RECONCILE_TIMEZONES" :key="tz" :value="tz">{{ tz }}</option>
        </select>
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="search">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="clearFilter">清除</button>
          <button type="button" class="wf-btn channel-reconcile__btn--export" @click="exportList">导出</button>
        </span>
      </div>
    </section>

    <div class="wf-table-wrap">
      <table class="wf-table channel-reconcile__table" :class="{ 'channel-reconcile__table--wide': ledger === 'cash' }">
        <thead>
          <tr>
            <th class="wf-th wf-th--no">编号</th>
            <th class="wf-th">
              <span class="wf-label--with-spec">
                渠道编号
                <WfSpecAnnot :no="ANNOT_NO.table" title="渠道对账列表" :items="[...CHANNEL_RECONCILE_TABLE_SPEC]" />
              </span>
            </th>
            <th class="wf-th">渠道</th>
            <th class="wf-th">用户数量</th>
            <th v-for="col in columns" :key="col.key" class="wf-th">{{ col.label }}</th>
            <th class="wf-th">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!channelRows.length">
            <td :colspan="columns.length + 5" class="wf-td wf-td--empty">暂无数据</td>
          </tr>
          <tr v-for="(row, index) in channelRows" :key="row.channel.no">
            <td class="wf-td wf-td--center">{{ index + 1 }}</td>
            <td class="wf-td wf-td--center">{{ row.channel.no }}</td>
            <td class="wf-td">{{ row.channel.name }}</td>
            <td class="wf-td wf-td--num">{{ row.channel.userCount }}</td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="wf-td wf-td--num"
              :class="col.key === 'profit' ? signedNumberClass(row.totals.profit) : ''"
            >
              {{ formatReconcileValue(col.key, row.totals[col.key]) }}
            </td>
            <td class="wf-td wf-td--actions">
              <button type="button" class="wf-link-action" @click="openDetail(row.channel)">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="wf-pagination">
      <span class="wf-pagination__info">共 {{ channelRows.length }} 条</span>
    </div>

    <Teleport to="body">
      <div v-if="detail && detailTotals" class="wf-modal-mask" role="presentation" @click.self="detail = null">
        <div
          class="wf-modal wf-modal--scroll channel-reconcile__modal"
          role="dialog"
          aria-labelledby="channel-reconcile-detail-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="channel-reconcile-detail-title" class="wf-modal__title wf-label--with-spec">
              渠道对账 · {{ detail.ledger === 'cash' ? '现金' : '信用' }} · {{ detail.currency }}
              <WfSpecAnnot :no="ANNOT_NO.detail" title="渠道对账详情" :items="[...CHANNEL_RECONCILE_DETAIL_SPEC]" />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="detail = null">×</button>
          </div>
          <div class="wf-modal__body">
            <h4 class="channel-reconcile__section-title">渠道对账详情</h4>
            <div class="wf-detail-panel__grid channel-reconcile__grid">
              <div class="wf-detail-panel__cell">
                <span class="wf-detail-panel__label">渠道</span>
                <span class="wf-detail-panel__value">{{ detail.channel.name }}</span>
              </div>
              <div class="wf-detail-panel__cell">
                <span class="wf-detail-panel__label">用户数量</span>
                <span class="wf-detail-panel__value">{{ detail.channel.userCount }}</span>
              </div>
              <div v-for="field in CHANNEL_DETAIL_FIELDS[detail.ledger]" :key="field.key" class="wf-detail-panel__cell">
                <span class="wf-detail-panel__label">{{ field.label }}</span>
                <span
                  class="wf-detail-panel__value"
                  :class="field.key === 'profit' ? signedNumberClass(detailTotals.profit) : ''"
                >
                  {{ formatReconcileValue(field.key, detailTotals[field.key]) }}
                  <small v-if="detail.ledger === 'credit' && field.key === 'rebate'" class="channel-reconcile__sub">
                    信用会员退水 {{ formatReconcileValue('memberRebate', detailTotals.memberRebate) }} · 信用代理退水
                    {{ formatReconcileValue('agentRebate', detailTotals.agentRebate) }}
                  </small>
                </span>
              </div>
              <div
                v-for="(label, i) in CHANNEL_HOLDINGS[detail.ledger].labels"
                :key="label"
                class="wf-detail-panel__cell"
              >
                <span class="wf-detail-panel__label">{{ label }}</span>
                <span class="wf-detail-panel__value">{{
                  CHANNEL_HOLDINGS[detail.ledger].values[detail.channel.no]?.[i] ?? '0'
                }}</span>
              </div>
            </div>

            <h4 class="channel-reconcile__section-title">渠道对账数据</h4>
            <PcReconcileDataSection
              :ledger="detail.ledger"
              :currency="detail.currency"
              :channel-no="detail.channel.no"
              :stat-fields="CHANNEL_DATA_STATS[detail.ledger]"
              :columns="RECONCILE_AMOUNT_COLUMNS[detail.ledger]"
              period-tabs
            />
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="detail = null">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.channel-reconcile__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.channel-reconcile__table {
  table-layout: auto;
}

.channel-reconcile__table--wide {
  min-width: 1900px;
}

.channel-reconcile__modal {
  max-width: 1100px;
  width: 92vw;
}

.channel-reconcile__section-title {
  margin: 4px 0 10px;
  font-size: 15px;
  font-weight: 600;
}

.channel-reconcile__grid {
  margin-bottom: 18px;
  border-top: 1px solid var(--pc-border-light);
}

.channel-reconcile__grid .wf-detail-panel__cell {
  grid-template-columns: minmax(0, 42%) minmax(0, 1fr);
}

.channel-reconcile__sub {
  display: block;
  margin-top: 2px;
  color: var(--pc-text-secondary);
  font-size: 12px;
}
</style>
