<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  formatInviteRebateAmount,
  inviteRebateEligibleLabel,
  inviteRebateIdentityLabel,
  INVITE_REBATE_CURRENCY_OPTIONS,
  INVITE_REBATE_ELIGIBLE_OPTIONS,
  INVITE_REBATE_IDENTITY_OPTIONS,
  MOCK_INVITE_REBATE_INVITERS,
  type InviteRebateCurrency,
  type InviteRebateEligibleStatus,
  type InviteRebateIdentity,
  type InviteRebateInviterRow,
} from '../../constants/inviteRebateOps'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  keyword: string
  currency: '' | InviteRebateCurrency
  identity: '' | InviteRebateIdentity
  eligibleStatus: '' | InviteRebateEligibleStatus
}

const router = useRouter()
const PAGE_SIZE = 10

const defaultFilter = (): ListFilter => ({
  keyword: '',
  currency: '',
  identity: '',
  eligibleStatus: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const page = ref(1)

function applyFilter() {
  applied.value = { ...filter.value, keyword: filter.value.keyword.trim() }
  page.value = 1
}

function resetFilter() {
  filter.value = defaultFilter()
  applied.value = defaultFilter()
  page.value = 1
}

function matchRow(row: InviteRebateInviterRow) {
  const f = applied.value
  const kw = f.keyword.trim()
  if (kw && !row.account.includes(kw)) return false
  if (f.currency && row.currency !== f.currency) return false
  if (f.identity && row.identity !== f.identity) return false
  if (f.eligibleStatus && row.eligibleStatus !== f.eligibleStatus) return false
  return true
}

const filteredRows = computed(() => MOCK_INVITE_REBATE_INVITERS.filter(matchRow))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

function goInvitees(row: InviteRebateInviterRow) {
  router.push({
    name: 'pc-invite-rebate-invitees',
    query: { inviterId: row.id, inviterAccount: row.account },
  })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">邀请人ID：</label>
        <input v-model="filter.keyword" type="text" class="wf-input" placeholder="请输入邀请人ID" />

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">身份：</label>
        <select v-model="filter.identity" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_IDENTITY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">资格：</label>
        <select v-model="filter.eligibleStatus" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_ELIGIBLE_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th">昵称</th>
              <th class="wf-th">ID</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">身份</th>
              <th class="wf-th">历史累计存款</th>
              <th class="wf-th">昨日日存</th>
              <th class="wf-th">下级人数</th>
              <th class="wf-th">达标人数</th>
              <th class="wf-th">累计返利</th>
              <th class="wf-th">资格</th>
              <th class="wf-th">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id">
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">{{ row.account }}</td>
              <td class="wf-td">{{ row.currency }}</td>
              <td class="wf-td">{{ inviteRebateIdentityLabel(row.identity) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.historyDeposit) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.yesterdayDailyDeposit) }}</td>
              <td class="wf-td">{{ row.inviteeCount }}</td>
              <td class="wf-td">{{ row.qualifiedInviteeCount }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.totalRebate) }}</td>
              <td class="wf-td">{{ inviteRebateEligibleLabel(row.eligibleStatus) }}</td>
              <td class="wf-td">
                <button type="button" class="wf-link-action" @click="goInvitees(row)">被邀请人</button>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="11" class="wf-td wf-td--empty">暂无邀请人</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-muted">共 {{ filteredRows.length }} 条</span>
        <button
          type="button"
          class="wf-btn wf-btn--default"
          :disabled="page <= 1"
          @click="page -= 1"
        >
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
