<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useCommunityChannels } from '../../composables/useCommunityChannels'
import { useDiscoverChannels } from '../../composables/useDiscoverChannels'
import { DISCOVER_CHANNEL_ASSETS } from '../../constants/mobileDiscoverChannel'

const route = useRoute()
const router = useRouter()
const isCommunityMode = computed(() => String(route.name) === 'mobile-community-channel')
const discoverApi = useDiscoverChannels()
const communityApi = useCommunityChannels()

const channels = computed(() =>
  isCommunityMode.value ? communityApi.channels.value : discoverApi.channels.value,
)

const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)

function goBack() {
  const from = String(route.query.from || '')
  if (from === 'vip-club-community') {
    router.replace({ name: 'mobile-vip-club-community' })
    return
  }
  router.replace({ name: isCommunityMode.value ? 'mobile-community' : 'mobile-discover' })
}

function reorderChannels(from: number, to: number) {
  if (isCommunityMode.value) {
    const list = [...communityApi.channels.value]
    const [moved] = list.splice(from, 1)
    if (!moved) return
    list.splice(to, 0, moved)
    communityApi.setChannelOrder(list)
    return
  }
  const list = [...discoverApi.channels.value]
  const [moved] = list.splice(from, 1)
  if (!moved) return
  list.splice(to, 0, moved)
  discoverApi.setChannelOrder(list)
}

function toggleChannel(id: string) {
  if (isCommunityMode.value) {
    communityApi.toggleChannel(id as (typeof communityApi.channels.value)[number]['id'])
    return
  }
  discoverApi.toggleChannel(id as (typeof discoverApi.channels.value)[number]['id'])
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
  reorderChannels(from, index)
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
    <Mh5SubPageHeader :title="$t('频道设置')" :on-back="goBack" />

    <main class="mh5-channel-main">
      <p class="mh5-channel-hint">
        {{
          isCommunityMode
            ? $t('开启后社区页将显示相关功能，下方频道可通过拖动图标调整显示顺序。')
            : $t('开启后发现页将显示相关功能，下方频道可通过拖动图标调整显示顺序。')
        }}
      </p>

      <section class="mh5-channel-card" :aria-label="$t('频道列表')">
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
            <span class="mh5-channel-row__label">{{ $t(item.label) }}</span>
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

          <span class="mh5-channel-row__handle" aria-hidden="true" :title="$t('拖动排序')">
            <img :src="DISCOVER_CHANNEL_ASSETS.rearrange" alt="" width="24" height="24" />
          </span>
        </div>
      </section>
    </main>
  </div>
</template>
