<script setup lang="ts">
import { computed } from 'vue'
import { AGENT_MY_SHARE_RATIO_ROWS } from '../../constants/agentMyShareRatio'
import { t } from '../../i18n'
import {
  getMatchedRebateTierId,
  getRebateCommissionTiers,
  getRebateTierChase,
  rebateProgressRatio,
  type AgentIdentityType,
} from '../../constants/agentIdentity'
import { formatPct, formatProfit } from '../../constants/agentCommissionSetting'
import {
  AGENT_MY_REBATE_RATIO_SPEC,
  AGENT_MY_SHARE_RATIO_SPEC,
} from '../../constants/agentMyShareRatioSpec'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode?: AgentIdentityType
    /** 概况当前币种，返佣档位按币种读取 BI 配置 */
    currency?: string
  }>(),
  { mode: 'share', currency: 'KKC' },
)

const emit = defineEmits<{
  close: []
}>()

const isRebate = computed(() => props.mode === 'rebate')
const shareRows = computed(() => AGENT_MY_SHARE_RATIO_ROWS)
const rebateTiers = computed(() => getRebateCommissionTiers(props.currency))
const matchedTierId = computed(() =>
  isRebate.value ? getMatchedRebateTierId(props.currency) : null,
)
const chase = computed(() => (isRebate.value ? getRebateTierChase(props.currency) : null))
const dialogLabel = computed(() => (isRebate.value ? t('返佣条件') : t('占成比例')))

const profitBarPct = computed(() => {
  const next = chase.value?.next
  const current = chase.value?.progress.teamGameProfit ?? 0
  const target = next?.monthlyProfit ?? current
  return Math.round(rebateProgressRatio(current, target || 1) * 100)
})

const activeBarPct = computed(() => {
  const next = chase.value?.next
  const current = chase.value?.progress.activeMembers ?? 0
  const target = next?.minActiveMembers ?? current
  return Math.round(rebateProgressRatio(current, target || 1) * 100)
})

const currentRateText = computed(() => {
  const pct = chase.value?.matched?.commissionPct
  return pct == null ? '—' : `${Number(pct)}%`
})

const chaseLine = computed(() => {
  const info = chase.value
  if (!info || rebateTiers.value.length === 0) return ''
  if (!info.next) return t('已达最高档')
  return t('再加把劲，冲击下一档返佣：{rate}', { rate: `${Number(info.next.commissionPct)}%` })
})
</script>

