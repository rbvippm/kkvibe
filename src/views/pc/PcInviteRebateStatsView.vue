<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  dailyStatsByInviter,
  formatInviteRebateAmount,
  type InviteRebateDailyStatsRow,
} from '../../constants/inviteRebateOps'
import {
  INVITE_REBATE_STATS_SETTLE_SPEC,
  INVITE_REBATE_STATS_SPEC_ANNOT_NO,
} from '../../constants/inviteRebateStatsSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  startDate: string
  endDate: string
}

const route = useRoute()
const router = useRouter()
const PAGE_SIZE = 10
const PAGE_SEGMENTS = ['运营管理', '邀请列表', '日返利统计']

const defaultFilter = (): ListFilter => ({
  startDate: '2026-07-10',
  endDate: '2026-07-18',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const filterHint = ref('')
const page = ref(1)

const inviterIdFromQuery = computed(() => String(route.query.inviterId ?? ''))

watch(
  () => route.query.inviterId,
  () => {
    page.value = 1
  },
)

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

function matchRow(row: InviteRebateDailyStatsRow) {
  const f = applied.value
  if (f.startDate && row.bizDate < f.startDate) return false
  if (f.endDate && row.bizDate > f.endDate) return false
  return true
}

const sourceRows = computed(() =>
  inviterIdFromQuery.value ? dailyStatsByInviter(inviterIdFromQuery.value) : [],
)

const filteredRows = computed(() => sourceRows.value.filter(matchRow))

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

function backToInviters() {
  router.push({ name: 'pc-invite-rebate-inviters' })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <div class="wf-toolbar">
      <button type="button" class="wf-link-action" @click="backToInviters">← 返回邀请列表</button>
    </div>
    <WfPagePathMenu
      :segments="PAGE_SEGMENTS"
      doc-route-name="pc-invite-rebate-stats-doc"
    />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          业务日期：
          <WfSpecAnnot
            :no="INVITE_REBATE_STATS_SPEC_ANNOT_NO.dailyRebate"
            title="日返利统计"
            :items="[...INVITE_REBATE_STATS_SETTLE_SPEC]"
          />
        </label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
        <p v-if="filterHint" class="wf-modal__hint">{{ filterHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">业务日期</th>
              <th class="wf-th wf-th--amount">KKC 返利金额</th>
              <th class="wf-th wf-th--amount">KKV 返利金额</th>
              <th class="wf-th wf-th--amount">USDT 返利金额</th>
              <th class="wf-th wf-th--amount">KKC 领取金额</th>
              <th class="wf-th wf-th--amount">KKV 领取金额</th>
              <th class="wf-th wf-th--amount">USDT 领取金额</th>
              <th class="wf-th wf-th--amount">KKC 已过期金额</th>
              <th class="wf-th wf-th--amount">KKV 已过期金额</th>
              <th class="wf-th wf-th--amount">USDT 已过期金额</th>
              <th class="wf-th wf-th--amount">KKC 待领取金额</th>
              <th class="wf-th wf-th--amount">KKV 待领取金额</th>
              <th class="wf-th wf-th--amount">USDT 待领取金额</th>
              <th class="wf-th wf-th--amount">KKC 已取消金额</th>
              <th class="wf-th wf-th--amount">KKV 已取消金额</th>
              <th class="wf-th wf-th--amount">USDT 已取消金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id">
              <td class="wf-td">{{ row.bizDate }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.rebateKkc) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.rebateKkv) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.rebateUsdt) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.claimKkc) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.claimKkv) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.claimUsdt) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.expiredKkc) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.expiredKkv) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.expiredUsdt) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.pendingKkc) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.pendingKkv) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.pendingUsdt) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.cancelledKkc) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.cancelledKkv) }}</td>
              <td class="wf-td wf-td--amount">{{ formatInviteRebateAmount(row.cancelledUsdt) }}</td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="16" class="wf-td wf-td--empty">
                {{ inviterIdFromQuery ? '暂无统计数据' : '请从邀请列表进入日返利统计' }}
              </td>
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
