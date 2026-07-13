<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOtherMemberQuery } from '../../composables/useOtherMemberQuery'
import { mh5Alert } from '../../composables/useMh5Confirm'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  DEFAULT_MEMBER_CREDIT_PRODUCTS,
  formatMemberCreditPercent,
  OTHER_MEMBER_CREDIT_STEPS,
  type MemberCreditProduct,
} from '../../constants/memberCredit'
import { MEMBER_CREDIT_DIRECT_SPEC, MEMBER_CREDIT_OTHER_SPEC } from '../../constants/memberCreditSpec'
import { promoteToCreditMember } from '../../constants/agentTeam'
import { syncCreditRebateFromMemberCredit } from '../../constants/memberRebateRatio'
import {
  emptySelectableCredits,
  relationTagClass,
  relationTagText,
  type XCoinSelectableTarget,
} from '../../constants/xCoinTransfer'
import '../../styles/mobile-app-shell.css'

type FlowStep = 'search' | 'rebate' | 'success'

const route = useRoute()
const router = useRouter()

const isOtherMemberFlow = computed(() => !route.query.targetId)

const flowStep = ref<FlowStep>(isOtherMemberFlow.value ? 'search' : 'rebate')
const selectedMemberId = ref(String(route.query.targetId || ''))
const selectedMember = ref<XCoinSelectableTarget | null>(null)

const {
  accountQuery,
  queryLoading,
  queryError,
  queryResult,
  lookupAccount,
} = useOtherMemberQuery(selectedMemberId)

const rebatePercent = ref(0)
const products = ref<MemberCreditProduct[]>(
  DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({ ...item })),
)

const editVisible = ref(false)
const editProductKey = ref('')
const editDraft = ref('')

const pageTitle = computed(() => {
  if (flowStep.value === 'success') return '授信成功'
  return isOtherMemberFlow.value ? '其他会员授信' : '直属会员授信'
})

const editingProduct = computed(() =>
  products.value.find((item) => item.key === editProductKey.value),
)

const canConfirmMember = computed(() => Boolean(selectedMemberId.value && queryResult.value))

function flowStepIndex() {
  if (flowStep.value === 'search') return 0
  if (flowStep.value === 'rebate') return 1
  return 1
}

function stepBarStatus(index: number) {
  const current = flowStepIndex()
  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'pending'
}

function goPrevious() {
  if (flowStep.value === 'success') {
    flowStep.value = 'rebate'
    return
  }

  if (flowStep.value === 'rebate' && isOtherMemberFlow.value) {
    flowStep.value = 'search'
    return
  }

  router.back()
}

function confirmMember() {
  if (!queryResult.value) return
  selectedMember.value = queryResult.value
  flowStep.value = 'rebate'
}

function confirmCredit() {
  if (selectedMember.value) {
    promoteToCreditMember({
      id: selectedMember.value.id,
      nickname: selectedMember.value.nickname,
      avatarEmoji: '👤',
    })
  }
  syncCreditRebateFromMemberCredit(products.value)
  flowStep.value = 'success'
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent' })
}

function resetFlow() {
  flowStep.value = isOtherMemberFlow.value ? 'search' : 'rebate'
  rebatePercent.value = 0
  products.value = DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({ ...item }))
  if (isOtherMemberFlow.value) {
    selectedMemberId.value = ''
    selectedMember.value = null
    accountQuery.value = ''
  }
}

function openEdit(product: MemberCreditProduct) {
  editProductKey.value = product.key
  editDraft.value = String(product.rebate)
  editVisible.value = true
}

function closeEdit() {
  editVisible.value = false
  editProductKey.value = ''
  editDraft.value = ''
}

async function saveEdit() {
  const product = editingProduct.value
  if (!product) return

  const next = Number(editDraft.value)
  if (Number.isNaN(next) || next < 0) {
    await mh5Alert('请输入有效比例')
    return
  }

  if (next > product.maxRebate) {
    await mh5Alert(`不能超过最高 ${formatMemberCreditPercent(product.maxRebate)}`)
    return
  }

  product.rebate = next
  closeEdit()
}

if (route.query.targetId && route.query.targetName) {
  selectedMember.value = {
    id: String(route.query.targetId),
    nickname: String(route.query.targetName),
    kingkongId: '—',
    userId: String(route.query.targetId),
    accountId: String(route.query.targetName),
    relation: 'direct_member',
    credits: emptySelectableCredits(),
  }
}
</script>

