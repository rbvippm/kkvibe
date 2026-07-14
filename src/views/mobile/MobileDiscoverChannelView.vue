<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useDiscoverChannels } from '../../composables/useDiscoverChannels'
import { DISCOVER_CHANNEL_ASSETS } from '../../constants/mobileDiscoverChannel'

const router = useRouter()
const { channels, setChannelOrder, toggleChannel } = useDiscoverChannels()

const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)

function goBack() {
  router.replace({ name: 'mobile-discover' })
}

function onDragStart(index: number, event: DragEvent) {
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dragOver.value = index
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()
  const from = dragFrom.value
  if (from === null || from === index) {
    dragFrom.value = null
    dragOver.value = null
    return
  }
  const list = [...channels.value]
  const [moved] = list.splice(from, 1)
  list.splice(index, 0, moved)
  setChannelOrder(list)
  dragFrom.value = null
  dragOver.value = null
}

function onDragEnd() {
  dragFrom.value = null
  dragOver.value = null
}
</script>

<template>
  <div class="mh5-channel-page mh5-route-view">
    <Mh5SubPageHeader title="频道设置" :on-back="goBack" />

    <main class="mh5-channel-main">
      <p class="mh5-channel-hint">
        开启后社区页将显示相关功能，下方频道可通过拖动图标调整显示顺序。
      </p>

      <section class="mh5-channel-card" aria-label="频道列表">
        <div
          v-for="(item, index) in channels"
          :key="item.id"
          class="mh5-channel-row"
          :class="{
            'mh5-channel-row--dragging': dragFrom === index,
            'mh5-channel-row--over': dragOver === index && dragFrom !== index,
          }"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver(index, $event)"
          @drop="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <div class="mh5-channel-row__left">
            <img class="mh5-channel-row__icon" :src="item.icon" :alt="item.label" width="32" height="32" />
            <span class="mh5-channel-row__label">{{ item.label }}</span>
          </div>

          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': item.enabled }"
            role="switch"
            :aria-checked="item.enabled"
            :aria-label="`${item.label}${item.enabled ? '已开启' : '已关闭'}`"
            @click.stop="toggleChannel(item.id)"
          >
            <span class="mh5-channel-switch__knob" />
          </button>

          <span class="mh5-channel-row__handle" aria-hidden="true" title="拖动排序">
            <img :src="DISCOVER_CHANNEL_ASSETS.rearrange" alt="" width="24" height="24" />
          </span>
        </div>
      </section>
    </main>
  </div>
</template>
