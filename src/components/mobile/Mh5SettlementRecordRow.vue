<script setup lang="ts">
import { ref } from 'vue'
import {
  TransactionType,
  formatTxAmount,
  formatTxTimestamp,
  type TransactionRecord,
} from '../../constants/agentSettlement'
import { settlementT } from '../../constants/agentSettlementI18n'

defineProps<{
  record: TransactionRecord
}>()

const copied = ref(false)

async function copyTxId(txId: string) {
  try {
    await navigator.clipboard.writeText(txId)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <article class="mh5-settlement-record">
    <div class="mh5-settlement-record__head">
      <span
        class="mh5-settlement-record__type"
        :class="record.type === TransactionType.UP ? 'mh5-settlement-record__type--up' : 'mh5-settlement-record__type--down'"
      >
        {{ record.type === TransactionType.UP ? settlementT('txUp') : settlementT('txDown') }}
      </span>
      <span
        class="mh5-settlement-record__amount"
        :class="record.type === TransactionType.UP ? 'mh5-settlement-amount--pay' : 'mh5-settlement-amount--owe'"
      >
        {{ formatTxAmount(record.type, record.amount) }}
      </span>
    </div>

    <p class="mh5-settlement-record__time">{{ formatTxTimestamp(record.timestamp) }}</p>

    <div class="mh5-settlement-record__tx">
      <span class="mh5-settlement-record__txid">{{ settlementT('txId') }} {{ record.txId }}</span>
      <button type="button" class="mh5-settlement-record__copy" @click="copyTxId(record.txId)">
        {{ copied ? settlementT('copied') : settlementT('copy') }}
      </button>
    </div>
  </article>
</template>
