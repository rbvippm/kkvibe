<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mh5Alert } from '../../composables/useMh5Confirm'
import Mh5CurrencyIcon from '../../components/mobile/Mh5CurrencyIcon.vue'
import Mh5CurrencyPickerSheet from '../../components/mobile/Mh5CurrencyPickerSheet.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  DEFAULT_MEMBER_CREDIT_PRODUCTS,
  formatMemberCreditPercent,
  lookupMemberCreditByKingkong,
  OTHER_MEMBER_CREDIT_STEPS,
  type MemberCreditKingkongLookupResult,
  type MemberCreditProduct,
} from '../../constants/memberCredit'
import { MEMBER_CREDIT_DIRECT_SPEC, MEMBER_CREDIT_OTHER_SPEC } from '../../constants/memberCreditSpec'
import { promoteToCreditMember } from '../../constants/agentTeam'
import { syncCreditRebateFromMemberCredit } from '../../constants/memberRebateRatio'
import {
  MOCK_XCOIN_BALANCES,
  XCOIN_CREDIT_CURRENCY_TABS,
  emptySelectableCredits,
  parseXCoinCreditCurrency,
  type XCoinCreditCurrency,
  type XCoinSelectableTarget,
} from '../../constants/xCoinTransfer'
import '../../styles/mobile-app-shell.css'

type FlowStep = 'search' | 'rebate' | 'credit_up' | 'success'

const route = useRoute()
const router = useRouter()

const isOtherMemberFlow = computed(() => !route.query.targetId)

const flowStep = ref<FlowStep>(isOtherMemberFlow.value ? 'search' : 'rebate')
const selectedMemberId = ref(String(route.query.targetId || ''))
const selectedMember = ref<XCoinSelectableTarget | null>(null)

const kingkongQuery = ref('')
const queryLoading = ref(false)
const lookupTip = ref('')
const lookupResult = ref<MemberCreditKingkongLookupResult | null>(null)

const queryResult = computed(() =>
  lookupResult.value?.ok ? lookupResult.value.member : null,
)

const rebatePercent = ref(0)
const products = ref<MemberCreditProduct[]>(
  DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({ ...item })),
)

const editVisible = ref(false)
const editProductKey = ref('')
const editDraft = ref('')

const creditAmount = ref('')
const creditCurrency = ref<XCoinCreditCurrency>(parseXCoinCreditCurrency(route.query.currency))
const currencyPickerOpen = ref(false)

const availableBalance = computed(() => MOCK_XCOIN_BALANCES[creditCurrency.value])
const creditAmountNumber = computed(() => Number(creditAmount.value))
const canConfirmCreditUp = computed(
  () => Boolean(selectedMember.value) && creditAmount.value !== '' && creditAmountNumber.value > 0,
)

const pageTitle = computed(() => {
  if (flowStep.value === 'success') return '授信成功'
  return isOtherMemberFlow.value ? '其他会员授信' : '直属会员授信'
})

const editingProduct = computed(() =>
  products.value.find((item) => item.key === editProductKey.value),
)

const canConfirmMember = computed(() => Boolean(selectedMemberId.value && queryResult.value))

watch(kingkongQuery, () => {
  lookupTip.value = ''
  lookupResult.value = null
  selectedMemberId.value = ''
})

async function lookupAccount() {
  lookupTip.value = ''
  lookupResult.value = null
  selectedMemberId.value = ''
  queryLoading.value = true
  await new Promise((r) => setTimeout(r, 280))
  queryLoading.value = false

  const result = lookupMemberCreditByKingkong(kingkongQuery.value)
  lookupResult.value = result
  if (result.ok) {
    lookupTip.value = result.tip
    selectedMemberId.value = result.member.id
    return
  }
  lookupTip.value = result.message
}

function flowStepIndex() {
  if (flowStep.value === 'search') return 0
  if (flowStep.value === 'rebate') return 1
  if (flowStep.value === 'credit_up') return 2
  return 2
}

function stepBarStatus(index: number) {
  const current = flowStepIndex()
  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'pending'
}

