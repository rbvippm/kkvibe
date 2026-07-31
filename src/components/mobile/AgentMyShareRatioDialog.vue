<script setup lang="ts">
import { computed } from 'vue'
import { AGENT_MY_SHARE_RATIO_ROWS } from '../../constants/agentMyShareRatio'
import {
  agentMyRebateRatioRowsByLevel,
  type AgentIdentityType,
} from '../../constants/agentIdentity'
import { MOCK_COMMISSION_AGENT_LEVEL } from '../../constants/agentCommissionReport'
import {
  AGENT_MY_REBATE_RATIO_SPEC,
  AGENT_MY_SHARE_RATIO_SPEC,
} from '../../constants/agentMyShareRatioSpec'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode?: AgentIdentityType
  }>(),
  { mode: 'share' },
)

const emit = defineEmits<{
  close: []
}>()

const isRebate = computed(() => props.mode === 'rebate')
const rows = computed(() =>
  isRebate.value
    ? agentMyRebateRatioRowsByLevel(MOCK_COMMISSION_AGENT_LEVEL)
    : AGENT_MY_SHARE_RATIO_ROWS,
)
const dialogLabel = computed(() => (isRebate.value ? '返佣比例' : '占成比例'))
const typeHeader = computed(() => (isRebate.value ? '代理' : '占成类型'))
const ratioHeader = computed(() => (isRebate.value ? '返佣比例' : '占成比例'))
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
          <div class="mh5-agent-my-share-dialog__table" data-node-id="1433:25541" role="table">
            <div class="mh5-agent-my-share-dialog__head" role="row">
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="columnheader"
              >
                {{ typeHeader }}
              </div>
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--ratio"
                role="columnheader"
              >
                {{ ratioHeader }}
              </div>
            </div>
            <div
              v-for="row in rows"
              :key="row.key"
              class="mh5-agent-my-share-dialog__row"
              role="row"
            >
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="cell"
              >
                {{ row.name }}
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
        >
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>
