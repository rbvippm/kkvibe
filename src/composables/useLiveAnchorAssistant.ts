import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { showPcToast } from './usePcToast'
import {
  ASSISTANT_SELF_ID,
  ASSISTANT_SESSION_LIKES,
  MOCK_ASSISTANT_CHATS,
  PLAY_RESOLUTIONS,
  PUSH_STREAM,
  ONLINE_LIST_PAGE_SIZE,
  RANK_USERS,
  SHARE_LINK,
  formatAssistantMetric,
  type AssistantChatMsg,
  type LiveContentKind,
} from '../constants/liveAnchorAssistant'
import {
  GO_LIVE_BACKGROUNDS,
  GO_LIVE_CATEGORIES,
  GO_LIVE_DEFAULT_CATEGORY,
  GO_LIVE_DEFAULT_COVER,
  GO_LIVE_GAME_GROUPS,
  GO_LIVE_GAMES,
  GO_LIVE_MODE_LABELS,
  GO_LIVE_RATIOS,
  GO_LIVE_SCHEDULE_HOURS,
  GO_LIVE_SCHEDULE_LIMIT_HINT,
  GO_LIVE_SCHEDULE_MAX,
  GO_LIVE_SCHEDULE_MINUTES,
  GO_LIVE_SCREEN_HINT,
  GO_LIVE_TABS,
  cancelGoLiveSchedule,
  combineGoLiveScheduleTime,
  createGoLiveSchedule,
  expireOverdueGoLiveSchedules,
  filterGoLiveGames,
  findGoLiveSchedule,
  formatGoLiveOvertime,
  formatGoLiveScheduleTime,
  fulfillGoLiveSchedule,
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
} from '../constants/goLive'
import { filterVoiceGames, MOCK_VOICE_GAMES, VOICE_GAME_TABS, type VoiceGameTab } from '../constants/mobileVoiceRoom'
import {
  DEFAULT_HEAT_PREVIEW,
  liveAnchorGlobalConfig,
  previewHeat,
} from '../constants/liveAnchorMetric'

export type AssistantModal =
  | ''
  | 'guide'
  | 'basic'
  | 'previewNotice'
  | 'liveType'
  | 'pushUrl'
  | 'share'
  | 'startConfirm'
  | 'stopConfirm'
  | 'pushCheckFail'
  | 'scheduleTime'
  | 'beauty'
  | 'background'
  | 'ratio'
  | 'mountGame'
  | 'gameCenter'
  | 'deleteSchedule'

export const ASSISTANT_MODAL_TITLES: Record<Exclude<AssistantModal, ''>, string> = {
  guide: '开播流程说明',
  basic: '基本信息',
  previewNotice: '直播预告',
  liveType: '开播设置',
  pushUrl: '推流地址',
  share: '分享',
  startConfirm: '开始直播',
  stopConfirm: '结束直播',
  pushCheckFail: '无法开始直播',
  scheduleTime: '新建直播预告',
  beauty: '美颜',
  background: '房间背景',
  ratio: '画面比例',
  mountGame: '挂载游戏',
  gameCenter: '游戏中心',
  deleteSchedule: '删除直播预告',
}

