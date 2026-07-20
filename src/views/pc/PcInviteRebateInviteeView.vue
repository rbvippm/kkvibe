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
  INVITE_REBATE_SETTLE_STATUS_OPTIONS,
  MOCK_INVITE_REBATE_INVITEES,
  type InviteRebateCurrency,
  type InviteRebateEligibleStatus,
  type InviteRebateInviteeDailyRow,
  type InviteRebateInviteeRow,
  type InviteRebateSettleStatus,
} from '../../constants/inviteRebateOps'
import { INVITE_REBATE_INVITEE_ANNOT_MAP } from '../../constants/inviteRebateInviteeSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  keyword: string
  currency: '' | InviteRebateCurrency
  meetsOnly: '' | 'yes' | 'no'
}

type DetailFilter = {
  startDate: string
  endDate: string
  meetsOnly: '' | 'yes' | 'no'
  eligibleStatus: '' | InviteRebateEligibleStatus
  settleStatus: '' | InviteRebateSettleStatus
}

const route = useRoute()
const router = useRouter()
const PAGE_SIZE = 10
const DETAIL_PAGE_SIZE = 8
const PAGE_SEGMENTS = ['运营管理', '邀请活动列表', '被邀请人详情']

const defaultFilter = (): ListFilter => ({
  keyword: '',
  currency: '',
  meetsOnly: '',
})

const defaultDetailFilter = (): DetailFilter => ({
  startDate: '2026-07-10',
  endDate: '2026-07-18',
  meetsOnly: '',
  eligibleStatus: '',
  settleStatus: '',
})

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
const currencyFromQuery = computed(
  () => String(route.query.currency ?? '') as '' | InviteRebateCurrency,
)

watch(
  () => [route.query.inviterId, route.query.inviterAccount, route.query.currency],
  () => {
    page.value = 1
  },
)

