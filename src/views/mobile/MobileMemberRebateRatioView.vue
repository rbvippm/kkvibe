<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { getAgentProfitRelationLabel } from '../../constants/agentProfitRatio'
import {
  formatMemberRebatePercent,
  getMemberRebateProductIcon,
  getMemberRebateProducts,
  getMemberRebateUpdatedAt,
  isMemberCreditEnabled,
  MEMBER_REBATE_RATIO_TYPE_TABS,
  parseMemberRebateRatioType,
  resolveMemberKindHint,
  type MemberRebateRatioType,
} from '../../constants/memberRebateRatio'
import { MEMBER_REBATE_RATIO_SPEC } from '../../constants/memberRebateRatioSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const targetId = computed(() => String(route.query.targetId || ''))
const targetNickname = computed(() => String(route.query.targetName || 'OO12300932'))
const relationLabel = computed(() => getAgentProfitRelationLabel(String(route.query.relation || 'direct')))
const kindHint = computed(() =>
  resolveMemberKindHint(targetId.value, String(route.query.kind || '')),
)
const creditedHint = computed(() => String(route.query.credited || ''))

const showCreditTabs = computed(() =>
  isMemberCreditEnabled(targetId.value, kindHint.value, creditedHint.value),
)

const ratioType = ref<MemberRebateRatioType>(
  showCreditTabs.value ? parseMemberRebateRatioType(String(route.query.ratioType || 'cash')) : 'cash',
)

watch(showCreditTabs, (enabled) => {
  if (!enabled) ratioType.value = 'cash'
})

const displayProducts = computed(() => getMemberRebateProducts(ratioType.value).value)
const updatedAt = computed(() => getMemberRebateUpdatedAt(ratioType.value).value)

function goEdit() {
  router.push({
    name: 'mobile-member-rebate-ratio-edit',
    query: {
      targetId: route.query.targetId,
      targetName: route.query.targetName,
      relation: route.query.relation,
      kind: kindHint.value,
      credited: showCreditTabs.value ? '1' : '0',
      ratioType: ratioType.value,
    },
  })
}
</script>

<template>
  <div class="mh5-member-rebate-page">
    <Mh5SubPageHeader title="会员退水比例">
      <template #right>
        <Mh5SpecAnnot :spec="MEMBER_REBATE_RATIO_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-member-rebate-main">
      <section class="mh5-member-rebate-profile">
        <div class="mh5-member-rebate-profile__left">
          <div class="mh5-member-rebate-profile__avatar" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="mh5-member-rebate-profile__meta">
            <h2>{{ targetNickname }}</h2>
            <span class="mh5-member-rebate-profile__tag">{{ relationLabel }}</span>
          </div>
        </div>
        <button type="button" class="mh5-member-rebate-profile__edit" @click="goEdit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          修改
        </button>
      </section>

      <nav
        v-if="showCreditTabs"
        class="mh5-agent-profit-ratio-seg"
        role="tablist"
        aria-label="退水类型"
      >
        <button
          v-for="tab in MEMBER_REBATE_RATIO_TYPE_TABS"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-agent-profit-ratio-seg__item"
          :class="{ 'mh5-agent-profit-ratio-seg__item--active': ratioType === tab.key }"
          :aria-selected="ratioType === tab.key"
          @click="ratioType = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="mh5-member-rebate-list" aria-label="产品退水">
        <div
          v-for="row in displayProducts"
          :key="`${ratioType}-${row.key}`"
          class="mh5-member-rebate-list__row"
        >
          <div class="mh5-member-rebate-list__product">
            <span class="mh5-member-rebate-list__icon" aria-hidden="true">
              {{ getMemberRebateProductIcon(row.key) }}
            </span>
            <span class="mh5-member-rebate-list__name">{{ row.name }}</span>
          </div>
          <span class="mh5-member-rebate-list__value">{{ formatMemberRebatePercent(row.rebate) }}</span>
        </div>
      </section>

      <p class="mh5-member-rebate-updated">修改时间 {{ updatedAt }}</p>
    </main>
  </div>
</template>