export function useLiveAnchorAssistant() {
  const titles = ref<Record<string, string>>({
    cn: 'Lkpkupq与您一起探索直播的奇妙世界！',
  })
  const roomTitle = computed({
    get: () => titles.value.cn ?? '',
    set: (v) => {
      titles.value = { ...titles.value, cn: v }
    },
  })
  const categoryTag = ref('手游')
  const currentTypeLabel = ref('真人-MT真人')

  const live = ref(false)
  const liveSeconds = ref(0)
  let liveTimer: number | null = null
  let tickTimer: number | null = null
  let streamTimer: number | null = null
  let ingestTimer: number | null = null
  const streamPhase = ref<'idle' | 'connecting' | 'live' | 'reconnecting'>('idle')
  const STREAM_CONNECT_MS = 2400
  const STREAM_RECONNECT_MS = 2800
  const PUSH_INGEST_DETECT_MS = 2800
  const PUSH_INGEST_CHECK_MS = 420
  const muted = ref(true)
  const volume = ref(100)
  const typeConfigured = ref(false)
  const pushConfirmed = ref(false)
  const pushIngestReady = ref(false)
  const pushChecking = ref(false)
  const pushStream = ref<{ server: string; key: string } | null>(null)
  let pushLineSeq = 0
  const actionHint = ref('')

  const liveMode = ref<GoLiveTab>('video')
  const kkCategory = ref<(typeof GO_LIVE_CATEGORIES)[number]>(GO_LIVE_DEFAULT_CATEGORY)
  const ratio = ref<GoLiveRatio>('original')
  const gameGroup = ref<GoLiveGameGroup>('cash')
  const selectedGameId = ref('')
  const backgroundId = ref<string>(GO_LIVE_BACKGROUNDS[0].id)
  const backgroundDraftId = ref<string>(GO_LIVE_BACKGROUNDS[0].id)
  const cover = ref(GO_LIVE_DEFAULT_COVER)
  const linkedId = ref<string | null>(null)
  const draftTime = ref<number | null>(null)
  const nowMs = ref(Date.now())
  const timeDay = ref(0)
  const timeHour = ref(20)
  const timeMinute = ref(0)
  const applyingSchedule = ref(false)
  const creatingSchedule = ref(false)
  const restoreLinkedId = ref<string | null>(null)
  const deleteTarget = ref<GoLiveSchedule | null>(null)
  const editingId = ref<string | null>(null)
  const editTitle = ref('')
  const editCategory = ref<(typeof GO_LIVE_CATEGORIES)[number]>(GO_LIVE_DEFAULT_CATEGORY)

  const beautyOn = ref(false)
  const beautyItem = ref<'level' | 'style' | 'white' | 'contrast'>('level')
  const beautyLevel = ref(0)
  const beautyWhite = ref(0)
  const beautyStyle = ref<GoLiveBeautyStyle>('女士')
  const beautyContrast = ref<GoLiveContrast>('正常')

  const online = computed(() => RANK_USERS.filter((user) => user.online).length)
  const sessionLikes = computed(() => ASSISTANT_SESSION_LIKES)
  const durationText = computed(() => {
    const total = live.value ? liveSeconds.value : 0
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const modal = ref<AssistantModal>('')

  const liveCategory = ref('游戏')
  const liveTag = ref('')
  const contentKind = ref<LiveContentKind>('game')
  const selectedGame = ref('MT真人')
  const selectedMatch = ref('勇士 vs 湖人')
  const orientation = ref<'portrait' | 'landscape'>('portrait')
  const resolutionIndex = ref(0)
  const customW = ref(828)
  const customH = ref(1792)
  const formError = ref('')
  const listKeyword = ref('')
  const gameTab = ref<VoiceGameTab>('hot')
  const commentingGameId = ref('')
  const goLiveGameId = ref('')
  const gameCenterMode = ref<'comment' | 'pick'>('comment')
  const toolboxCollapsed = ref(true)
  const toolboxNarrow = ref(true)
  const toolboxTouched = ref(false)
  const TOOLBOX_WIDE_MIN = 1100
  let toolboxRo: ResizeObserver | null = null
  const chatDraft = ref('')
  const chatMessages = ref<AssistantChatMsg[]>([...MOCK_ASSISTANT_CHATS])
  const sessionHeat = computed(() =>
    Math.round(
      previewHeat(liveAnchorGlobalConfig.value, {
        people: online.value,
        danmaku: chatMessages.value.length,
        gift: DEFAULT_HEAT_PREVIEW.gift,
        like: sessionLikes.value,
      }),
    ),
  )

  const centerGames = computed(() => filterVoiceGames(gameTab.value))
  const selectedGoLiveGame = computed(
    () => MOCK_VOICE_GAMES.find((item) => item.id === goLiveGameId.value) ?? null,
  )
  const needsPush = computed(() => liveMode.value !== 'voice')
  const mountGames = computed(() => filterGoLiveGames(gameGroup.value))
  const selectedMountGame = computed(
    () => GO_LIVE_GAMES.find((item) => item.id === selectedGameId.value) ?? null,
  )
  const selectedBackground = computed(
    () => GO_LIVE_BACKGROUNDS.find((item) => item.id === backgroundId.value) ?? GO_LIVE_BACKGROUNDS[0],
  )
  const ratioHint = computed(() => goLiveRatioHint(ratio.value))
  const activeSchedules = computed(() => listActiveGoLiveSchedules(nowMs.value))
  const linkedSchedule = computed(
    () => activeSchedules.value.find((item) => item.id === linkedId.value) ?? null,
  )
  const nearestSchedule = computed(() => nearestPendingGoLiveSchedule(nowMs.value))
  const canCreateSchedule = computed(() => activeSchedules.value.length < GO_LIVE_SCHEDULE_MAX)
  const hasUnpublishedDraft = computed(() => Boolean(draftTime.value && !linkedSchedule.value))
  const unpublishedMeta = computed(
    () => `${kkCategory.value} | ${GO_LIVE_MODE_LABELS[liveMode.value]}`,
  )
  const linkBarTime = computed(() => {
    if (!linkedSchedule.value) return ''
    return formatGoLiveScheduleTime(linkedSchedule.value.startAt, nowMs.value)
  })
  const pickingTimeLabel = computed(() =>
    formatGoLiveScheduleTime(
      combineGoLiveScheduleTime(timeDay.value, timeHour.value, timeMinute.value, nowMs.value),
      nowMs.value,
    ),
  )
  const dayOptions = computed(() => goLiveScheduleDayOptions(nowMs.value))
  const ctaLabel = computed(() => {
    if (linkedSchedule.value) return '立即开播'
    if (draftTime.value) return '发布直播预告'
    if (liveMode.value === 'voice') return '创建房间'
    return '开始直播'
  })
  const previewStateLabel = computed(() => {
    if (streamPhase.value === 'connecting') return '连接中'
    if (streamPhase.value === 'reconnecting') return '重连中'
    if (!live.value) return '暂未直播'
    if (liveMode.value === 'voice') return '语聊中'
    if (liveMode.value === 'screen') return '投屏中'
    return '直播中'
  })
  const isStreamSignal = computed(
    () => streamPhase.value === 'connecting' || streamPhase.value === 'reconnecting',
  )
  const liveModeLabel = computed(
    () => GO_LIVE_TABS.find((item) => item.key === liveMode.value)?.label ?? '视频',
  )
  const previewHudDetail = computed(() => {
    const parts = [currentTypeLabel.value]
    if (liveMode.value !== 'voice') {
      parts.push(orientation.value === 'landscape' ? '横屏' : '竖屏')
      parts.push(`${previewSize.value.w}×${previewSize.value.h}`)
    }
    return parts.filter(Boolean).join(' · ')
  })
  const startConfirmLead = computed(() => {
    if (linkedSchedule.value) return `确认立即开播「${linkedSchedule.value.title}」？`
    if (liveMode.value === 'voice') return '确认创建语聊房间？'
    if (liveMode.value === 'screen') return '确认开始手机画面直播？'
    return '确认推流已成功并开始直播？'
  })
  const startConfirmHint = computed(() => {
    if (linkedSchedule.value) {
      return `将向 ${linkedSchedule.value.subscriberCount} 位预约粉丝推送开播通知。`
    }
    if (liveMode.value === 'voice') return '创建后观众可进入本房间。'
    if (liveMode.value === 'screen') return '观众将实时看到投屏画面。'
    return '开始后观众可见本房间。'
  })
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
  const beautySliderValue = computed(() => {
    if (beautyItem.value === 'white') return beautyWhite.value
    if (beautyItem.value === 'contrast') return contrastToSlider(beautyContrast.value)
    if (beautyItem.value === 'style') return beautyStyle.value === '男士' ? 100 : 0
    return beautyLevel.value
  })
  const beautySliderLabel = computed(() => {
    if (beautyItem.value === 'style') return beautyStyle.value
    if (beautyItem.value === 'contrast') return beautyContrast.value
    if (beautyItem.value === 'white') return String(beautyWhite.value)
    return String(beautyLevel.value)
  })

  const listPage = ref(1)

  const giftTotal = computed(() =>
    RANK_USERS.filter((user) => user.online).reduce((sum, user) => sum + user.giftAmount, 0),
  )

  const onlineUsers = computed(() => {
    const kw = listKeyword.value.trim().toLowerCase()
    return RANK_USERS.filter((u) => u.online)
      .filter(
        (u) =>
          !kw ||
          u.nickname.toLowerCase().includes(kw) ||
          u.kingkongId.toLowerCase().includes(kw),
      )
      .slice()
      .sort((a, b) => b.giftAmount - a.giftAmount)
  })

  const onlinePageCount = computed(() =>
    Math.max(1, Math.ceil(onlineUsers.value.length / ONLINE_LIST_PAGE_SIZE)),
  )

  const currentOnlinePage = computed(() =>
    Math.min(onlinePageCount.value, Math.max(1, listPage.value)),
  )

  const pagedOnlineUsers = computed(() => {
    const start = (currentOnlinePage.value - 1) * ONLINE_LIST_PAGE_SIZE
    return onlineUsers.value.slice(start, start + ONLINE_LIST_PAGE_SIZE)
  })

  watch(listKeyword, () => {
    listPage.value = 1
  })

  watch(onlinePageCount, (pages) => {
    if (listPage.value > pages) listPage.value = pages
  })

  function setOnlinePage(next: number) {
    const page = Math.min(onlinePageCount.value, Math.max(1, next))
    listPage.value = page
  }

  function onlineListRank(index: number) {
    return (currentOnlinePage.value - 1) * ONLINE_LIST_PAGE_SIZE + index + 1
  }

  function orientedResolution(item: (typeof PLAY_RESOLUTIONS)[number]) {
    const landscape = orientation.value === 'landscape'
    if (item.label === '自定义') {
      return { label: '自定义', w: customW.value, h: customH.value }
    }
    const w = landscape ? item.h : item.w
    const h = landscape ? item.w : item.h
    const suffix = item.label.includes('(') ? item.label.slice(item.label.indexOf('(')) : ''
    return { label: `${w}x${h}${suffix ? ` ${suffix}` : ''}`, w, h }
  }

  const resolutionOptions = computed(() => PLAY_RESOLUTIONS.map((item) => orientedResolution(item)))
  const currentRes = computed(
    () => resolutionOptions.value[resolutionIndex.value] ?? resolutionOptions.value[0],
  )

  function setOrientation(next: 'portrait' | 'landscape') {
    if (orientation.value === next) return
    const preset = PLAY_RESOLUTIONS[resolutionIndex.value]
    if (preset?.label === '自定义') {
      const nextW = customH.value
      customH.value = customW.value
      customW.value = nextW
    }
    orientation.value = next
  }
  const previewSize = computed(() => {
    if (liveMode.value === 'voice') return { w: 9, h: 16 }
    const preset = currentRes.value ?? PLAY_RESOLUTIONS[0]
    const rawW = preset.label === '自定义' ? customW.value : preset.w
    const rawH = preset.label === '自定义' ? customH.value : preset.h
    const w = Math.max(1, Number(rawW) || 1)
    const h = Math.max(1, Number(rawH) || 1)
    const landscape = orientation.value === 'landscape'
    const portrait = w <= h
    return {
      w: landscape ? (portrait ? h : w) : portrait ? w : h,
      h: landscape ? (portrait ? w : h) : portrait ? h : w,
    }
  })
  const previewFrameStyle = computed(() => ({
    '--lal-preview-w': String(previewSize.value.w),
    '--lal-preview-h': String(previewSize.value.h),
  }))

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

  function toast(text: string) {
    actionHint.value = text
    window.setTimeout(() => {
      if (actionHint.value === text) actionHint.value = ''
    }, 2800)
  }

  function openModal(name: AssistantModal) {
    formError.value = ''
    modal.value = name
  }

  function closeModal() {
    if (modal.value === 'gameCenter' && gameCenterMode.value === 'pick') {
      gameCenterMode.value = 'comment'
      modal.value = 'liveType'
      formError.value = ''
      return
    }
    if (modal.value === 'background') {
      backgroundDraftId.value = backgroundId.value
      modal.value = 'liveType'
      formError.value = ''
      return
    }
    if (modal.value === 'scheduleTime') {
      const backToList = creatingSchedule.value
      creatingSchedule.value = false
      if (!draftTime.value && restoreLinkedId.value) {
        const previous = findGoLiveSchedule(restoreLinkedId.value)
        restoreLinkedId.value = null
        if (previous && previous.status === 'pending') applySchedule(previous)
      }
      modal.value = backToList ? 'previewNotice' : ''
      formError.value = ''
      return
    }
    if (modal.value === 'previewNotice' || modal.value === 'deleteSchedule') {
      editingId.value = null
    }
    if (modal.value === 'deleteSchedule') deleteTarget.value = null
    modal.value = ''
    formError.value = ''
  }

  function saveBasic() {
    const title = roomTitle.value.trim()
    if (!title) {
      formError.value = '请填写直播标题'
      return
    }
    if (title.length > 200) {
      formError.value = '标题最多 200 字'
      return
    }
    titles.value = { ...titles.value, cn: title }
    toast('基本信息已保存')
    closeModal()
  }

  function openSettings() {
    openModal('liveType')
  }

  function saveLiveType() {
    if (!liveCategory.value) {
      formError.value = '请选择直播分类'
      return
    }
    if (liveMode.value !== 'voice' && currentRes.value.label === '自定义') {
      if (customW.value < 1 || customH.value < 1) {
        formError.value = '请填写有效分辨率'
        return
      }
    }
    typeConfigured.value = true
    currentTypeLabel.value = liveCategory.value
    categoryTag.value = liveCategory.value === '游戏' ? '手游' : liveCategory.value
    if (!needsPush.value) {
      pushConfirmed.value = true
      closeModal()
      toast('语聊房间配置已保存，可直接创建房间')
      return
    }
    openPushUrl()
  }

  function allocatePushStream() {
    if (pushStream.value) return pushStream.value
    pushLineSeq += 1
    pushStream.value = {
      server: PUSH_STREAM.server,
      key: `stream_anchoruat01_${8829102 + pushLineSeq}`,
    }
    return pushStream.value
  }

  function openPushUrl() {
    allocatePushStream()
    openModal('pushUrl')
  }

  function releasePushStream() {
    pushStream.value = null
    pushConfirmed.value = false
    pushIngestReady.value = false
    clearIngestTimer()
  }

  function clearIngestTimer() {
    if (ingestTimer) {
      window.clearTimeout(ingestTimer)
      ingestTimer = null
    }
  }

  function beginPushIngestDetect() {
    clearIngestTimer()
    pushIngestReady.value = false
    ingestTimer = window.setTimeout(() => {
      pushIngestReady.value = true
      ingestTimer = null
      showPcToast('已检测到推流，可以开始直播')
    }, PUSH_INGEST_DETECT_MS)
  }

  function checkPushIngestFromServer() {
    return new Promise<boolean>((resolve) => {
      window.setTimeout(() => {
        resolve(pushIngestReady.value)
      }, PUSH_INGEST_CHECK_MS)
    })
  }

  function confirmPush() {
    pushConfirmed.value = true
    if (pushIngestReady.value) {
      showPcToast('仍使用本场推流地址')
      closeModal()
      return
    }
    beginPushIngestDetect()
    showPcToast('推流地址已确认，服务端正在检测是否推流成功')
    closeModal()
  }

  function applySchedule(item: GoLiveSchedule) {
    applyingSchedule.value = true
    linkedId.value = item.id
    titles.value = { ...titles.value, cn: item.title }
    cover.value = item.cover
    kkCategory.value = (GO_LIVE_CATEGORIES as readonly string[]).includes(item.category)
      ? (item.category as (typeof GO_LIVE_CATEGORIES)[number])
      : GO_LIVE_DEFAULT_CATEGORY
    liveMode.value = item.mode
    draftTime.value = item.startAt
    categoryTag.value = item.category
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
      showPcToast(`「${expired[0].title}」已超时失效，已通知预约粉丝`)
    }
    if (linkedId.value && !linkedSchedule.value) {
      const next = nearestPendingGoLiveSchedule(nowMs.value)
      if (next) applySchedule(next)
      else unlinkSchedule()
    }
  }

  function openScheduleSheet() {
    tickSchedules()
    openModal('previewNotice')
  }

  function openTimeSheet() {
    const source = draftTime.value ?? suggestGoLiveScheduleTime(nowMs.value)
    const parts = splitGoLiveScheduleTime(source, nowMs.value)
    timeDay.value = parts.offset
    timeHour.value = parts.hour
    timeMinute.value = parts.minute
    openModal('scheduleTime')
  }

  function confirmTime() {
    const ts = combineGoLiveScheduleTime(timeDay.value, timeHour.value, timeMinute.value, nowMs.value)
    const error = validateGoLiveScheduleTime(ts, linkedId.value, nowMs.value)
    if (error) {
      formError.value = error
      return
    }
    const creating = creatingSchedule.value
    draftTime.value = ts
    if (linkedSchedule.value) {
      linkedSchedule.value.startAt = ts
      restoreLinkedId.value = null
      creatingSchedule.value = false
      modal.value = ''
      formError.value = ''
      showPcToast('预计开播时间已更新')
      return
    }
    creatingSchedule.value = false
    formError.value = ''
    if (creating) {
      openModal('previewNotice')
      showPcToast('已保存，请点击发布')
      return
    }
    modal.value = ''
    showPcToast('已保存，请点击发布')
  }

  function clearTime() {
    const backToList = creatingSchedule.value
    creatingSchedule.value = false
    restoreLinkedId.value = null
    unlinkSchedule()
    modal.value = backToList ? 'previewNotice' : ''
    formError.value = ''
    showPcToast('已清除开播时间，将直接开播')
  }

  function switchToSchedule(item: GoLiveSchedule) {
    applySchedule(item)
    closeModal()
    showPcToast('已切换为该场预告')
  }

  function fillEditTime(ts: number) {
    const parts = splitGoLiveScheduleTime(ts, nowMs.value)
    timeDay.value = parts.offset
    timeHour.value = parts.hour
    timeMinute.value = parts.minute
  }

  function startScheduleEdit(item: GoLiveSchedule | 'draft') {
    formError.value = ''
    if (item === 'draft') {
      if (!draftTime.value) return
      editingId.value = 'draft'
      editTitle.value = roomTitle.value
      editCategory.value = kkCategory.value
      fillEditTime(draftTime.value)
      return
    }
    editingId.value = item.id
    editTitle.value = item.title
    editCategory.value = (GO_LIVE_CATEGORIES as readonly string[]).includes(item.category)
      ? (item.category as (typeof GO_LIVE_CATEGORIES)[number])
      : GO_LIVE_DEFAULT_CATEGORY
    fillEditTime(item.startAt)
  }

  function cancelScheduleEdit() {
    editingId.value = null
    formError.value = ''
  }

  function saveScheduleEdit() {
    const title = editTitle.value.trim()
    if (!title) {
      formError.value = '请填写直播标题'
      return
    }
    const ts = combineGoLiveScheduleTime(timeDay.value, timeHour.value, timeMinute.value, nowMs.value)
    const excludeId = editingId.value === 'draft' ? null : editingId.value
    const error = validateGoLiveScheduleTime(ts, excludeId, nowMs.value)
    if (error) {
      formError.value = error
      return
    }
    if (editingId.value === 'draft') {
      roomTitle.value = title
      kkCategory.value = editCategory.value
      draftTime.value = ts
      editingId.value = null
      formError.value = ''
      showPcToast('已保存，请点击发布')
      return
    }
    const item = findGoLiveSchedule(editingId.value)
    if (!item) {
      editingId.value = null
      return
    }
    item.title = title
    item.category = editCategory.value
    item.startAt = ts
    if (linkedId.value === item.id) {
      applyingSchedule.value = true
      titles.value = { ...titles.value, cn: title }
      kkCategory.value = editCategory.value
      draftTime.value = ts
      void nextTick(() => {
        applyingSchedule.value = false
      })
    }
    editingId.value = null
    formError.value = ''
    showPcToast('预告已更新')
  }

  function askDeleteSchedule(item: GoLiveSchedule) {
    cancelScheduleEdit()
    deleteTarget.value = item
    openModal('deleteSchedule')
  }

  function confirmDeleteSchedule() {
    const item = deleteTarget.value
    if (!item) return
    cancelGoLiveSchedule(item.id)
    if (linkedId.value === item.id) {
      const next = nearestPendingGoLiveSchedule()
      if (next) applySchedule(next)
      else unlinkSchedule()
    }
    deleteTarget.value = null
    tickSchedules()
    openModal('previewNotice')
    showPcToast('预告已删除，已通知预约粉丝（原型）')
  }

  function cancelDeleteSchedule() {
    deleteTarget.value = null
    openModal('previewNotice')
  }

  function startCreateSchedule() {
    cancelScheduleEdit()
    if (hasUnpublishedDraft.value) {
      creatingSchedule.value = true
      openTimeSheet()
      return
    }
    if (!canCreateSchedule.value) {
      showPcToast(GO_LIVE_SCHEDULE_LIMIT_HINT)
      return
    }
    creatingSchedule.value = true
    restoreLinkedId.value = linkedId.value
    linkedId.value = null
    draftTime.value = null
    titles.value = { ...titles.value, cn: goLiveTitleForTab(liveMode.value) }
    kkCategory.value = GO_LIVE_DEFAULT_CATEGORY
    openTimeSheet()
  }

  function discardUnpublishedDraft() {
    cancelScheduleEdit()
    draftTime.value = null
    creatingSchedule.value = false
    if (restoreLinkedId.value) {
      const previous = findGoLiveSchedule(restoreLinkedId.value)
      restoreLinkedId.value = null
      if (previous && previous.status === 'pending') applySchedule(previous)
    }
    showPcToast('已取消未发布预告')
  }

  function goFreeLive() {
    creatingSchedule.value = false
    restoreLinkedId.value = null
    unlinkSchedule()
    closeModal()
    tryStartLive()
  }

  function publishSchedule() {
    if (!draftTime.value) {
      showPcToast('请先选择预计开播时间')
      openTimeSheet()
      return false
    }
    const result = createGoLiveSchedule({
      title: roomTitle.value,
      cover: cover.value,
      category: kkCategory.value,
      mode: liveMode.value,
      startAt: draftTime.value,
    })
    if (result.error || !result.item) {
      const msg = result.error || GO_LIVE_SCHEDULE_LIMIT_HINT
      formError.value = msg
      showPcToast(msg)
      return false
    }
    restoreLinkedId.value = null
    applySchedule(result.item)
    showPcToast('预告已发布，粉丝可预约本场直播')
    return true
  }

  function ensureReadyToGoLive() {
    if (!typeConfigured.value) {
      toast('请先完成开播设置')
      openModal('liveType')
      return false
    }
    if (needsPush.value && !pushConfirmed.value) {
      toast('请先获取并确认推流地址')
      openPushUrl()
      return false
    }
    if (live.value) {
      toast('已在直播中')
      return false
    }
    return true
  }

  async function tryStartLive() {
    if (draftTime.value && !linkedSchedule.value) {
      publishSchedule()
      return
    }
    if (!ensureReadyToGoLive()) return
    if (needsPush.value) {
      if (pushChecking.value) return
      pushChecking.value = true
      const ready = await checkPushIngestFromServer()
      pushChecking.value = false
      if (!ready) {
        openModal('pushCheckFail')
        return
      }
    }
    openModal('startConfirm')
  }

  async function retryPushCheck() {
    if (pushChecking.value) return
    pushChecking.value = true
    const ready = await checkPushIngestFromServer()
    pushChecking.value = false
    if (!ready) {
      showPcToast('仍未检测到推流，请确认 OBS 已开始推流')
      return
    }
    openModal('startConfirm')
  }

  function clearStreamTimer() {
    if (streamTimer) {
      window.clearTimeout(streamTimer)
      streamTimer = null
    }
  }

  function playStreamPhase(next: 'connecting' | 'reconnecting', duration: number) {
    clearStreamTimer()
    streamPhase.value = next
    streamTimer = window.setTimeout(() => {
      streamPhase.value = 'live'
      streamTimer = null
    }, duration)
  }

  function beginLive(message: string) {
    live.value = true
    liveSeconds.value = 0
    if (liveTimer) window.clearInterval(liveTimer)
    liveTimer = window.setInterval(() => {
      liveSeconds.value += 1
    }, 1000)
    if (liveMode.value === 'voice') {
      clearStreamTimer()
      streamPhase.value = 'idle'
    } else {
      playStreamPhase('connecting', STREAM_CONNECT_MS)
    }
    closeModal()
    toast(message)
  }

  function startLive() {
    if (needsPush.value && !pushIngestReady.value) {
      openModal('pushCheckFail')
      return
    }
    if (linkedSchedule.value) {
      const schedule = linkedSchedule.value
      const count = schedule.subscriberCount
      fulfillGoLiveSchedule(schedule.id)
      unlinkSchedule()
      tickSchedules()
      beginLive(`已向 ${count} 位预约粉丝推送开播通知`)
      return
    }
    if (liveMode.value === 'voice') {
      beginLive('已创建语聊房间')
      return
    }
    if (liveMode.value === 'screen') {
      beginLive('已开始投屏直播')
      return
    }
    beginLive('已开始直播')
  }

  function tryStopLive() {
    if (!live.value) {
      toast('当前未在直播')
      return
    }
    openModal('stopConfirm')
  }

  function stopLive() {
    live.value = false
    liveSeconds.value = 0
    if (liveTimer) {
      window.clearInterval(liveTimer)
      liveTimer = null
    }
    clearStreamTimer()
    streamPhase.value = 'idle'
    releasePushStream()
    closeModal()
    toast('已结束直播')
  }

  function refreshPreview() {
    if (live.value && liveMode.value !== 'voice') {
      playStreamPhase('reconnecting', STREAM_RECONNECT_MS)
      return
    }
    toast('画面已刷新')
  }

  function applyToolboxWidth(width: number) {
    const narrow = width < TOOLBOX_WIDE_MIN
    if (narrow !== toolboxNarrow.value) {
      toolboxNarrow.value = narrow
      toolboxCollapsed.value = narrow
      toolboxTouched.value = false
      return
    }
    if (!toolboxTouched.value) toolboxCollapsed.value = narrow
  }

  function bindToolboxShell(el: unknown) {
    toolboxRo?.disconnect()
    toolboxRo = null
    const node = el instanceof HTMLElement ? el : null
    if (!node || typeof ResizeObserver === 'undefined') return
    toolboxRo = new ResizeObserver((entries) => {
      applyToolboxWidth(entries[0]?.contentRect.width ?? 0)
    })
    toolboxRo.observe(node)
    applyToolboxWidth(node.getBoundingClientRect().width)
  }

  function toggleToolbox() {
    toolboxCollapsed.value = !toolboxCollapsed.value
    toolboxTouched.value = true
  }

  function openGameCenter() {
    gameCenterMode.value = 'comment'
    openModal('gameCenter')
  }

  function openGoLiveGamePicker() {
    gameCenterMode.value = 'pick'
    openModal('gameCenter')
  }

  function pickGoLiveGame(id: string, name: string) {
    goLiveGameId.value = id
    showPcToast(`已选择「${name}」`)
    gameCenterMode.value = 'comment'
    openModal('liveType')
  }

  function toggleCommentGame(id: string, name: string) {
    if (commentingGameId.value === id) {
      commentingGameId.value = ''
      showPcToast(`已取消讲解「${name}」`)
      return
    }
    commentingGameId.value = id
    showPcToast(`开始讲解「${name}」`)
  }

  function sendChat() {
    const text = chatDraft.value.trim()
    if (!text) return
    chatMessages.value = [
      ...chatMessages.value,
      { id: `c-${Date.now()}`, nickname: '我', userId: ASSISTANT_SELF_ID, role: 'host', text, kind: 'chat' },
    ]
    chatDraft.value = ''
  }

  function insertChatEmoji(emoji: string) {
    if (!emoji) return
    const next = `${chatDraft.value}${emoji}`
    chatDraft.value = next.slice(0, 80)
  }

  async function copyText(text: string, label = '链接') {
    const fallbackCopy = () => {
      const input = document.createElement('textarea')
      input.value = text
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(input)
      if (!ok) throw new Error('copy failed')
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy()
      }
      showPcToast(`已复制${label}`)
    } catch {
      try {
        fallbackCopy()
        showPcToast(`已复制${label}`)
      } catch {
        showPcToast('复制失败，请手动复制', 'error')
      }
    }
  }

  function switchLiveMode(next: GoLiveTab) {
    liveMode.value = next
  }

  function pickMountGame(id: string, name: string) {
    selectedGameId.value = id
    closeModal()
    toast(`已挂载「${name}」`)
  }

  function openBackground() {
    backgroundDraftId.value = backgroundId.value
    openModal('background')
  }

  function pickBackground(id: string) {
    backgroundDraftId.value = id
  }

  function onBeautySlider(event: Event) {
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

  function resetBeauty() {
    beautyOn.value = false
    beautyItem.value = 'level'
    beautyLevel.value = 0
    beautyWhite.value = 0
    beautyStyle.value = '女士'
    beautyContrast.value = '正常'
  }

  function pickBeautyItem(item: typeof beautyItem.value) {
    beautyItem.value = item
    if (item === 'style') {
      beautyOn.value = true
      beautyStyle.value = beautyStyle.value === '女士' ? '男士' : '女士'
    }
  }

  function saveBeauty() {
    toast(beautyOn.value ? `美颜已开启（级别 ${beautyLevel.value}）` : '美颜已关闭')
    closeModal()
  }

  function saveBackground() {
    backgroundId.value = backgroundDraftId.value
    toast(`已选择房间背景「${selectedBackground.value.name}」`)
    closeModal()
  }

  function saveRatio() {
    toast(`画面比例已设为 ${ratio.value === 'original' ? '原始' : ratio.value}`)
    closeModal()
  }

  function openMultiPhone() {
    toast('已开启多手机直播（原型），可同时接入多路手机画面')
  }

  function scheduleMeta(item: GoLiveSchedule) {
    return `${item.category} | ${GO_LIVE_MODE_LABELS[item.mode]}`
  }

  function scheduleCoverOf(item: GoLiveSchedule) {
    if (linkedId.value === item.id) return cover.value
    return item.cover
  }

  function changeCover() {
    cover.value = nextGoLiveCover(cover.value)
    showPcToast('封面已更新')
  }

  function changeScheduleCover(item: GoLiveSchedule) {
    const next = nextGoLiveCover(scheduleCoverOf(item))
    item.cover = next
    if (linkedId.value === item.id) {
      applyingSchedule.value = true
      cover.value = next
      void nextTick(() => {
        applyingSchedule.value = false
      })
    }
    showPcToast('本场封面已更新')
  }

  watch([roomTitle, kkCategory, liveMode, cover], () => {
    if (applyingSchedule.value) return
    const item = linkedSchedule.value
    if (!item) return
    item.title = roomTitle.value
    item.category = kkCategory.value
    item.mode = liveMode.value
    item.cover = cover.value
  })

  onMounted(() => {
    tickSchedules()
    const nearest = nearestPendingGoLiveSchedule(nowMs.value)
    if (nearest) applySchedule(nearest)
    tickTimer = window.setInterval(tickSchedules, 30_000)
  })

  onUnmounted(() => {
    if (tickTimer) window.clearInterval(tickTimer)
    if (liveTimer) window.clearInterval(liveTimer)
    clearStreamTimer()
    clearIngestTimer()
    toolboxRo?.disconnect()
    toolboxRo = null
  })

  return {
    titles,
    roomTitle,
    categoryTag,
    currentTypeLabel,
    live,
    muted,
    volume,
    typeConfigured,
    pushConfirmed,
    pushIngestReady,
    pushChecking,
    actionHint,
    online,
    sessionLikes,
    sessionHeat,
    formatAssistantMetric,
    durationText,
    modal,
    liveCategory,
    liveTag,
    contentKind,
    selectedGame,
    selectedMatch,
    orientation,
    setOrientation,
    resolutionOptions,
    resolutionIndex,
    customW,
    customH,
    formError,
    listKeyword,
    giftTotal,
    toolboxCollapsed,
    gameTab,
    commentingGameId,
    goLiveGameId,
    gameCenterMode,
    selectedGoLiveGame,
    centerGames,
    chatDraft,
    chatMessages,
    VOICE_GAME_TABS,
    onlineUsers,
    pagedOnlineUsers,
    listPage: currentOnlinePage,
    onlinePageCount,
    setOnlinePage,
    onlineListRank,
    currentRes,
    previewFrameStyle,
    PUSH_STREAM,
    pushStream,
    SHARE_LINK,
    liveMode,
    kkCategory,
    ratio,
    gameGroup,
    selectedGameId,
    backgroundId,
    backgroundDraftId,
    cover,
    linkedId,
    draftTime,
    timeDay,
    timeHour,
    timeMinute,
    beautyOn,
    beautyItem,
    beautyLevel,
    beautyWhite,
    beautyStyle,
    beautyContrast,
    beautySliderValue,
    beautySliderLabel,
    needsPush,
    mountGames,
    selectedMountGame,
    selectedBackground,
    ratioHint,
    activeSchedules,
    linkedSchedule,
    canCreateSchedule,
    hasUnpublishedDraft,
    unpublishedMeta,
    linkBarTime,
    pickingTimeLabel,
    dayOptions,
    ctaLabel,
    previewStateLabel,
    isStreamSignal,
    streamPhase,
    liveModeLabel,
    previewHudDetail,
    startConfirmLead,
    startConfirmHint,
    scheduleBadgeMap,
    deleteTarget,
    editingId,
    editTitle,
    editCategory,
    GO_LIVE_TABS,
    GO_LIVE_CATEGORIES,
    GO_LIVE_RATIOS,
    GO_LIVE_GAME_GROUPS,
    GO_LIVE_BACKGROUNDS,
    GO_LIVE_SCHEDULE_HOURS,
    GO_LIVE_SCHEDULE_MINUTES,
    GO_LIVE_SCREEN_HINT,
    toast,
    openModal,
    closeModal,
    saveBasic,
    openSettings,
    saveLiveType,
    confirmPush,
    openPushUrl,
    tryStartLive,
    retryPushCheck,
    startLive,
    tryStopLive,
    stopLive,
    refreshPreview,
    copyText,
    switchLiveMode,
    bindToolboxShell,
    toggleToolbox,
    openGameCenter,
    openGoLiveGamePicker,
    pickGoLiveGame,
    toggleCommentGame,
    sendChat,
    insertChatEmoji,
    openScheduleSheet,
    openTimeSheet,
    confirmTime,
    clearTime,
    switchToSchedule,
    startScheduleEdit,
    cancelScheduleEdit,
    saveScheduleEdit,
    askDeleteSchedule,
    confirmDeleteSchedule,
    cancelDeleteSchedule,
    startCreateSchedule,
    discardUnpublishedDraft,
    publishSchedule,
    goFreeLive,
    pickMountGame,
    openBackground,
    pickBackground,
    onBeautySlider,
    resetBeauty,
    pickBeautyItem,
    saveBeauty,
    saveBackground,
    saveRatio,
    openMultiPhone,
    scheduleMeta,
    scheduleCoverOf,
    changeCover,
    changeScheduleCover,
    formatGoLiveScheduleTime,
    nowMs,
  }
}
