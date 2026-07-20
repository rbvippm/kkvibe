<script setup lang="ts">
import {
  AGENT_MY_SHARE_RATIO_COST_ROWS,
  AGENT_MY_SHARE_RATIO_ROWS,
} from '../../constants/agentMyShareRatio'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <!-- Figma 1433:25289 / 1433:25538 · 概况页占成比例弹框（挂页面内，避免路由白屏） -->
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
        aria-label="占成比例"
        data-node-id="1433:25538"
      >
        <div class="mh5-agent-my-share-dialog__body">
          <div class="mh5-agent-my-share-dialog__table" data-node-id="1433:25541" role="table">
            <div class="mh5-agent-my-share-dialog__head" role="row">
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="columnheader"
              >
                游戏类型
              </div>
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--ratio"
                role="columnheader"
              >
                占成比例
              </div>
            </div>
            <div
              v-for="row in AGENT_MY_SHARE_RATIO_ROWS"
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

          <div
            class="mh5-agent-my-share-dialog__table mh5-agent-my-share-dialog__table--cost"
            role="table"
            aria-label="成本类型占成比例"
          >
            <div class="mh5-agent-my-share-dialog__head" role="row">
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--type"
                role="columnheader"
              >
                成本类型
              </div>
              <div
                class="mh5-agent-my-share-dialog__cell mh5-agent-my-share-dialog__cell--ratio"
                role="columnheader"
              >
                占成比例
              </div>
            </div>
            <div
              v-for="row in AGENT_MY_SHARE_RATIO_COST_ROWS"
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
