<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { mh5Confirm } from '../../composables/useMh5Confirm'
import {
  cancelGoLiveSchedule,
  combineGoLiveScheduleTime,
  createGoLiveSchedule,
  filterGoLiveGames,
  formatGoLiveOvertime,
  formatGoLiveScheduleTime,
  expireOverdueGoLiveSchedules,
  findGoLiveSchedule,
  fulfillGoLiveSchedule,
  GO_LIVE_BACKGROUNDS,
  GO_LIVE_CATEGORIES,
  GO_LIVE_DEFAULT_CATEGORY,
  GO_LIVE_DEFAULT_COVER,
  GO_LIVE_DEFAULT_TITLE,
  GO_LIVE_HOST_NAME,
  GO_LIVE_GAME_GROUPS,
  GO_LIVE_MODE_LABELS,
  GO_LIVE_RATIOS,
  GO_LIVE_SCHEDULE_HOURS,
  GO_LIVE_SCHEDULE_LIMIT_HINT,
  GO_LIVE_SCHEDULE_MAX,
  GO_LIVE_SCHEDULE_MINUTES,
  GO_LIVE_SCREEN_HINT,
  GO_LIVE_TABS,
  GO_LIVE_TITLE_MAX,
  goLiveRatioHint,
  goLiveScheduleDayOptions,
  goLiveTitleForTab,
  isGoLiveScheduleOvertime,
  listActiveGoLiveSchedules,
  nearestPendingGoLiveSchedule,
  nextGoLiveCover,
  splitGoLiveScheduleTime,
  suggestGoLiveScheduleTime,
  validateGoLiveScheduleTime,
  type GoLiveBeautyStyle,
  type GoLiveContrast,
  type GoLiveGameGroup,
  type GoLiveRatio,
  type GoLiveSchedule,
  type GoLiveTab,
} from '../../constants/goLive'
import { GO_LIVE_PREVIEW_SPEC } from '../../constants/goLiveSpec'
import { mineHomeRouteName } from '../../constants/mineHall'
import { t } from '../../i18n'
import '../../styles/mobile-app-shell.css'

type GoLiveSheet = 'category' | 'game' | 'ratio' | 'background' | 'time' | 'schedule' | 'poster' | null

const router = useRouter()
const route = useRoute()

const tab = ref<GoLiveTab>('video')
const title = ref<string>(GO_LIVE_DEFAULT_TITLE.video)
const titleEditing = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const category = ref(GO_LIVE_DEFAULT_CATEGORY)
const cover = ref(GO_LIVE_DEFAULT_COVER)
const ratio = ref<GoLiveRatio>('original')
const gameGroup = ref<GoLiveGameGroup>('cash')
const selectedGameId = ref('')
const backgroundId = ref<string>(GO_LIVE_BACKGROUNDS[0].id)
const sheet = ref<GoLiveSheet>(null)
const beautyOpen = ref(false)
const beautyOn = ref(false)
const beautyItem = ref<'level' | 'style' | 'white' | 'contrast'>('level')
const beautyLevel = ref(0)
const beautyWhite = ref(0)
const beautyStyle = ref<GoLiveBeautyStyle>('女士')
const beautyContrast = ref<GoLiveContrast>('正常')
const cameraFlipped = ref(false)
const toast = ref('')
const linkedId = ref<string | null>(null)
const draftTime = ref<number | null>(null)
const nowMs = ref(Date.now())
const timeDay = ref(0)
const timeHour = ref(20)
const timeMinute = ref(0)
const applyingSchedule = ref(false)
const restoreLinkedId = ref<string | null>(null)
const posterItem = ref<GoLiveSchedule | null>(null)
const hourRow = ref<HTMLElement | null>(null)

let tickTimer = 0

