<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  formatInviteRebateAmount,
  inviteeDailyByInvitee,
  inviteRebateEligibleLabel,
  inviteRebateIdentityLabel,
  inviteRebateSettleStatusLabel,
  INVITE_REBATE_CURRENCY_OPTIONS,
  INVITE_REBATE_ELIGIBLE_OPTIONS,
  INVITE_REBATE_IDENTITY_OPTIONS,
  INVITE_REBATE_SETTLE_STATUS_OPTIONS,
  INVITE_REBATE_VIP_OPTIONS,
  MOCK_INVITE_REBATE_INVITEES,
  type InviteRebateCurrency,
  type InviteRebateEligibleStatus,
  type InviteRebateIdentity,
  type InviteRebateInviteeDailyRow,
  type InviteRebateInviteeRow,
  type InviteRebateSettleStatus,
} from '../../constants/inviteRebateOps'
import { INVITE_REBATE_INVITEE_ANNOT_MAP } from '../../constants/inviteRebateInviteeSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  keyword: string
  kingkongId: string
  identity: '' | InviteRebateIdentity
  vipLevel: '' | number
}

type DetailFilter = {
  startDate: string
  endDate: string
  currency: '' | InviteRebateCurrency
  inviterEligibleStatus: '' | InviteRebateEligibleStatus
  inviteeEligibleStatus: '' | InviteRebateEligibleStatus
  settleStatus: '' | InviteRebateSettleStatus
}

const route = useRoute()
const router = useRouter()
const PAGE_SIZE = 10
const DETAIL_PAGE_SIZE = 8
const PAGE_SEGMENTS = ['运营管理', '邀请列表', '被邀请人详情']

const defaultFilter = (): ListFilter => ({
  keyword: '',
  kingkongId: '',
  identity: '',
  vipLevel: '',
})

const defaultDetailFilter = (): DetailFilter => ({
  startDate: '2026-07-10',
  endDate: '2026-07-18',
  currency: '',
  inviterEligibleStatus: '',
  inviteeEligibleStatus: '',
  settleStatus: '',
})

function eligibleBadgeClass(status: InviteRebateEligibleStatus) {
  return status === 'eligible' ? 'wf-status-badge--enabled' : 'wf-status-badge--disabled'
}

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const page = ref(1)
const detailVisible = ref(false)
const detailRow = ref<InviteRebateInviteeRow | null>(null)
const detailFilter = ref<DetailFilter>(defaultDetailFilter())
const detailApplied = ref<DetailFilter>(defaultDetailFilter())
const detailHint = ref('')
const detailPage = ref(1)

const inviterIdFromQuery = computed(() => String(route.query.inviterId ?? ''))
const inviterAccountFromQuery = computed(() => String(route.query.inviterAccount ?? ''))

watch(
  () => [route.query.inviterId, route.query.inviterAccount],
  () => {
    page.value = 1
  },
)

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

function matchRow(row: InviteRebateInviteeRow) {
  const f = applied.value
  if (inviterAccountFromQuery.value) {
    if (row.inviterAccount !== inviterAccountFromQuery.value) return false
  } else if (inviterIdFromQuery.value && row.inviterId !== inviterIdFromQuery.value) {
    return false
  }
  const kw = f.keyword.trim()
  const kingkong = f.kingkongId.trim()
  if (kw && !row.account.includes(kw)) return false
  if (kingkong && !row.kingkongId.includes(kingkong)) return false
  if (f.identity && row.identity !== f.identity) return false
  if (f.vipLevel !== '' && row.vipLevel !== f.vipLevel) return false
  return true
}

const filteredRows = computed(() => MOCK_INVITE_REBATE_INVITEES.filter(matchRow))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

function matchDailyRow(row: InviteRebateInviteeDailyRow) {
  const f = detailApplied.value
  if (f.startDate && row.bizDate < f.startDate) return false
  if (f.endDate && row.bizDate > f.endDate) return false
  if (f.currency && row.currency !== f.currency) return false
  if (f.inviterEligibleStatus && row.inviterEligibleStatus !== f.inviterEligibleStatus) {
    return false
  }
  if (f.inviteeEligibleStatus && row.inviteeEligibleStatus !== f.inviteeEligibleStatus) {
    return false
  }
  if (f.settleStatus && row.status !== f.settleStatus) return false
  return true
}

const detailDailyRows = computed(() => {
  if (!detailRow.value) return []
  return inviteeDailyByInvitee(detailRow.value.id).filter(matchDailyRow)
})

const detailTotalPages = computed(() =>
  Math.max(1, Math.ceil(detailDailyRows.value.length / DETAIL_PAGE_SIZE)),
)

