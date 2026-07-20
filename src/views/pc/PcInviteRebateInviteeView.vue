<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  formatInviteRebateAmount,
  inviteRebateEligibleLabel,
  inviteRebateIdentityLabel,
  INVITE_REBATE_CURRENCY_OPTIONS,
  MOCK_INVITE_REBATE_INVITEES,
  type InviteRebateCurrency,
  type InviteRebateInviteeRow,
} from '../../constants/inviteRebateOps'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  keyword: string
  currency: '' | InviteRebateCurrency
  meetsOnly: '' | 'yes' | 'no'
}

const route = useRoute()
const router = useRouter()
const PAGE_SIZE = 10
const PAGE_SEGMENTS = ['运营管理', '邀请人列表', '被邀请人详情']

const defaultFilter = (): ListFilter => ({
  keyword: '',
  currency: '',
  meetsOnly: '',
})

const filter = ref<ListFilter>(defaultFilter())
const applied = ref<ListFilter>(defaultFilter())
const page = ref(1)
const detailVisible = ref(false)
const detailRow = ref<InviteRebateInviteeRow | null>(null)

const inviterIdFromQuery = computed(() => String(route.query.inviterId ?? ''))

watch(
  () => route.query.inviterId,
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
  if (inviterIdFromQuery.value && row.inviterId !== inviterIdFromQuery.value) return false
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

function openDetail(row: InviteRebateInviteeRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailRow.value = null
}

function backToInviters() {
  router.push({ name: 'pc-invite-rebate-inviters' })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <div class="wf-toolbar">
      <button type="button" class="wf-link-action" @click="backToInviters">← 返回邀请人列表</button>
    </div>
    <WfPagePathMenu
      :segments="PAGE_SEGMENTS"
      doc-route-name="pc-invite-rebate-invitees-doc"
    />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">被邀请人ID：</label>
        <input v-model="filter.keyword" type="text" class="wf-input" placeholder="请输入被邀请人ID" />

        <label class="wf-label">币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in INVITE_REBATE_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">是否达标：</label>
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
              <th class="wf-th">操作</th>
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
        <div class="wf-modal wf-modal--scroll" role="dialog" aria-modal="true">
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">被邀请人详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </header>
          <div class="wf-modal__body invitee-detail-panel">
            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">基本信息</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">邀请人</span>
                  <span class="wf-detail-panel__value">
                    {{ detailRow.inviterNickname }}
                    <span class="wf-muted">（{{ detailRow.inviterAccount }}）</span>
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">被邀请人</span>
                  <span class="wf-detail-panel__value">
                    {{ detailRow.nickname }}
                    <span class="wf-muted">（{{ detailRow.account }}）</span>
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">VIP</span>
                  <span class="wf-detail-panel__value">VIP{{ detailRow.vipLevel }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">币种</span>
                  <span class="wf-detail-panel__value">{{ detailRow.currency }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">身份</span>
                  <span class="wf-detail-panel__value">
                    {{ inviteRebateIdentityLabel(detailRow.identity) }}
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">注册时间</span>
                  <span class="wf-detail-panel__value">{{ detailRow.registeredAt }}</span>
                </div>
              </div>
            </section>

            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">存款与返利</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">历史累计存款</span>
                  <span class="wf-detail-panel__value">
                    {{ formatInviteRebateAmount(detailRow.historyDeposit) }}
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">昨日日存</span>
                  <span class="wf-detail-panel__value">
                    {{ formatInviteRebateAmount(detailRow.yesterdayDailyDeposit) }}
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">累计充值</span>
                  <span class="wf-detail-panel__value">
                    {{ formatInviteRebateAmount(detailRow.depositTotal) }}
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">贡献返利</span>
                  <span class="wf-detail-panel__value">
                    {{ formatInviteRebateAmount(detailRow.rebateTotal) }}
                  </span>
                </div>
              </div>
            </section>

            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">达标与资格</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">门槛达标</span>
                  <span class="wf-detail-panel__value">
                    <span
                      class="wf-status-badge"
                      :class="
                        detailRow.meetsCondition
                          ? 'wf-status-badge--enabled'
                          : 'wf-status-badge--disabled'
                      "
                    >
                      {{ detailRow.meetsCondition ? '已达标' : '未达标' }}
                    </span>
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">资格</span>
                  <span class="wf-detail-panel__value">
                    <span
                      class="wf-status-badge"
                      :class="
                        detailRow.eligibleStatus === 'eligible'
                          ? 'wf-status-badge--enabled'
                          : 'wf-status-badge--disabled'
                      "
                    >
                      {{ inviteRebateEligibleLabel(detailRow.eligibleStatus) }}
                    </span>
                  </span>
                </div>
              </div>
            </section>
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
.invitee-detail-panel :deep(.wf-detail-panel__cell) {
  grid-template-columns: 112px minmax(0, 1fr);
}
</style>
