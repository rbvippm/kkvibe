<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  formatInviteRebateAmount,
  inviteRebateSettleStatusLabel,
  INVITE_REBATE_CURRENCY_OPTIONS,
  INVITE_REBATE_SETTLE_STATUS_OPTIONS,
  MOCK_INVITE_REBATE_RECORDS,
  type InviteRebateCurrency,
  type InviteRebateRecordRow,
  type InviteRebateSettleStatus,
} from '../../constants/inviteRebateOps'
import {
  INVITE_REBATE_RECORD_CAP_SPEC,
  INVITE_REBATE_RECORD_SPEC_ANNOT_NO,
} from '../../constants/inviteRebateRecordSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  bizDate: string
  inviterKeyword: string
  inviteeKeyword: string
  currency: '' | InviteRebateCurrency
  status: '' | InviteRebateSettleStatus
}

const route = useRoute()
const router = useRouter()
const PAGE_SIZE = 10
const PAGE_SEGMENTS = ['运营管理', '活动明细']

const defaultFilter = (): ListFilter => ({
  bizDate: '',
  inviterKeyword: '',
  inviteeKeyword: '',
  currency: '',
  status: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const page = ref(1)

watch(
  () => route.query,
  () => {
    const bizDate = String(route.query.bizDate ?? '')
    const currency = String(route.query.currency ?? '') as '' | InviteRebateCurrency
    if (bizDate) {
      filter.value.bizDate = bizDate
      applied.value.bizDate = bizDate
    }
    if (currency === 'KKC' || currency === 'KKV' || currency === 'USDT') {
      filter.value.currency = currency
      applied.value.currency = currency
    }
    page.value = 1
  },
  { immediate: true },
)

function applyFilter() {
  applied.value = {
    ...filter.value,
    inviterKeyword: filter.value.inviterKeyword.trim(),
    inviteeKeyword: filter.value.inviteeKeyword.trim(),
  }
  page.value = 1
}

function resetFilter() {
  const bizDate = String(route.query.bizDate ?? '')
  const currencyRaw = String(route.query.currency ?? '')
  const currency =
    currencyRaw === 'KKC' || currencyRaw === 'KKV' || currencyRaw === 'USDT'
      ? currencyRaw
      : ('' as const)
  filter.value = { ...defaultFilter(), bizDate, currency }
  applied.value = { ...defaultFilter(), bizDate, currency }
  page.value = 1
}

function backToInviters() {
  router.push({ name: 'pc-invite-rebate-inviters' })
}

function matchRow(row: InviteRebateRecordRow) {
  const f = applied.value
  if (f.bizDate && row.bizDate !== f.bizDate) return false
  const inv = f.inviterKeyword.toLowerCase()
  if (
    inv &&
    !row.inviterAccount.includes(inv) &&
    !row.inviterNickname.toLowerCase().includes(inv)
  ) {
    return false
  }
  const ivt = f.inviteeKeyword.toLowerCase()
  if (
    ivt &&
    !row.inviteeAccount.includes(ivt) &&
    !row.inviteeNickname.toLowerCase().includes(ivt)
  ) {
    return false
  }
  if (f.currency && row.currency !== f.currency) return false
  if (f.status && row.status !== f.status) return false
  return true
}

const filteredRows = computed(() =>
  MOCK_INVITE_REBATE_RECORDS.filter(matchRow).sort((a, b) =>
    b.claimOpenAt.localeCompare(a.claimOpenAt),
  ),
)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})
</script>

<template>
  <div class="pc-wireframe-page">
    <div class="wf-toolbar">
      <button type="button" class="wf-link-action" @click="backToInviters">← 返回邀请列表</button>
    </div>
    <WfPagePathMenu
      :segments="PAGE_SEGMENTS"
      doc-route-name="pc-invite-rebate-records-doc"
    />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          业务日：
          <WfSpecAnnot
            :no="INVITE_REBATE_RECORD_SPEC_ANNOT_NO.capSnapshot"
            title="VIP 上限快照与领取状态"
            :items="[...INVITE_REBATE_RECORD_CAP_SPEC]"
          />
        </label>
        <input v-model="filter.bizDate" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">邀请人：</label>
        <input v-model="filter.inviterKeyword" type="text" class="wf-input" placeholder="账号或昵称" />

        <label class="wf-label">被邀请人：</label>
        <input v-model="filter.inviteeKeyword" type="text" class="wf-input" placeholder="账号或昵称" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option
            v-for="opt in INVITE_REBATE_SETTLE_STATUS_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
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
              <th class="wf-th">流水号</th>
              <th class="wf-th">业务日</th>
              <th class="wf-th">领取开放时间</th>
              <th class="wf-th">过期时间</th>
              <th class="wf-th">邀请人</th>
              <th class="wf-th">被邀请人</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">VIP快照</th>
              <th class="wf-th">日上限</th>
              <th class="wf-th">预估</th>
              <th class="wf-th">已领</th>
              <th class="wf-th">状态</th>
              <th class="wf-th">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id">
              <td class="wf-td">{{ row.flowNo || '-' }}</td>
              <td class="wf-td">{{ row.bizDate }}</td>
              <td class="wf-td">{{ row.claimOpenAt }}</td>
              <td class="wf-td">{{ row.expireAt }}</td>
              <td class="wf-td">{{ row.inviterNickname }}（{{ row.inviterAccount }}）</td>
              <td class="wf-td">{{ row.inviteeNickname }}（{{ row.inviteeAccount }}）</td>
              <td class="wf-td">{{ row.currency }}</td>
              <td class="wf-td">VIP{{ row.vipSnapshot }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.dailyCap) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateAmount) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.claimedAmount) }}</td>
              <td class="wf-td">{{ inviteRebateSettleStatusLabel(row.status) }}</td>
              <td class="wf-td">{{ row.remark || '-' }}</td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="13" class="wf-td wf-td--empty">暂无活动明细</td>
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