<template>
  <Transition name="mh5-agent-my-share-dialog">
    <div
      v-if="open"
      class="mh5-agent-my-share-dialog-mask"
      data-name="代理中心-首页-我的佣金比例"
      @click.self="emit('close')"
    >
      <div
        class="mh5-agent-my-share-dialog"
        :class="{ 'mh5-agent-my-share-dialog--rebate-tiers': isRebate }"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        data-node-id="1433:25538"
      >
        <div class="mh5-agent-my-share-dialog__title">
          <span class="mh5-agent-my-share-dialog__title-text">{{ dialogLabel }}</span>
          <Mh5SpecAnnot
            v-if="isRebate"
            :key="'rebate-ratio-2'"
            :spec="AGENT_MY_REBATE_RATIO_SPEC"
            placement="bottom"
          />
          <Mh5SpecAnnot
            v-else
            :key="'share-ratio-1'"
            :spec="AGENT_MY_SHARE_RATIO_SPEC"
            placement="bottom"
          />
        </div>

        <div class="mh5-agent-my-share-dialog__body">
          <!-- 返佣：本月进度 + 档位表 -->
          <template v-if="isRebate">
            <section
              v-if="chase && rebateTiers.length > 0"
              class="mh5-agent-my-share-dialog__progress"
              :aria-label="$t('本月进度')"
            >
              <p class="mh5-agent-my-share-dialog__progress-title">
                <span>{{ $t('本月进度') }}</span>
                <span class="mh5-agent-my-share-dialog__progress-rate">
                  {{ $t('当前返佣：{rate}', { rate: currentRateText }) }}
                </span>
              </p>
              <div class="mh5-agent-my-share-dialog__progress-grid">
                <div class="mh5-agent-my-share-dialog__progress-item">
                  <div class="mh5-agent-my-share-dialog__progress-meta">
                    <span>{{ $t('总盈利') }}</span>
                    <strong>{{ formatProfit(chase.progress.teamGameProfit) }}</strong>
                  </div>
                  <div
                    class="mh5-agent-my-share-dialog__bar"
                    role="progressbar"
                    :aria-valuenow="profitBarPct"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <i :style="{ width: `${chase.next ? profitBarPct : 100}%` }" />
                  </div>
                  <p class="mh5-agent-my-share-dialog__progress-target">
                    {{
                      chase.next
                        ? `${$t('下一档')} ${formatProfit(chase.next.monthlyProfit)}`
                        : $t('已达最高档')
                    }}
                  </p>
                </div>
                <div class="mh5-agent-my-share-dialog__progress-item">
                  <div class="mh5-agent-my-share-dialog__progress-meta">
                    <span>{{ $t('活跃人数') }}</span>
                    <strong>{{ chase.progress.activeMembers }}</strong>
                  </div>
                  <div
                    class="mh5-agent-my-share-dialog__bar"
                    role="progressbar"
                    :aria-valuenow="activeBarPct"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <i :style="{ width: `${chase.next ? activeBarPct : 100}%` }" />
                  </div>
                  <p class="mh5-agent-my-share-dialog__progress-target">
                    {{
                      chase.next
                        ? `${$t('下一档')} ${chase.next.minActiveMembers}`
                        : $t('已达最高档')
                    }}
                  </p>
                </div>
              </div>
              <p
                class="mh5-agent-my-share-dialog__progress-chase"
                :class="{
                  'mh5-agent-my-share-dialog__progress-chase--max': !chase.next,
                }"
              >
                {{ chaseLine }}
              </p>
            </section>

            <div
              class="mh5-agent-my-share-dialog__table mh5-agent-my-share-dialog__table--tiers"
              role="table"
              :aria-label="$t('当月佣金档位')"
            >
              <div class="mh5-agent-my-share-dialog__head" role="row">
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-profit"
                  role="columnheader"
                >{{ $t('当月总盈利') }}</div>
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-active"
                  role="columnheader"
                >{{ $t('活跃人数') }}</div>
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-ratio"
                  role="columnheader"
                >{{ $t('比例') }}</div>
              </div>
              <div
                v-if="rebateTiers.length === 0"
                class="mh5-agent-my-share-dialog__row mh5-agent-my-share-dialog__row--empty"
                role="row"
              >
                <div class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--empty" role="cell">{{ $t('暂无返佣比例') }}</div>
              </div>
              <div
                v-for="tier in rebateTiers"
                :key="tier.id"
                class="mh5-agent-my-share-dialog__row"
                :class="{ 'mh5-agent-my-share-dialog__row--matched': tier.id === matchedTierId }"
                role="row"
                :aria-current="tier.id === matchedTierId ? 'true' : undefined"
              >
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-profit"
                  role="cell"
                >
                  {{ formatProfit(tier.monthlyProfit) }}
                </div>
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-active"
                  role="cell"
                >
                  {{ tier.minActiveMembers }}
                </div>
                <div
                  class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--tier-ratio"
                  role="cell"
                >
                  <span>{{ formatPct(tier.commissionPct) }}</span>
                  <span
                    v-if="tier.id === matchedTierId"
                    class="mh5-agent-my-share-dialog__matched-mark"
                    :aria-label="$t('当前满足档位')"
                  >✅</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 占成：各游戏类型比例 -->
          <div
            v-else
            class="mh5-agent-my-share-dialog__table"
            data-node-id="1433:25541"
            role="table"
          >
            <div class="mh5-agent-my-share-dialog__head" role="row">
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="columnheader"
              >{{ $t('占成类型') }}</div>
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--ratio"
                role="columnheader"
              >{{ $t('占成比例') }}</div>
            </div>
            <div
              v-for="row in shareRows"
              :key="row.key"
              class="mh5-agent-my-share-dialog__row"
              role="row"
            >
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="cell"
              >
                {{ $t(row.name) }}
              </div>
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--ratio"
                role="cell"
              >
                {{ row.shareText }}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mh5-agent-my-share-dialog__btn"
          data-node-id="1433:25592"
          @click="emit('close')"
        >{{ $t('确定') }}</button>
      </div>
    </div>
  </Transition>
</template>