const detailPagedRows = computed(() => {
  const start = (detailPage.value - 1) * DETAIL_PAGE_SIZE
  return detailDailyRows.value.slice(start, start + DETAIL_PAGE_SIZE)
})

function applyDetailFilter() {
  if (
    detailFilter.value.startDate &&
    detailFilter.value.endDate &&
    detailFilter.value.startDate > detailFilter.value.endDate
  ) {
    detailHint.value = '结束日期不能早于开始日期'
    return
  }
  detailHint.value = ''
  detailApplied.value = { ...detailFilter.value }
  detailPage.value = 1
}

function resetDetailFilter() {
  detailFilter.value = defaultDetailFilter()
  detailApplied.value = defaultDetailFilter()
  detailHint.value = ''
  detailPage.value = 1
}

function openDetail(row: InviteRebateInviteeRow) {
  detailRow.value = row
  detailFilter.value = defaultDetailFilter()
  detailApplied.value = defaultDetailFilter()
  detailHint.value = ''
  detailPage.value = 1
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailRow.value = null
  detailHint.value = ''
}

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
      doc-route-name="pc-invite-rebate-invitees-doc"
    />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.keyword" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">金刚号：</label>
        <input v-model="filter.kingkongId" type="text" class="wf-input" placeholder="请输入金刚号" />

        <label class="wf-label">身份：</label>
        <select v-model="filter.identity" class="wf-input wf-input--select">
          <option
            v-for="opt in INVITE_REBATE_IDENTITY_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">VIP：</label>
        <select v-model="filter.vipLevel" class="wf-input wf-input--select">
          <option
            v-for="opt in INVITE_REBATE_VIP_OPTIONS"
            :key="opt.value === '' ? 'all' : opt.value"
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
              <th class="wf-th">昵称</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金刚号</th>
              <th class="wf-th">身份</th>
              <th class="wf-th">VIP</th>
              <th class="wf-th wf-th--with-spec">
                累计返利(KKC)
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.rebateByCurrency.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.rebateByCurrency.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.rebateByCurrency.items]"
                />
              </th>
              <th class="wf-th">累计返利(KKV)</th>
              <th class="wf-th">累计返利(USDT)</th>
              <th class="wf-th wf-th--with-spec">
                操作
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.dailyDetail.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.dailyDetail.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.dailyDetail.items]"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id">
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">{{ row.account }}</td>
              <td class="wf-td">{{ row.kingkongId }}</td>
              <td class="wf-td">{{ inviteRebateIdentityLabel(row.identity) }}</td>
              <td class="wf-td">VIP{{ row.vipLevel }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateKKC) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateKKV) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateUSDT) }}</td>
              <td class="wf-td">
                <button type="button" class="wf-link-action" @click="openDetail(row)">详情</button>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="9" class="wf-td wf-td--empty">暂无被邀请人</td>
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

    <Teleport to="body">
      <div v-if="detailVisible && detailRow" class="wf-modal-mask" @click.self="closeDetail">
        <div
          class="wf-modal wf-modal--scroll wf-modal--invitee-daily"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitee-daily-title"
        >
          <header class="wf-modal__header">
            <h3 id="invitee-daily-title" class="wf-modal__title">被邀请人每日明细</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </header>

          <div class="wf-modal__body">
            <div class="wf-toolbar wf-toolbar--filters">
              <label class="wf-label wf-label--with-spec">
                业务日：
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.bizDateFilter.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.bizDateFilter.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.bizDateFilter.items]"
                />
              </label>
              <input v-model="detailFilter.startDate" type="date" class="wf-input wf-input--date" />
              <span class="wf-range-sep">-</span>
              <input v-model="detailFilter.endDate" type="date" class="wf-input wf-input--date" />

              <label class="wf-label wf-label--with-spec">
                币种：
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.currencyFilter.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.currencyFilter.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.currencyFilter.items]"
                />
              </label>
              <select v-model="detailFilter.currency" class="wf-input wf-input--select">
                <option
                  v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS"
                  :key="opt.value || 'all'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <label class="wf-label wf-label--with-spec">
                邀请人资格：
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.inviterEligibleFilter.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.inviterEligibleFilter.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.inviterEligibleFilter.items]"
                />
              </label>
              <select
                v-model="detailFilter.inviterEligibleStatus"
                class="wf-input wf-input--select"
              >
                <option
                  v-for="opt in INVITE_REBATE_ELIGIBLE_OPTIONS"
                  :key="`inv-${opt.value || 'all'}`"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <label class="wf-label wf-label--with-spec">
                被邀请人资格：
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.inviteeEligibleFilter.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.inviteeEligibleFilter.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.inviteeEligibleFilter.items]"
                />
              </label>
              <select
                v-model="detailFilter.inviteeEligibleStatus"
                class="wf-input wf-input--select"
              >
                <option
                  v-for="opt in INVITE_REBATE_ELIGIBLE_OPTIONS"
                  :key="`ie-${opt.value || 'all'}`"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <label class="wf-label wf-label--with-spec">
                领取状态：
                <WfSpecAnnot
                  :no="INVITE_REBATE_INVITEE_ANNOT_MAP.settleStatusFilter.no"
                  :title="INVITE_REBATE_INVITEE_ANNOT_MAP.settleStatusFilter.title"
                  :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.settleStatusFilter.items]"
                />
              </label>
              <select v-model="detailFilter.settleStatus" class="wf-input wf-input--select">
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
                <button type="button" class="wf-btn wf-btn--primary" @click="applyDetailFilter">
                  搜索
                </button>
                <button type="button" class="wf-btn wf-btn--danger" @click="resetDetailFilter">
                  清除
                </button>
              </span>
              <p v-if="detailHint" class="wf-modal__hint">{{ detailHint }}</p>
            </div>

            <div class="wf-table-wrap">
              <table class="wf-table wf-table--modal wf-table--invitee-daily">
                <thead>
                  <tr>
                    <th class="wf-th">业务日</th>
                    <th class="wf-th">币种</th>
                    <th class="wf-th">VIP快照</th>
                    <th class="wf-th wf-th--amount">邀请人次日存款</th>
                    <th class="wf-th wf-th--amount">被邀请人T日存款</th>
                    <th class="wf-th wf-th--amount">被邀请人次日存款</th>
                    <th class="wf-th">业务日返利比例</th>
                    <th class="wf-th wf-th--status">邀请人资格</th>
                    <th class="wf-th wf-th--status">被邀请人资格</th>
                    <th class="wf-th wf-th--amount">预估返利</th>
                    <th class="wf-th wf-th--amount">已领返利</th>
                    <th class="wf-th wf-th--status">领取状态</th>
                    <th class="wf-th">流水号</th>
                    <th class="wf-th">领取开放（GMT+7）</th>
                    <th class="wf-th">过期时间（GMT+7）</th>
                    <th class="wf-th wf-th--remark wf-th--with-spec">
                      备注
                      <WfSpecAnnot
                        :no="INVITE_REBATE_INVITEE_ANNOT_MAP.remarkReasons.no"
                        :title="INVITE_REBATE_INVITEE_ANNOT_MAP.remarkReasons.title"
                        :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.remarkReasons.items]"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in detailPagedRows" :key="row.id">
                    <td class="wf-td">{{ row.bizDate }}</td>
                    <td class="wf-td">{{ row.currency }}</td>
                    <td class="wf-td">VIP{{ row.vipSnapshot }}</td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviterRechargeDayDeposit) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviteeBizDayDeposit) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviteeRechargeDayDeposit) }}
                    </td>
                    <td class="wf-td">{{ row.rebateRate }}%</td>
                    <td class="wf-td wf-td--status">
                      <span
                        class="wf-status-badge"
                        :class="eligibleBadgeClass(row.inviterEligibleStatus)"
                      >
                        {{ inviteRebateEligibleLabel(row.inviterEligibleStatus) }}
                      </span>
                    </td>
                    <td class="wf-td wf-td--status">
                      <span
                        class="wf-status-badge"
                        :class="eligibleBadgeClass(row.inviteeEligibleStatus)"
                      >
                        {{ inviteRebateEligibleLabel(row.inviteeEligibleStatus) }}
                      </span>
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.rebateAmount) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.claimedAmount) }}
                    </td>
                    <td class="wf-td wf-td--status">
                      {{ inviteRebateSettleStatusLabel(row.status) }}
                    </td>
                    <td class="wf-td">{{ row.flowNo || '-' }}</td>
                    <td class="wf-td">{{ row.claimOpenAt }}</td>
                    <td class="wf-td">{{ row.expireAt }}</td>
                    <td class="wf-td wf-td--remark">{{ row.remark || '-' }}</td>
                  </tr>
                  <tr v-if="!detailPagedRows.length">
                    <td colspan="17" class="wf-td wf-td--empty">暂无每日明细</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="wf-pagination">
              <span class="wf-muted">共 {{ detailDailyRows.length }} 条</span>
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="detailPage <= 1"
                @click="detailPage -= 1"
              >
                上一页
              </button>
              <span>{{ detailPage }} / {{ detailTotalPages }}</span>
              <button
                type="button"
                class="wf-btn wf-btn--default"
                :disabled="detailPage >= detailTotalPages"
                @click="detailPage += 1"
              >
                下一页
              </button>
            </div>
          </div>

          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeDetail">关闭</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.wf-modal--invitee-daily {
  width: min(1180px, calc(100vw - 48px));
  max-width: 1180px;
}
</style>