const games = computed(() => filterGoLiveGames(gameGroup.value))
const selectedBackground = computed(
  () => GO_LIVE_BACKGROUNDS.find((item) => item.id === backgroundId.value) ?? GO_LIVE_BACKGROUNDS[0],
)
const pageStyle = computed(() => {
  if (tab.value === 'voice') {
    return { backgroundImage: `url(${selectedBackground.value.image})` }
  }
  return undefined
})
const activeSchedules = computed(() => listActiveGoLiveSchedules(nowMs.value))
const linkedSchedule = computed(
  () => activeSchedules.value.find((item) => item.id === linkedId.value) ?? null,
)
const nearestSchedule = computed(() => nearestPendingGoLiveSchedule(nowMs.value))
const timeLabel = computed(() => {
  if (!draftTime.value) return t('未设置 (直接开播)')
  return `${formatGoLiveScheduleTime(draftTime.value, nowMs.value)} (${t('可编辑')})`
})
const linkBarTime = computed(() => {
  if (!linkedSchedule.value) return ''
  return formatGoLiveScheduleTime(linkedSchedule.value.startAt, nowMs.value)
})
const ctaLabel = computed(() => {
  if (linkedSchedule.value) return '立即开播 (已关联预告)'
  if (draftTime.value) return '发布直播预告'
  return tab.value === 'voice' ? '创建房间' : '开始直播'
})
const ratioHint = computed(() => goLiveRatioHint(ratio.value))
const dayOptions = computed(() => goLiveScheduleDayOptions(nowMs.value))
const canCreateSchedule = computed(() => activeSchedules.value.length < GO_LIVE_SCHEDULE_MAX)
const pickingTimeLabel = computed(() =>
  formatGoLiveScheduleTime(
    combineGoLiveScheduleTime(timeDay.value, timeHour.value, timeMinute.value, nowMs.value),
    nowMs.value,
  ),
)
const scheduleBadgeMap = computed(() => {
  const map: Record<string, { text: string; tone: 'soon' | 'late' } | null> = {}
  for (const item of activeSchedules.value) {
    if (isGoLiveScheduleOvertime(item, nowMs.value)) {
      map[item.id] = { text: formatGoLiveOvertime(item.startAt, nowMs.value), tone: 'late' }
    } else if (nearestSchedule.value?.id === item.id) {
      map[item.id] = { text: '即将开始', tone: 'soon' }
    } else {
      map[item.id] = null
    }
  }
  return map
})
const sliderValue = computed(() => {
  if (beautyItem.value === 'white') return beautyWhite.value
  if (beautyItem.value === 'contrast') return contrastToSlider(beautyContrast.value)
  return beautyLevel.value
})
const sliderLabel = computed(() => {
  if (beautyItem.value === 'style') return beautyStyle.value
  if (beautyItem.value === 'contrast') return beautyContrast.value
  if (beautyItem.value === 'white') return String(beautyWhite.value)
  return String(beautyLevel.value)
})

function contrastToSlider(value: GoLiveContrast) {
  if (value === '低') return 0
  if (value === '高') return 100
  return 50
}

function sliderToContrast(value: number): GoLiveContrast {
  if (value < 34) return '低'
  if (value > 66) return '高'
  return '正常'
}

function showToast(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1800)
}

function closePage() {
  const home = mineHomeRouteName(route.query.from)
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.replace({ name: home })
}

function applySchedule(item: GoLiveSchedule) {
  applyingSchedule.value = true
  linkedId.value = item.id
  title.value = item.title
  cover.value = item.cover
  category.value = item.category
  tab.value = item.mode
  draftTime.value = item.startAt
  titleEditing.value = false
  void nextTick(() => {
    applyingSchedule.value = false
  })
}

function unlinkSchedule() {
  linkedId.value = null
  draftTime.value = null
}

function tickSchedules() {
  nowMs.value = Date.now()
  const expired = expireOverdueGoLiveSchedules(nowMs.value)
  if (expired.length) {
    showToast(t('「{title}」已超时失效，已通知预约粉丝', { title: expired[0].title }))
  }
  if (linkedId.value && !linkedSchedule.value) {
    const next = nearestPendingGoLiveSchedule(nowMs.value)
    if (next) applySchedule(next)
    else unlinkSchedule()
  }
}

function closeSheet() {
  if (sheet.value === 'poster') {
    posterItem.value = null
    sheet.value = 'schedule'
    return
  }
  if (sheet.value === 'time' && restoreLinkedId.value) {
    const previous = findGoLiveSchedule(restoreLinkedId.value)
    restoreLinkedId.value = null
    if (previous && previous.status === 'pending') applySchedule(previous)
  }
  sheet.value = null
}

