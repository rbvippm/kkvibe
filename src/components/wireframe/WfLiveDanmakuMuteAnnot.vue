<script setup lang="ts">
import {
  LIVE_DANMAKU_MUTE_ANNOT_MAP,
  type LiveDanmakuMuteAnnotContext,
} from '../../constants/liveDanmakuMuteSpec'
import WfSpecAnnot from './WfSpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    context: LiveDanmakuMuteAnnotContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const spec = LIVE_DANMAKU_MUTE_ANNOT_MAP[props.context]
</script>

<template>
  <WfSpecAnnot :no="spec.no" :title="spec.title" :items="[...spec.items]" :placement="placement" />
</template>
