<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  formatInviteRebateAmount,
  inviteRebateIdentityLabel,
  INVITE_REBATE_IDENTITY_OPTIONS,
  listInviteRebateInviters,
  type InviteRebateIdentity,
  type InviteRebateInviterRow,
} from '../../constants/inviteRebateOps'
import { INVITE_REBATE_INVITER_ANNOT_MAP } from '../../constants/inviteRebateInviterSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  keyword: string
  kingkongId: string
  identity: '' | InviteRebateIdentity
}

const router = useRouter()
const PAGE_SIZE = 10

const defaultFilter = (): ListFilter => ({
  keyword: '',
  kingkongId: '',
  identity: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const page = ref(1)

function applyFilter() {
  applied.value = {
    ...filter.value,
    keyword: filter.value.keyword.trim(),
    kingkongId: filter.value.kingkongId.trim(),
  }
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
  const kingkong = f.kingkongId.trim()
  if (kw && !row.account.includes(kw)) return false
  if (kingkong && !row.kingkongId.includes(kingkong)) return false
  if (f.identity && row.identity !== f.identity) return false
  return true
}

const filteredRows = computed(() => listInviteRebateInviters().filter(matchRow))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

function goInvitees(row: InviteRebateInviterRow) {
  router.push({
    name: 'pc-invite-rebate-invitees',
    query: {
      inviterId: row.id,
      inviterAccount: row.account,
    },
  })
}

function goDailyStats(row: InviteRebateInviterRow) {
  router.push({
    name: 'pc-invite-rebate-stats',
    query: {
      inviterId: row.id,
      inviterAccount: row.account,
    },
  })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.keyword" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">金刚号：</label>
        <input v-model="filter.kingkongId" type="text" class="wf-input" placeholder="请输入金刚号" />

        <label class="wf-label wf-label--with-spec">
          身份：
          <WfSpecAnnot
            :no="INVITE_REBATE_INVITER_ANNOT_MAP.identityFilter.no"
            :title="INVITE_REBATE_INVITER_ANNOT_MAP.identityFilter.title"
            :items="[...INVITE_REBATE_INVITER_ANNOT_MAP.identityFilter.items]"
          />
        </label>
        <select v-model="filter.identity" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_IDENTITY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
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
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金刚号</th>
              <th class="wf-th">身份</th>
              <th class="wf-th wf-th--with-spec">
                下级人数
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITER_ANNOT_MAP.inviteeCount.no"
                  :title="INVITE_REBATE_INVITER_ANNOT_MAP.inviteeCount.title"
                  :items="[...INVITE_REBATE_INVITER_ANNOT_MAP.inviteeCount.items]"
                />
              </th>
              <th class="wf-th wf-th--with-spec">
                累计返利(KKC)
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITER_ANNOT_MAP.rebateByCurrency.no"
                  :title="INVITE_REBATE_INVITER_ANNOT_MAP.rebateByCurrency.title"
                  :items="[...INVITE_REBATE_INVITER_ANNOT_MAP.rebateByCurrency.items]"
                />
              </th>
              <th class="wf-th">累计返利(KKV)</th>
              <th class="wf-th">累计返利(USDT)</th>
              <th class="wf-th wf-th--with-spec">
                操作
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITER_ANNOT_MAP.inviteeDrill.no"
                  :title="INVITE_REBATE_INVITER_ANNOT_MAP.inviteeDrill.title"
                  :items="[...INVITE_REBATE_INVITER_ANNOT_MAP.inviteeDrill.items]"
                />
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITER_ANNOT_MAP.dailyStats.no"
                  :title="INVITE_REBATE_INVITER_ANNOT_MAP.dailyStats.title"
                  :items="[...INVITE_REBATE_INVITER_ANNOT_MAP.dailyStats.items]"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.account">
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">{{ row.account }}</td>
              <td class="wf-td">{{ row.kingkongId }}</td>
              <td class="wf-td">{{ inviteRebateIdentityLabel(row.identity) }}</td>
              <td class="wf-td">{{ row.inviteeCount }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateKKC) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateKKV) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateUSDT) }}</td>
              <td class="wf-td wf-td--actions">
                <button type="button" class="wf-link-action" @click="goInvitees(row)">被邀请人</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="goDailyStats(row)">日返利统计</button>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="9" class="wf-td wf-td--empty">暂无邀请数据</td>
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