function switchTab(next: GoLiveTab) {
  const prev = tab.value
  if (!linkedSchedule.value) {
    const prevDefault = goLiveTitleForTab(prev)
    if (title.value === prevDefault) title.value = goLiveTitleForTab(next)
  }
  tab.value = next
  titleEditing.value = false
  beautyOpen.value = false
  if (sheet.value !== 'schedule' && sheet.value !== 'time') sheet.value = null
}

function startEditTitle() {
  titleEditing.value = true
  void nextTick(() => titleInput.value?.focus())
}

function clampTitle(value: string) {
  title.value = value.slice(0, GO_LIVE_TITLE_MAX)
}

function openSheet(next: GoLiveSheet) {
  beautyOpen.value = false
  sheet.value = next
}

function openScheduleSheet() {
  tickSchedules()
  openSheet('schedule')
}

function openTimeSheet() {
  const source = draftTime.value ?? suggestGoLiveScheduleTime(nowMs.value)
  const parts = splitGoLiveScheduleTime(source, nowMs.value)
  timeDay.value = parts.offset
  timeHour.value = parts.hour
  timeMinute.value = parts.minute
  openSheet('time')
  void nextTick(() => {
    hourRow.value?.querySelector('.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
}

function pickCategory(name: string) {
  category.value = name
  sheet.value = null
}

function pickGame(id: string, name: string) {
  selectedGameId.value = id
  sheet.value = null
  showToast(`已选择「${name}」`)
}

function pickBackground(id: string) {
  backgroundId.value = id
}

function changeCover() {
  cover.value = nextGoLiveCover(cover.value)
  showToast('封面已更新')
}

function flipCamera() {
  cameraFlipped.value = !cameraFlipped.value
  showToast('已翻转摄像头（原型）')
}

function openBeauty() {
  sheet.value = null
  beautyOpen.value = true
}

function closeBeauty() {
  beautyOpen.value = false
}

function resetBeauty() {
  beautyOn.value = false
  beautyItem.value = 'level'
  beautyLevel.value = 0
  beautyWhite.value = 0
  beautyStyle.value = '女士'
  beautyContrast.value = '正常'
}

function toggleBeauty() {
  beautyOn.value = !beautyOn.value
}

function onSliderInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  beautyOn.value = true
  if (beautyItem.value === 'white') {
    beautyWhite.value = value
    return
  }
  if (beautyItem.value === 'contrast') {
    beautyContrast.value = sliderToContrast(value)
    return
  }
  if (beautyItem.value === 'style') {
    beautyStyle.value = value >= 50 ? '男士' : '女士'
    return
  }
  beautyLevel.value = value
}

function pickBeautyItem(item: typeof beautyItem.value) {
  beautyItem.value = item
  if (item === 'style') {
    beautyOn.value = true
    beautyStyle.value = beautyStyle.value === '女士' ? '男士' : '女士'
  }
}

function confirmTime() {
  const ts = combineGoLiveScheduleTime(timeDay.value, timeHour.value, timeMinute.value, nowMs.value)
  const error = validateGoLiveScheduleTime(ts, linkedId.value, nowMs.value)
  if (error) {
    showToast(t(error))
    return
  }
  draftTime.value = ts
  if (linkedSchedule.value) linkedSchedule.value.startAt = ts
  restoreLinkedId.value = null
  sheet.value = null
}

function clearTime() {
  restoreLinkedId.value = null
  unlinkSchedule()
  sheet.value = null
  showToast('已清除开播时间，将直接开播')
}

function switchToSchedule(item: GoLiveSchedule) {
  applySchedule(item)
  sheet.value = null
  showToast('已切换为该场预告')
}

function editSchedule(item: GoLiveSchedule) {
  applySchedule(item)
  sheet.value = null
  showToast('已载入该场预告，可修改后开播')
}

async function removeSchedule(item: GoLiveSchedule) {
  const ok = await mh5Confirm({
    title: '删除直播预告？',
    message: '删除后已预约粉丝将收到取消通知，该场次不可恢复。',
    confirmText: '删除',
    cancelText: '再想想',
  })
  if (!ok) return
  cancelGoLiveSchedule(item.id)
  if (linkedId.value === item.id) {
    const next = nearestPendingGoLiveSchedule()
    if (next) applySchedule(next)
    else unlinkSchedule()
  }
  tickSchedules()
  showToast('预告已删除，已通知预约粉丝（原型）')
}

function sendPoster() {
  showToast('预告海报已生成，可转发给粉丝（原型）')
  closeSheet()
}

function startCreateSchedule() {
  if (!canCreateSchedule.value) {
    showToast(t(GO_LIVE_SCHEDULE_LIMIT_HINT))
    return
  }
  restoreLinkedId.value = linkedId.value
  linkedId.value = null
  draftTime.value = null
  title.value = goLiveTitleForTab(tab.value)
  category.value = GO_LIVE_DEFAULT_CATEGORY
  openTimeSheet()
}

function goFreeLive() {
  unlinkSchedule()
  sheet.value = null
  showToast(tab.value === 'voice' ? '已创建房间，未消耗预告（原型）' : '已开始直播，未消耗预告（原型）')
}

function publishSchedule() {
  if (!draftTime.value) {
    showToast('请先选择预计开播时间')
    return
  }
  const result = createGoLiveSchedule({
    title: title.value,
    cover: cover.value,
    category: category.value,
    mode: tab.value,
    startAt: draftTime.value,
  })
  if (result.error || !result.item) {
    showToast(t(result.error || GO_LIVE_SCHEDULE_LIMIT_HINT))
    return
  }
  applySchedule(result.item)
  showToast('预告已发布，粉丝可预约本场直播')
}

function enterFulfilledRoom(schedule: GoLiveSchedule, reservedCount: number) {
  const query = {
    id: schedule.id,
    host: GO_LIVE_HOST_NAME,
    cover: schedule.cover,
    heat: String(reservedCount),
    title: schedule.title,
    from: 'go-live',
  }
  if (schedule.mode === 'voice') {
    router.replace({ name: 'mobile-voice-room', query })
    return
  }
  router.replace({ name: 'mobile-live-stream', query })
}

function submitLive() {
  if (linkedSchedule.value) {
    const schedule = linkedSchedule.value
    const count = schedule.subscriberCount
    fulfillGoLiveSchedule(schedule.id)
    unlinkSchedule()
    tickSchedules()
    showToast(t('已向 {n} 位预约粉丝推送开播通知', { n: count }))
    window.setTimeout(() => enterFulfilledRoom(schedule, count), 700)
    return
  }
  if (draftTime.value) {
    publishSchedule()
    return
  }
  showToast(tab.value === 'voice' ? '已创建房间（原型）' : '已开始直播（原型）')
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function scheduleMeta(item: GoLiveSchedule) {
  return `${item.category} | ${GO_LIVE_MODE_LABELS[item.mode]}`
}

watch([title, category, cover, tab], () => {
  if (applyingSchedule.value) return
  const item = linkedSchedule.value
  if (!item) return
  item.title = title.value
  item.category = category.value
  item.cover = cover.value
  item.mode = tab.value
})

watch(titleEditing, (editing) => {
  if (!editing) return
  void nextTick(() => titleInput.value?.focus())
})

onMounted(() => {
  tickSchedules()
  const nearest = nearestPendingGoLiveSchedule(nowMs.value)
  if (nearest) applySchedule(nearest)
  tickTimer = window.setInterval(tickSchedules, 30_000)
})

onUnmounted(() => {
  window.clearInterval(tickTimer)
})
</script>

<template>
  <div
    class="mh5-golive-page mh5-route-view"
    :class="[`mh5-golive-page--${tab}`, { 'mh5-golive-page--flip': cameraFlipped }]"
    :style="pageStyle"
  >
    <header class="mh5-golive-head">
      <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="closePage">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
      <div class="mh5-golive-tabs" role="tablist" aria-label="开播方式">
        <button
          v-for="item in GO_LIVE_TABS"
          :key="item.key"
          type="button"
          role="tab"
          class="mh5-golive-tabs__item"
          :class="{ 'mh5-golive-tabs__item--active': tab === item.key }"
          :aria-selected="tab === item.key"
          @click="switchTab(item.key)"
        >
          {{ $t(item.label) }}
        </button>
      </div>
      <div class="mh5-golive-head__right">
        <button type="button" class="mh5-golive-preview-entry" @click="openScheduleSheet">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />
            <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          {{ $t('预告') }}({{ activeSchedules.length }})
        </button>
        <Mh5SpecAnnot :spec="GO_LIVE_PREVIEW_SPEC" placement="bottom" />
      </div>
    </header>

    <button v-if="linkedSchedule" type="button" class="mh5-golive-linkbar" @click="openScheduleSheet">
      <span class="mh5-golive-linkbar__text">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        {{ $t('已关联') }}：{{ linkBarTime }}（{{ linkedSchedule.subscriberCount }}{{ $t('人已预约') }}）
      </span>
      <span class="mh5-golive-linkbar__go">{{ $t('切换/管理') }} ›</span>
    </button>

    <div class="mh5-golive-cards">
      <div class="mh5-golive-info">
        <button type="button" class="mh5-golive-cover" @click="changeCover">
          <img :src="cover" alt="" />
          <em v-if="linkedSchedule" class="mh5-golive-cover__tag">{{ $t('已回填') }}</em>
          <span>{{ $t('更改封面') }}</span>
        </button>
        <input
          v-if="titleEditing"
          ref="titleInput"
          class="mh5-golive-title-input"
          :value="title"
          :maxlength="GO_LIVE_TITLE_MAX"
          @input="clampTitle(($event.target as HTMLInputElement).value)"
          @blur="titleEditing = false"
        />
        <button v-else type="button" class="mh5-golive-title" @click="startEditTitle">{{ title }}</button>
        <button type="button" class="mh5-golive-edit" aria-label="编辑标题" @click="startEditTitle">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M11.2 3.4l3.4 3.4-8.3 8.3H2.9v-3.4l8.3-8.3z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <button type="button" class="mh5-golive-category" @click="openSheet('category')">
        <span>{{ category }}</span>
        <svg width="12" height="18" viewBox="0 0 8 14" fill="none" aria-hidden="true">
          <path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="mh5-golive-category mh5-golive-category--time" @click="openTimeSheet">
        <span class="mh5-golive-time-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />
            <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          {{ $t('预计开播时间') }}
        </span>
        <span class="mh5-golive-time-value">
          {{ timeLabel }}
          <svg width="12" height="18" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </span>
      </button>
    </div>

    <div v-if="tab === 'screen' && !sheet && !titleEditing" class="mh5-golive-hint">
      <svg class="mh5-golive-hint__icon" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <circle cx="36" cy="28" r="14" stroke="#8d8d8d" stroke-width="3" stroke-dasharray="6 7" />
        <path d="M24 48h24l-4 10H28l-4-10z" stroke="#8d8d8d" stroke-width="3" stroke-linejoin="round" />
      </svg>
      <p>{{ $t(GO_LIVE_SCREEN_HINT) }}</p>
    </div>
    <div v-else-if="tab === 'screen' && titleEditing" class="mh5-golive-hint">
      <span class="mh5-golive-hint__hex">!</span>
      <p>{{ $t(GO_LIVE_SCREEN_HINT) }}</p>
    </div>
    <div v-else class="mh5-golive-hint mh5-golive-hint--spacer" />

    <footer v-if="!beautyOpen && !sheet" class="mh5-golive-foot">
      <div v-if="tab === 'video'" class="mh5-golive-tools">
        <button type="button" class="mh5-golive-tool" @click="flipCamera">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 8h12l3 3v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" stroke="currentColor" stroke-width="1.7" />
              <path d="M8 5h5l2 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              <path d="M9 13h6M13 11l2 2-2 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ $t('翻转') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="openBeauty">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7" />
              <path d="M8.5 13.2c.8 1.6 2.1 2.4 3.5 2.4s2.7-.8 3.5-2.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              <path d="M9 10h.01M15 10h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ $t('美颜') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="openSheet('ratio')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7" />
              <path d="M6 18L18 6" stroke="currentColor" stroke-width="1.7" />
            </svg>
          </span>
          <span>{{ $t('画面') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="openSheet('game')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="8" width="17" height="10" rx="3" stroke="currentColor" stroke-width="1.7" />
              <path d="M8 13h4M10 11v4M16.2 11.5v.01M18 14.5v.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ $t('游戏') }}</span>
        </button>
      </div>
      <div v-else-if="tab === 'voice'" class="mh5-golive-tools">
        <button type="button" class="mh5-golive-tool" @click="openSheet('background')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.7" />
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7" />
            </svg>
          </span>
          <span>{{ $t('房间背景') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="openSheet('game')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="8" width="17" height="10" rx="3" stroke="currentColor" stroke-width="1.7" />
              <path d="M8 13h4M10 11v4M16.2 11.5v.01M18 14.5v.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ $t('游戏') }}</span>
        </button>
      </div>
      <div v-else class="mh5-golive-tools">
        <button type="button" class="mh5-golive-tool" @click="openSheet('ratio')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7" />
              <path d="M6 18L18 6" stroke="currentColor" stroke-width="1.7" />
            </svg>
          </span>
          <span>{{ $t('画面') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="showToast('多手机直播（原型）')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="10" height="14" rx="1.6" stroke="currentColor" stroke-width="1.7" />
              <rect x="11" y="3" width="10" height="14" rx="1.6" stroke="currentColor" stroke-width="1.7" />
            </svg>
          </span>
          <span>{{ $t('多手机直播') }}</span>
        </button>
        <button type="button" class="mh5-golive-tool" @click="openSheet('game')">
          <span class="mh5-golive-tool__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="8" width="17" height="10" rx="3" stroke="currentColor" stroke-width="1.7" />
              <path d="M8 13h4M10 11v4M16.2 11.5v.01M18 14.5v.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ $t('游戏') }}</span>
        </button>
      </div>
      <button type="button" class="mh5-golive-cta" @click="submitLive">{{ $t(ctaLabel) }}</button>
    </footer>

    <div v-if="beautyOpen" class="mh5-golive-mask" @click="closeBeauty">
      <section class="mh5-golive-beauty" aria-label="美颜" @click.stop>
      <header class="mh5-golive-sheet__head">
        <h2>{{ $t('美颜') }}</h2>
        <button type="button" class="mh5-golive-reset" @click="resetBeauty">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8a5 5 0 1 1 1.2 3.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M3 4.5V8h3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          {{ $t('重置') }}
        </button>
      </header>
      <div class="mh5-golive-beauty__slider">
        <span class="mh5-golive-beauty__value">{{ sliderLabel }}</span>
        <input type="range" min="0" max="100" :value="sliderValue" @input="onSliderInput" />
      </div>
      <div class="mh5-golive-beauty__row">
        <div class="mh5-golive-beauty__toggle">
          <button type="button" class="mh5-golive-beauty__switch" :class="{ 'is-on': beautyOn }" @click="toggleBeauty">
            <span />
          </button>
          <p class="mh5-golive-beauty__off">{{ beautyOn ? $t('已开启') : $t('已关闭') }}</p>
        </div>
        <button
          type="button"
          class="mh5-golive-beauty__item"
          :class="{ 'is-active': beautyItem === 'level' }"
          @click="pickBeautyItem('level')"
        >
          <span class="mh5-golive-beauty__glyph">☰</span>
          <strong>{{ $t('美颜级别') }}</strong>
          <em>{{ beautyLevel }}</em>
        </button>
        <button
          type="button"
          class="mh5-golive-beauty__item"
          :class="{ 'is-active': beautyItem === 'style' }"
          @click="pickBeautyItem('style')"
        >
          <span class="mh5-golive-beauty__glyph">✎</span>
          <strong>{{ $t('美颜风格') }}</strong>
          <em>{{ beautyStyle }}</em>
        </button>
        <button
          type="button"
          class="mh5-golive-beauty__item"
          :class="{ 'is-active': beautyItem === 'white' }"
          @click="pickBeautyItem('white')"
        >
          <span class="mh5-golive-beauty__glyph">☺</span>
          <strong>{{ $t('美白') }}</strong>
          <em>{{ beautyWhite }}</em>
        </button>
        <button
          type="button"
          class="mh5-golive-beauty__item"
          :class="{ 'is-active': beautyItem === 'contrast' }"
          @click="pickBeautyItem('contrast')"
        >
          <span class="mh5-golive-beauty__glyph">◐</span>
          <strong>{{ $t('对比度') }}</strong>
          <em>{{ beautyContrast }}</em>
        </button>
      </div>
      </section>
    </div>

    <div v-if="sheet" class="mh5-golive-mask" @click.self="closeSheet">
      <section v-if="sheet === 'category'" class="mh5-golive-sheet mh5-golive-sheet--list" aria-label="直播类型">
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('直播类型') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="sheet = null">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="mh5-golive-type-list">
          <button
            v-for="item in GO_LIVE_CATEGORIES"
            :key="item"
            type="button"
            class="mh5-golive-type"
            :class="{ 'is-active': category === item }"
            @click="pickCategory(item)"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section v-else-if="sheet === 'game'" class="mh5-golive-sheet mh5-golive-sheet--game" aria-label="选择游戏">
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('选择游戏') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="sheet = null">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="mh5-golive-game-tabs">
          <button
            v-for="group in GO_LIVE_GAME_GROUPS"
            :key="group.key"
            type="button"
            class="mh5-golive-game-tab"
            :class="{ 'is-active': gameGroup === group.key }"
            @click="gameGroup = group.key"
          >
            {{ group.label }}
          </button>
        </div>
        <div class="mh5-golive-game-grid">
          <button
            v-for="game in games"
            :key="game.id"
            type="button"
            class="mh5-golive-game"
            :class="{ 'is-active': selectedGameId === game.id }"
            @click="pickGame(game.id, game.name)"
          >
            <img :src="game.icon" alt="" />
            <span>{{ game.name }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="sheet === 'ratio'" class="mh5-golive-sheet" aria-label="画面比例">
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('画面比例') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="sheet = null">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="mh5-golive-ratio-tabs">
          <button
            v-for="item in GO_LIVE_RATIOS"
            :key="item.key"
            type="button"
            class="mh5-golive-ratio"
            :class="{ 'is-active': ratio === item.key }"
            @click="ratio = item.key"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="mh5-golive-ratio-preview" :class="`mh5-golive-ratio-preview--${ratio === '16:9' ? 'wide' : ratio === '4:3' ? 'box' : 'tall'}`">
          <span>{{ $t('手机画面') }}</span>
        </div>
        <p class="mh5-golive-ratio-hint">{{ ratioHint }}</p>
      </section>

      <section v-else-if="sheet === 'background'" class="mh5-golive-sheet mh5-golive-sheet--bg" aria-label="房间背景">
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('房间背景') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="sheet = null">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="mh5-golive-bg-list">
          <button
            v-for="item in GO_LIVE_BACKGROUNDS"
            :key="item.id"
            type="button"
            class="mh5-golive-bg"
            :class="{ 'is-active': backgroundId === item.id }"
            @click="pickBackground(item.id)"
          >
            <span class="mh5-golive-bg__frame">
              <img :src="item.image" alt="" />
            </span>
            <span>{{ item.name }}</span>
          </button>
        </div>
        <button type="button" class="mh5-golive-album" @click="showToast('打开相册（原型）')">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" />
            <circle cx="6" cy="7" r="1.2" fill="currentColor" />
            <path d="M4 12l3.2-3.2L10 11l2-2 2 3" stroke="currentColor" stroke-width="1.3" />
          </svg>
          {{ $t('相册') }}
        </button>
      </section>

      <section v-else-if="sheet === 'time'" class="mh5-golive-sheet mh5-golive-sheet--time" aria-label="预计开播时间">
        <div class="mh5-golive-sheet__handle" />
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('预计开播时间') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="closeSheet">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <p class="mh5-golive-time-preview">{{ pickingTimeLabel }}</p>
        <div class="mh5-golive-time-days">
          <button
            v-for="day in dayOptions"
            :key="day.offset"
            type="button"
            class="mh5-golive-chip"
            :class="{ 'is-active': timeDay === day.offset }"
            @click="timeDay = day.offset"
          >
            {{ day.label }}
          </button>
        </div>
        <p class="mh5-golive-time-caption">{{ $t('时') }}</p>
        <div ref="hourRow" class="mh5-golive-time-days">
          <button
            v-for="hour in GO_LIVE_SCHEDULE_HOURS"
            :key="hour"
            type="button"
            class="mh5-golive-chip mh5-golive-chip--num"
            :class="{ 'is-active': timeHour === hour }"
            @click="timeHour = hour"
          >
            {{ pad2(hour) }}
          </button>
        </div>
        <p class="mh5-golive-time-caption">{{ $t('分') }}</p>
        <div class="mh5-golive-time-days">
          <button
            v-for="minute in GO_LIVE_SCHEDULE_MINUTES"
            :key="minute"
            type="button"
            class="mh5-golive-chip mh5-golive-chip--num"
            :class="{ 'is-active': timeMinute === minute }"
            @click="timeMinute = minute"
          >
            {{ pad2(minute) }}
          </button>
        </div>
        <div class="mh5-golive-time-actions">
          <button type="button" class="mh5-golive-ghost" @click="clearTime">{{ $t('清除时间') }}</button>
          <button type="button" class="mh5-golive-cta mh5-golive-cta--inline" @click="confirmTime">{{ $t('确定') }}</button>
        </div>
      </section>

      <section v-else-if="sheet === 'poster' && posterItem" class="mh5-golive-sheet mh5-golive-sheet--poster" aria-label="预告海报">
        <div class="mh5-golive-sheet__handle" />
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('预告海报') }}</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="closeSheet">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <article class="mh5-golive-poster">
          <img :src="posterItem.cover" alt="" />
          <div class="mh5-golive-poster__body">
            <em>{{ formatGoLiveScheduleTime(posterItem.startAt, nowMs) }}</em>
            <strong>{{ posterItem.title }}</strong>
            <span>{{ posterItem.subscriberCount }}{{ $t('人已预约') }} · {{ scheduleMeta(posterItem) }}</span>
          </div>
        </article>
        <button type="button" class="mh5-golive-cta" @click="sendPoster">{{ $t('转发给粉丝') }}</button>
      </section>

      <section v-else-if="sheet === 'schedule'" class="mh5-golive-sheet mh5-golive-sheet--schedule" aria-label="直播预告">
        <div class="mh5-golive-sheet__handle" />
        <header class="mh5-golive-sheet__head">
          <h2>{{ $t('直播预告') }} ({{ activeSchedules.length }}/{{ GO_LIVE_SCHEDULE_MAX }})</h2>
          <button type="button" class="mh5-golive-head__close" aria-label="关闭" @click="closeSheet">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="mh5-golive-sheet__body">
          <p v-if="!activeSchedules.length" class="mh5-golive-schedule-empty">
            {{ $t('暂无有效预告，可新建一场或直接开播') }}
          </p>
          <article
            v-for="item in activeSchedules"
            :key="item.id"
            class="mh5-golive-scard"
            :class="{ 'is-linked': linkedId === item.id }"
          >
            <div class="mh5-golive-scard__top">
              <p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />
                  <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
                {{ formatGoLiveScheduleTime(item.startAt, nowMs) }}
                <em>（{{ item.subscriberCount }}{{ $t('人已预约') }}）</em>
              </p>
              <span v-if="scheduleBadgeMap[item.id]" class="mh5-golive-scard__badge" :class="`is-${scheduleBadgeMap[item.id]?.tone}`">
                {{ scheduleBadgeMap[item.id]?.text }}
              </span>
            </div>
            <strong>{{ item.title }}</strong>
            <span>{{ scheduleMeta(item) }}</span>
            <div class="mh5-golive-scard__actions">
              <button type="button" @click="editSchedule(item)">{{ $t('编辑') }}</button>
              <button type="button" @click="removeSchedule(item)">{{ $t('删除') }}</button>
              <span v-if="linkedId === item.id" class="mh5-golive-scard__current">{{ $t('当前关联') }}</span>
              <button v-else type="button" class="is-switch" @click="switchToSchedule(item)">
                {{ $t('切换以此开播') }}
              </button>
            </div>
          </article>
        </div>
        <div class="mh5-golive-sheet__foot">
          <button
            type="button"
            class="mh5-golive-cta"
            :class="{ 'is-disabled': !canCreateSchedule }"
            @click="startCreateSchedule"
          >
            + {{ $t('新建一场直播预告') }}
          </button>
          <button type="button" class="mh5-golive-ghost mh5-golive-ghost--block" @click="goFreeLive">
            {{ $t('不使用预告，直接开播') }}
          </button>
        </div>
      </section>
    </div>

    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-golive-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>
