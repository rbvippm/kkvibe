<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5AgentReportFilter from '../../components/mobile/Mh5AgentReportFilter.vue'
import Mh5CreditSettlePanel from '../../components/mobile/Mh5CreditSettlePanel.vue'
import Mh5CurrencyPickerSheet from '../../components/mobile/Mh5CurrencyPickerSheet.vue'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  agentAppCreditCurrency,
  setAgentAppCurrencyByUser,
} from '../../constants/agentAppCurrency'
import { buildSuperiorSettlePanel, summarizeSuperiorSettle } from '../../constants/agentCreditSettle'
import { AGENT_SUPERIOR_SETTLE_SPEC } from '../../constants/agentCreditSettleSpec'
import {
  findAgentDetail,
  getAgentDetailCurrencyOptions,
  isAgentCreditCurrency,
  scaleCreditSettleStats,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  reportPresetRange,
  type ReportRangePreset,
} from '../../constants/agentReport'
import {
  MH5_DATE_RANGE_TODAY,
  creditSettleRangeScale,
  formatDateRangeText,
} from '../../constants/mh5DateRange'
import '../../styles/mobile-app-shell.css'

/** embedded：嵌入「我的报表 · 交收」Tab，不渲染二级页头 */
const props = withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false })

const router = useRouter()
const { withAgentQuery } = useAgentIdentity()

const creditCurrency = agentAppCreditCurrency
const currencyOptions = getAgentDetailCurrencyOptions('credit')
const currencyPickerOpen = ref(false)

const todayRange = reportPresetRange('today')
const preset = ref<ReportRangePreset | null>('today')
const settleStart = ref(todayRange.start)
const settleEnd = ref(todayRange.end)
const settleDateOpen = ref(false)
const settleDateText = computed(() => formatDateRangeText(settleStart.value, settleEnd.value))

const self = findAgentDetail('self')

const panel = computed(() => {
  if (!self) return null
  const scale = creditSettleRangeScale(settleStart.value, settleEnd.value)
  const summary = summarizeSuperiorSettle(creditCurrency.value, scale)
  const transfer = scaleCreditSettleStats(self.creditLimits[creditCurrency.value], scale)
  return buildSuperiorSettlePanel(summary, creditCurrency.value, transfer)
})

function pickCurrency(value: string) {
  if (isAgentCreditCurrency(value as AgentWalletCurrency)) {
    setAgentAppCurrencyByUser(value as AgentWalletCurrency)
  }
  currencyPickerOpen.value = false
}

function pickPreset(key: string) {
  const range = reportPresetRange(key as ReportRangePreset)
  preset.value = key as ReportRangePreset
  settleStart.value = range.start
  settleEnd.value = range.end
}

function confirmDate(start: string, end: string) {
  settleStart.value = start
  settleEnd.value = end
  preset.value = null
  settleDateOpen.value = false
}

function openLink(link: { kind: 'agent' | 'member'; id: string }) {
  router.push({
    name: link.kind === 'agent' ? 'mobile-agent-detail' : 'mobile-member-detail',
    query: withAgentQuery({ id: link.id, tab: 'credit' }),
  })
}

function goStatement() {
  router.push({
    name: 'mobile-xcoin-records',
    query: withAgentQuery({ currency: creditCurrency.value, lane: 'superior' }),
  })
}
</script>

<template>
  <div
    class="mh5-agent-detail-page"
    :class="{ 'mh5-agent-detail-page--report-embedded': props.embedded }"
  >
    <Mh5SubPageHeader v-if="!props.embedded" :title="$t('上级交收')">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_SUPERIOR_SETTLE_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-agent-detail-main">
      <Mh5AgentReportFilter
        class="mh5-superior-settle-filter"
        :date-text="settleDateText"
        :currency="creditCurrency"
        :active-preset="preset"
        @open-date="settleDateOpen = true"
        @open-currency="currencyPickerOpen = true"
        @pick-preset="pickPreset"
      />

      <section
        v-if="panel"
        class="mh5-agent-detail-wallet mh5-agent-detail-xcoin mh5-agent-detail-credit-settle"
      >
        <div class="mh5-agent-detail-credit-settle__head">
          <h3 class="mh5-agent-detail-wallet__title">
            对账结算
            <Mh5SpecAnnot
              v-if="props.embedded"
              :spec="AGENT_SUPERIOR_SETTLE_SPEC"
              placement="bottom"
            />
          </h3>
        </div>
        <Mh5CreditSettlePanel :panel="panel" @link="openLink" />
        <button type="button" class="mh5-agent-detail-credit-settle__statement" @click="goStatement">
          查看与上级的流水对账单
        </button>
      </section>

      <p v-else class="mh5-settlement-empty">
        <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
        暂无上级交收数据
      </p>
    </main>

    <Mh5DateRangeSheet
      :open="settleDateOpen"
      :start="settleStart"
      :end="settleEnd"
      :today="MH5_DATE_RANGE_TODAY"
      @close="settleDateOpen = false"
      @confirm="confirmDate"
    />

    <Mh5CurrencyPickerSheet
      :open="currencyPickerOpen"
      :currency="creditCurrency"
      :options="currencyOptions"
      @close="currencyPickerOpen = false"
      @pick="pickCurrency"
    />
  </div>
</template>