function goPrevious() {
  if (flowStep.value === 'success') {
    flowStep.value = isOtherMemberFlow.value ? 'credit_up' : 'rebate'
    return
  }

  if (flowStep.value === 'credit_up') {
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

function goCreditUpStep() {
  creditAmount.value = ''
  flowStep.value = 'credit_up'
}

async function confirmCreditUp() {
  if (!selectedMember.value) return
  if (!creditAmount.value || creditAmountNumber.value <= 0) {
    await mh5Alert('请输入上分额度')
    return
  }
  promoteToCreditMember({
    id: selectedMember.value.id,
    nickname: selectedMember.value.nickname,
    avatarEmoji: '👤',
  })
  syncCreditRebateFromMemberCredit(products.value)
  flowStep.value = 'success'
}

/** 直属会员授信：设置退水后直接创建成功（无上分步） */
function confirmDirectCredit() {
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

const creditCurrencyOptions = XCOIN_CREDIT_CURRENCY_TABS.map((tab) => tab.key)

function pickCurrency(value: string) {
  creditCurrency.value = value as XCoinCreditCurrency
  currencyPickerOpen.value = false
}

/** 上分额度：非负数字，最多两位小数 */
function onCreditAmountInput(event: Event) {
  const target = event.target as HTMLInputElement
  let next = target.value.replace(/[^\d.]/g, '')
  const firstDot = next.indexOf('.')
  if (firstDot !== -1) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '')
    const [intPart, fracPart = ''] = next.split('.')
    next = `${intPart}.${fracPart.slice(0, 2)}`
  }
  creditAmount.value = next
  if (target.value !== next) target.value = next
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent' })
}

function resetFlow() {
  flowStep.value = isOtherMemberFlow.value ? 'search' : 'rebate'
  rebatePercent.value = 0
  creditAmount.value = ''
  products.value = DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({ ...item }))
  if (isOtherMemberFlow.value) {
    selectedMemberId.value = ''
    selectedMember.value = null
    kingkongQuery.value = ''
    lookupTip.value = ''
    lookupResult.value = null
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
            v-model="kingkongQuery"
            type="text"
            class="mh5-xcoin-other-query-bar__input"
            placeholder="请输入金刚号"
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
        <p
          v-if="lookupTip"
          class="agent-invite-form__tip mh5-member-credit-search__lookup-tip"
          :class="{ 'agent-invite-form__tip--error': lookupResult && !lookupResult.ok }"
        >
          {{ lookupTip }}
        </p>
        <p class="mh5-xcoin-other-member__tip">
          注意：非你的直属会员授信成功后将自动挂靠到你的信用会员列表，请务必核实账号信息并注意资金安全
        </p>
      </div>

      <div class="mh5-member-credit-search__result">
        <label
          v-if="queryResult"
          class="mh5-xcoin-select-card mh5-member-credit-result-card"
          :class="{ 'mh5-xcoin-select-card--active': selectedMemberId === queryResult.id }"
        >
          <input
            v-model="selectedMemberId"
            type="radio"
            class="mh5-xcoin-select-card__radio"
            :value="queryResult.id"
          />
          <div class="mh5-xcoin-select-card__body">
            <p class="mh5-member-credit-result-card__nickname">昵称：{{ queryResult.nickname }}</p>
            <p class="mh5-member-credit-result-card__kingkong">金刚号：{{ queryResult.kingkongId }}</p>
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

    <main v-else-if="flowStep === 'credit_up'" class="mh5-member-credit-up">
      <button
        type="button"
        class="mh5-xcoin-currency-row"
        aria-label="选择信用额度币种"
        @click="currencyPickerOpen = true"
      >
        <span class="mh5-xcoin-currency-row__label">币种</span>
        <span class="mh5-xcoin-currency-row__value">
          <Mh5CurrencyIcon :code="creditCurrency" :size="20" />
          {{ $t(creditCurrency) }}
          <span class="mh5-xcoin-currency-row__arrow">›</span>
        </span>
      </button>

      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">从 我的 {{ creditCurrency }} 钱包</p>
        <input
          :value="creditAmount"
          type="text"
          inputmode="decimal"
          class="mh5-xcoin-wallet-card__amount"
          placeholder="0.00"
          @input="onCreditAmountInput"
        />
        <p class="mh5-xcoin-wallet-card__balance">
          可用 {{ availableBalance.toFixed(2) }} {{ creditCurrency }}
        </p>
      </section>

      <div class="mh5-xcoin-arrow" aria-hidden="true">↓</div>

      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">到 下级的 {{ creditCurrency }} 钱包</p>
        <div v-if="selectedMember" class="mh5-member-credit-up__target">
          <p class="mh5-member-credit-up__target-row">
            <span class="mh5-member-credit-up__target-label">昵称</span>
            <span class="mh5-member-credit-up__target-value">{{ selectedMember.nickname }}</span>
          </p>
          <p class="mh5-member-credit-up__target-row">
            <span class="mh5-member-credit-up__target-label">金刚号</span>
            <span class="mh5-member-credit-up__target-value">{{ selectedMember.kingkongId }}</span>
          </p>
        </div>
      </section>

      <p class="mh5-member-credit-up__hint">完成任意额度上分后即可创建授信</p>
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
        <button
          v-if="isOtherMemberFlow"
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="goCreditUpStep"
        >
          下一步
        </button>
        <button
          v-else
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="confirmDirectCredit"
        >
          创建
        </button>
      </template>
      <template v-else-if="flowStep === 'credit_up'">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          :disabled="!canConfirmCreditUp"
          @click="confirmCreditUp"
        >
          确认上分并创建
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

    <Mh5CurrencyPickerSheet
      :open="currencyPickerOpen"
      :currency="creditCurrency"
      :options="creditCurrencyOptions"
      @close="currencyPickerOpen = false"
      @pick="pickCurrency"
    />
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
