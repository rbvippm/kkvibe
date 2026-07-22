<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  formatInviteRebateAmount,
  INVITE_REBATE_CURRENCY_OPTIONS,
  MOCK_INVITE_REBATE_STATS,
  type InviteRebateCurrency,
  type InviteRebateStatsRow,
} from '../../constants/inviteRebateOps'
import {
  INVITE_REBATE_STATS_SETTLE_SPEC,
  INVITE_REBATE_STATS_SPEC_ANNOT_NO,
} from '../../constants/inviteRebateStatsSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  startDate: string
  endDate: string
  currency: '' | InviteRebateCurrency
}

const router = useRouter()
const PAGE_SIZE = 10

const defaultFilter = (): ListFilter => ({
  startDate: '2026-07-10',
  endDate: '2026-07-18',
  currency: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const filterHint = ref('')
const page = ref(1)

function applyFilter() {
  if (filter.value.startDate && filter.value.endDate && filter.value.startDate > filter.value.endDate) {
    filterHint.value = '结束日期不能早于开始日期'
    return
  }
  filterHint.value = ''
  applied.value = { ...filter.value }
  page.value = 1
}

function resetFilter() {
  filter.value = defaultFilter()
  applied.value = defaultFilter()
  filterHint.value = ''
  page.value = 1
}

function matchRow(row: InviteRebateStatsRow) {
  const f = applied.value
  if (f.currency && row.currency !== f.currency) return false
  if (f.startDate && row.bizDate < f.startDate) return false
  if (f.endDate && row.bizDate > f.endDate) return false
  return true
}

const filteredRows = computed(() =>
  MOCK_INVITE_REBATE_STATS.filter(matchRow).sort((a, b) => b.bizDate.localeCompare(a.bizDate)),
)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

type CurrencySummary = {
  currency: InviteRebateCurrency
  inviterCount: number
  qualifiedInviteeCount: number
  rebateSum: number
  claimedSum: number
}

/** 维度为用户 + 币种，汇总按币种分行，不做跨币种加总 */
const summaryByCurrency = computed((): CurrencySummary[] => {
  const map = new Map<InviteRebateCurrency, Omit<CurrencySummary, 'currency'>>()
  for (const row of filteredRows.value) {
    const prev = map.get(row.currency) ?? {
      inviterCount: 0,
      qualifiedInviteeCount: 0,
      rebateSum: 0,
      claimedSum: 0,
    }
    map.set(row.currency, {
      inviterCount: prev.inviterCount + row.inviterCount,
      qualifiedInviteeCount: prev.qualifiedInviteeCount + row.qualifiedInviteeCount,
      rebateSum: prev.rebateSum + row.rebateSum,
      claimedSum: prev.claimedSum + row.claimedSum,
    })
  }
  return (['KKC', 'KKV', 'USDT'] as InviteRebateCurrency[])
    .filter((c) => map.has(c))
    .map((currency) => ({ currency, ...map.get(currency)! }))
})

function formatCountByCurrency(
  rows: CurrencySummary[],
  key: 'inviterCount' | 'qualifiedInviteeCount',
) {
  if (!rows.length) return '—'
  return rows.map((r) => `${r.currency} ${r[key]}`).join('、')
}

function formatAmountByCurrency(rows: CurrencySummary[], key: 'rebateSum' | 'claimedSum') {
  if (!rows.length) return '—'
  return rows
    .map((r) => `${r.currency} ${formatInviteRebateAmount(r[key])}`)
    .join('、')
}

function goRecords(row: InviteRebateStatsRow) {
  router.push({
    name: 'pc-invite-rebate-records',
    query: { bizDate: row.bizDate, currency: row.currency },
  })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          业务日：
          <WfSpecAnnot
            :no="INVITE_REBATE_STATS_SPEC_ANNOT_NO.settleCycle"
            title="结算周期汇总"
            :items="[...INVITE_REBATE_STATS_SETTLE_SPEC]"
          />
        </label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
        <p v-if="filterHint" class="wf-modal__hint">{{ filterHint }}</p>
      </div>

      <div class="wf-notice">
        <span class="wf-notice-label">当前筛选汇总：</span>
        达标邀请人 {{ formatCountByCurrency(summaryByCurrency, 'inviterCount') }}；达标被邀请人
        {{ formatCountByCurrency(summaryByCurrency, 'qualifiedInviteeCount') }}；预估
        {{ formatAmountByCurrency(summaryByCurrency, 'rebateSum') }}；已领
        {{ formatAmountByCurrency(summaryByCurrency, 'claimedSum') }}（T+1 12:00 GMT+7 起可手动领取）
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">业务日</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">达标邀请人</th>
              <th class="wf-th">被邀请人数</th>
              <th class="wf-th">达标被邀请人</th>
              <th class="wf-th">充值合计</th>
              <th class="wf-th">预估返利</th>
              <th class="wf-th">已领返利</th>
              <th class="wf-th">领取开放时间</th>
              <th class="wf-th">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id">
              <td class="wf-td">{{ row.bizDate }}</td>
              <td class="wf-td">{{ row.currency }}</td>
              <td class="wf-td">{{ row.inviterCount }}</td>
              <td class="wf-td">{{ row.inviteeCount }}</td>
              <td class="wf-td">{{ row.qualifiedInviteeCount }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.depositSum) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateSum) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.claimedSum) }}</td>
              <td class="wf-td">{{ row.claimOpenAt }}</td>
              <td class="wf-td">
                <button type="button" class="wf-link-action" @click="goRecords(row)">明细</button>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="10" class="wf-td wf-td--empty">暂无统计数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-muted">共 {{ filteredRows.length }} 条</span>
        <button type="button" class="wf-btn wf-btn--default" :disabled="page <= 1" @click="page -= 1">
          上一页
        </button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="wf-btn wf-btn--default"
          :disabled="page >= totalPages"
          @click="page += 1"
        >
          下一页
        </button>
      </div>
    </section>
  </div>
</template>