<template>
  <div class="mh5-agent-credit-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="goPrevious">
      <template #right>
        <Mh5SpecAnnot
          v-if="isOtherMemberFlow"
          :spec="MEMBER_CREDIT_OTHER_SPEC"
          placement="bottom"
        />
        <Mh5SpecAnnot
          v-else
          :spec="MEMBER_CREDIT_DIRECT_SPEC"
          placement="bottom"
        />
      </template>
    </Mh5SubPageHeader>

    <div
      v-if="isOtherMemberFlow && flowStep !== 'success'"
      class="mh5-agent-credit-steps"
      aria-label="会员授信进度"
    >
      <template v-for="(item, index) in OTHER_MEMBER_CREDIT_STEPS" :key="item.key">
        <div
          class="mh5-agent-credit-step"
          :class="{
            'mh5-agent-credit-step--active': stepBarStatus(index) === 'active',
            'mh5-agent-credit-step--done': stepBarStatus(index) === 'done',
          }"
        >
          <span class="mh5-agent-credit-step__dot" aria-hidden="true">
            <svg
              v-if="stepBarStatus(index) !== 'pending'"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="mh5-agent-credit-step__label">{{ item.label }}</span>
        </div>
        <span
          v-if="index < OTHER_MEMBER_CREDIT_STEPS.length - 1"
          class="mh5-agent-credit-steps__line"
          :class="{ 'mh5-agent-credit-steps__line--done': stepBarStatus(index + 1) !== 'pending' }"
          aria-hidden="true"
        />
      </template>
    </div>

    <main v-if="flowStep === 'search'" class="mh5-member-credit-search">
      <div class="mh5-xcoin-other-search-area mh5-member-credit-search__query">
        <div class="mh5-xcoin-other-query-bar">
          <input
            v-model="accountQuery"
            type="text"
            class="mh5-xcoin-other-query-bar__input"
            placeholder="请输入会员账号或账号ID"
            @keydown.enter.prevent="lookupAccount"
          />
          <button
            type="button"
            class="mh5-xcoin-other-query-bar__btn"
            :disabled="queryLoading"
            @click="lookupAccount"
          >
            {{ queryLoading ? '查询中' : '查询' }}
          </button>
        </div>
        <p class="mh5-xcoin-other-member__tip">
          注意：非你的直属会员授信成功后将自动挂靠到你的信用会员列表，请务必核实账号信息并注意资金安全
        </p>
      </div>

      <div class="mh5-member-credit-search__result">
        <p v-if="queryError" class="mh5-xcoin-member-picker__error">{{ queryError }}</p>

        <label
          v-if="queryResult"
          class="mh5-xcoin-select-card"
          :class="{ 'mh5-xcoin-select-card--active': selectedMemberId === queryResult.id }"
        >
          <input
            v-model="selectedMemberId"
            type="radio"
            class="mh5-xcoin-select-card__radio"
            :value="queryResult.id"
          />
          <div class="mh5-xcoin-select-card__body">
            <div class="mh5-xcoin-select-card__title-row">
              <span class="mh5-xcoin-select-card__name">{{ queryResult.nickname }}</span>
              <span :class="relationTagClass(queryResult.relation)">{{ relationTagText(queryResult.relation) }}</span>
            </div>
            <div class="mh5-xcoin-select-card__stats">
              <div>
                <p class="mh5-xcoin-select-card__stat-label">金刚号</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ queryResult.kingkongId }}</p>
              </div>
              <div>
                <p class="mh5-xcoin-select-card__stat-label">用户id</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ queryResult.userId }}</p>
              </div>
            </div>
          </div>
        </label>
      </div>
    </main>

    <main v-else-if="flowStep === 'rebate'" class="mh5-agent-credit-main">
      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">退水</span>
        <div class="mh5-agent-credit-slider">
          <div class="mh5-agent-credit-slider__track">
            <div class="mh5-agent-credit-slider__fill" :style="{ width: `${rebatePercent}%` }" />
            <input
              v-model.number="rebatePercent"
              class="mh5-agent-credit-slider__input"
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label="退水比例"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ rebatePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section class="mh5-agent-credit-table-wrap">
        <table class="mh5-agent-credit-table mh5-agent-credit-table--member">
          <thead>
            <tr>
              <th>产品</th>
              <th>退水</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in products" :key="row.key">
              <td class="mh5-agent-credit-table__product">{{ row.name }}</td>
              <td>
                <div class="mh5-agent-credit-table__cell">
                  <button
                    type="button"
                    class="mh5-agent-credit-table__value-btn"
                    @click="openEdit(row)"
                  >
                    <span>{{ formatMemberCreditPercent(row.rebate) }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                      />
                      <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    </svg>
                  </button>
                  <span class="mh5-agent-credit-table__limit">最高{{ formatMemberCreditPercent(row.maxRebate) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <main v-else class="mh5-agent-credit-success">
      <div class="mh5-agent-credit-success__hero">
        <div class="mh5-member-credit-success__icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12.5 10 16.5 18 8.5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="mh5-agent-credit-success__title">会员授信成功</h2>
        <p v-if="selectedMember" class="mh5-member-credit-success__member">
          已为 <strong>{{ selectedMember.nickname }}</strong> 完成授信
        </p>
      </div>
    </main>

    <footer class="mh5-agent-credit-footer safe-pb">
      <template v-if="flowStep === 'search'">
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary mh5-member-credit-footer__btn--solo"
          :disabled="!canConfirmMember"
          @click="confirmMember"
        >
          确认会员
        </button>
      </template>
      <template v-else-if="flowStep === 'rebate'">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary" @click="confirmCredit">
          创建
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost"
          @click="backToAgentCenter"
        >
          返回代理中心
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="resetFlow"
        >
          继续授信
        </button>
      </template>
    </footer>

    <Teleport to="body">
      <div v-if="editVisible" class="mh5-agent-credit-edit-mask" @click.self="closeEdit">
        <div
          class="mh5-agent-credit-edit-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="editingProduct ? `编辑${editingProduct.name}退水` : '编辑退水'"
        >
          <h3 class="mh5-agent-credit-edit-panel__title">
            {{ editingProduct ? `编辑${editingProduct.name}退水` : '编辑退水' }}
          </h3>
          <p v-if="editingProduct" class="mh5-agent-credit-edit-panel__hint">
            最高 {{ formatMemberCreditPercent(editingProduct.maxRebate) }}
          </p>
          <div class="mh5-agent-credit-edit-panel__field">
            <input
              v-model="editDraft"
              type="number"
              min="0"
              :max="editingProduct?.maxRebate"
              step="0.1"
              class="mh5-agent-credit-edit-panel__input"
              inputmode="decimal"
            />
            <span>%</span>
          </div>
          <div class="mh5-agent-credit-edit-panel__actions">
            <button type="button" class="mh5-agent-credit-edit-panel__btn" @click="closeEdit">取消</button>
            <button
              type="button"
              class="mh5-agent-credit-edit-panel__btn mh5-agent-credit-edit-panel__btn--primary"
              @click="saveEdit"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