function applyFilter() {
  applied.value = {
    ...filter.value,
    keyword: filter.value.keyword.trim(),
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
  if (inviterAccountFromQuery.value && currencyFromQuery.value) {
    if (row.inviterAccount !== inviterAccountFromQuery.value) return false
    if (row.currency !== currencyFromQuery.value) return false
  } else if (inviterIdFromQuery.value && row.inviterId !== inviterIdFromQuery.value) {
    return false
  }
  const kw = f.keyword.trim()
  if (kw && !row.account.includes(kw)) return false
  if (f.currency && row.currency !== f.currency) return false
  if (f.meetsOnly === 'yes' && !row.meetsCondition) return false
  if (f.meetsOnly === 'no' && row.meetsCondition) return false
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
  if (f.meetsOnly === 'yes' && !row.meetsThreshold) return false
  if (f.meetsOnly === 'no' && row.meetsThreshold) return false
  if (f.eligibleStatus && row.eligibleStatus !== f.eligibleStatus) return false
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
      <button type="button" class="wf-link-action" @click="backToInviters">← 返回邀请活动列表</button>
    </div>
    <WfPagePathMenu
      :segments="PAGE_SEGMENTS"
      doc-route-name="pc-invite-rebate-invitees-doc"
    />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          被邀请人ID：
          <WfSpecAnnot
            :no="INVITE_REBATE_INVITEE_ANNOT_MAP.parentScope.no"
            :title="INVITE_REBATE_INVITEE_ANNOT_MAP.parentScope.title"
            :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.parentScope.items]"
          />
        </label>
        <input v-model="filter.keyword" type="text" class="wf-input" placeholder="请输入被邀请人ID" />

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label wf-label--with-spec">
          是否达标：
          <WfSpecAnnot
            :no="INVITE_REBATE_INVITEE_ANNOT_MAP.meetsFilter.no"
            :title="INVITE_REBATE_INVITEE_ANNOT_MAP.meetsFilter.title"
            :items="[...INVITE_REBATE_INVITEE_ANNOT_MAP.meetsFilter.items]"
          />
        </label>
        <select v-model="filter.meetsOnly" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="yes">已达标</option>
          <option value="no">未达标</option>
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
              <th class="wf-th">被邀请人</th>
              <th class="wf-th">VIP</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">身份</th>
              <th class="wf-th">历史累计存款</th>
              <th class="wf-th">昨日日存</th>
              <th class="wf-th">累计充值</th>
              <th class="wf-th">贡献返利</th>
              <th class="wf-th">达标</th>
              <th class="wf-th">资格</th>
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
              <td class="wf-td">{{ row.nickname }}（{{ row.account }}）</td>
              <td class="wf-td">VIP{{ row.vipLevel }}</td>
              <td class="wf-td">{{ row.currency }}</td>
              <td class="wf-td">{{ inviteRebateIdentityLabel(row.identity) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.historyDeposit) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.yesterdayDailyDeposit) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.depositTotal) }}</td>
              <td class="wf-td">{{ formatInviteRebateAmount(row.rebateTotal) }}</td>
              <td class="wf-td">{{ row.meetsCondition ? '已达标' : '未达标' }}</td>
              <td class="wf-td">{{ inviteRebateEligibleLabel(row.eligibleStatus) }}</td>
              <td class="wf-td">
                <button type="button" class="wf-link-action" @click="openDetail(row)">详情</button>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="11" class="wf-td wf-td--empty">暂无被邀请人</td>
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
              <label class="wf-label">业务日：</label>
              <input v-model="detailFilter.startDate" type="date" class="wf-input wf-input--date" />
              <span class="wf-range-sep">-</span>
              <input v-model="detailFilter.endDate" type="date" class="wf-input wf-input--date" />

              <label class="wf-label">门槛达标：</label>
              <select v-model="detailFilter.meetsOnly" class="wf-input wf-input--select">
                <option value="">全部</option>
                <option value="yes">已达标</option>
                <option value="no">未达标</option>
              </select>

              <label class="wf-label">资格：</label>
              <select v-model="detailFilter.eligibleStatus" class="wf-input wf-input--select">
                <option
                  v-for="opt in INVITE_REBATE_ELIGIBLE_OPTIONS"
                  :key="opt.value || 'all'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <label class="wf-label">派发状态：</label>
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
                    <th class="wf-th">VIP快照</th>
                    <th class="wf-th wf-th--amount">邀请人累计</th>
                    <th class="wf-th wf-th--amount">邀请人日存</th>
                    <th class="wf-th wf-th--amount">被邀请人累计</th>
                    <th class="wf-th wf-th--amount">被邀请人日存</th>
                    <th class="wf-th">返利比例</th>
                    <th class="wf-th wf-th--status">门槛达标</th>
                    <th class="wf-th wf-th--status">资格</th>
                    <th class="wf-th wf-th--amount">应发返利</th>
                    <th class="wf-th wf-th--amount">实发返利</th>
                    <th class="wf-th wf-th--status">派发状态</th>
                    <th class="wf-th">计划派发时间</th>
                    <th class="wf-th wf-th--remark">备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in detailPagedRows" :key="row.id">
                    <td class="wf-td">{{ row.bizDate }}</td>
                    <td class="wf-td">VIP{{ row.vipSnapshot }}</td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviterHistoryDeposit) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviterDailyDeposit) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviteeHistoryDeposit) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.inviteeDailyDeposit) }}
                    </td>
                    <td class="wf-td">{{ row.rebateRate }}%</td>
                    <td class="wf-td wf-td--status">
                      <span
                        class="wf-status-badge"
                        :class="
                          row.meetsThreshold
                            ? 'wf-status-badge--enabled'
                            : 'wf-status-badge--disabled'
                        "
                      >
                        {{ row.meetsThreshold ? '已达标' : '未达标' }}
                      </span>
                    </td>
                    <td class="wf-td wf-td--status">
                      <span
                        class="wf-status-badge"
                        :class="
                          row.eligibleStatus === 'eligible'
                            ? 'wf-status-badge--enabled'
                            : 'wf-status-badge--disabled'
                        "
                      >
                        {{ inviteRebateEligibleLabel(row.eligibleStatus) }}
                      </span>
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.rebateAmount) }}
                    </td>
                    <td class="wf-td wf-td--amount">
                      {{ formatInviteRebateAmount(row.settledAmount) }}
                    </td>
                    <td class="wf-td wf-td--status">
                      {{ inviteRebateSettleStatusLabel(row.status) }}
                    </td>
                    <td class="wf-td">{{ row.settleAt }}</td>
                    <td class="wf-td wf-td--remark">{{ row.remark }}</td>
                  </tr>
                  <tr v-if="!detailPagedRows.length">
                    <td colspan="14" class="wf-td wf-td--empty">暂无每日明细</td>
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
  width: min(1120px, calc(100vw - 48px));
  max-width: 1120px;
}

</style>
