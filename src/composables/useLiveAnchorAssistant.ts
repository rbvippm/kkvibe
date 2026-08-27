import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { PLAY_RESOLUTIONS, PUSH_STREAM, RANK_USERS, SHARE_LINK, type LiveContentKind } from '../constants/liveAnchorAssistant'
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
  | 'scheduleTime'
  | 'beauty'
  | 'background'
  | 'ratio'
  | 'mountGame'
  | 'deleteSchedule'

export const ASSISTANT_MODAL_TITLES: Record<Exclude<AssistantModal, ''>, string> = {
  guide: '开播流程说明',
  basic: '基本信息',
  previewNotice: '直播预告',
  liveType: '直播类型',
  pushUrl: '推流地址',
  share: '分享',
  startConfirm: '开始直播',
  stopConfirm: '强制关播',
  scheduleTime: '预计开播时间',
  beauty: '美颜',
  background: '房间背景',
  ratio: '画面比例',
  mountGame: '挂载游戏',
  deleteSchedule: '删除直播预告',
}

export function useLiveAnchorAssistant() {
  const titles = ref<Record<string, string>>({
    cn: 'Lkpkupq与您一起探索直播的奇妙世界！',
  })
  const titleLang = ref('cn')
  const roomTitle = computed({
    get: () => titles.value[titleLang.value] ?? titles.value.cn ?? '',
    set: (v) => {
      titles.value = { ...titles.value, [titleLang.value]: v }
    },
  })
  const categoryTag = ref('手游')
  const currentTypeLabel = ref('真人-MT真人')

  const live = ref(false)
  const liveSeconds = ref(0)
  let liveTimer: number | null = null
  let tickTimer: number | null = null
  const muted = ref(true)
  const volume = ref(100)
  const guideRead = ref(false)
  const typeConfigured = ref(false)
  const pushConfirmed = ref(false)
  const actionHint = ref('')

  const liveMode = ref<GoLiveTab>('video')
  const kkCategory = ref<(typeof GO_LIVE_CATEGORIES)[number]>(GO_LIVE_DEFAULT_CATEGORY)
  const ratio = ref<GoLiveRatio>('original')
  const gameGroup = ref<GoLiveGameGroup>('cash')
  const selectedGameId = ref('')
  const backgroundId = ref<string>(GO_LIVE_BACKGROUNDS[0].id)
  const cover = ref(GO_LIVE_DEFAULT_COVER)
  const linkedId = ref<string | null>(null)
  const draftTime = ref<number | null>(null)
  const nowMs = ref(Date.now())
  const timeDay = ref(0)
  const timeHour = ref(20)
  const timeMinute = ref(0)
  const applyingSchedule = ref(false)
  const restoreLinkedId = ref<string | null>(null)
  const deleteTarget = ref<GoLiveSchedule | null>(null)

  const beautyOn = ref(false)
  const beautyItem = ref<'level' | 'style' | 'white' | 'contrast'>('level')
  const beautyLevel = ref(0)
  const beautyWhite = ref(0)
  const beautyStyle = ref<GoLiveBeautyStyle>('女士')
  const beautyContrast = ref<GoLiveContrast>('正常')

  const online = computed(() => (live.value ? 128 : 0))
  const durationText = computed(() => {
    if (!live.value) return '00:00'
    const m = Math.floor(liveSeconds.value / 60)
    const s = liveSeconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
  const showGiftAmount = ref(true)

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
  const timeLabel = computed(() => {
    if (!draftTime.value) return '未设置 (直接开播)'
    return `${formatGoLiveScheduleTime(draftTime.value, nowMs.value)}（可编辑）`
  })
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
    if (linkedSchedule.value) return '立即开播 (已关联预告)'
    if (draftTime.value) return '发布直播预告'
    if (liveMode.value === 'voice') return '创建房间'
    return '开始直播'
  })
  const previewStateLabel = computed(() => {
    if (!live.value) return '暂未直播'
    if (liveMode.value === 'voice') return '语聊中'
    if (liveMode.value === 'screen') return '投屏中'
    return '直播中'
  })
  const startConfirmText = computed(() => {
    if (linkedSchedule.value) {
      return `确认立即开播「${linkedSchedule.value.title}」？将向 ${linkedSchedule.value.subscriberCount} 位预约粉丝推送开播通知。`
    }
    if (liveMode.value === 'voice') return '确认创建语聊房间？创建后观众可进入本房间。'
    if (liveMode.value === 'screen') return '确认开始手机画面直播？观众将实时看到投屏画面。'
    return '确认推流已成功并开始直播？开始后观众可见本房间。'
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

  const onlineUsers = computed(() => {
    if (!live.value) return []
    const kw = listKeyword.value.trim()
    return RANK_USERS.filter((u) => u.online)
      .filter((u) => !kw || u.nickname.includes(kw) || u.id.includes(kw))
      .slice()
      .sort((a, b) => b.giftAmount - a.giftAmount)
  })

  const currentRes = computed(() => PLAY_RESOLUTIONS[resolutionIndex.value])

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
    if (modal.value === 'scheduleTime' && restoreLinkedId.value) {
      const previous = findGoLiveSchedule(restoreLinkedId.value)
      restoreLinkedId.value = null
      if (previous && previous.status === 'pending') applySchedule(previous)
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
    titles.value.cn = titleLang.value === 'cn' ? title : titles.value.cn
    toast('基本信息已保存')
    closeModal()
  }

  function openSettings() {
    if (!guideRead.value) {
      openModal('guide')
      return
    }
    openModal('liveType')
  }

  function confirmGuide() {
    guideRead.value = true
    openModal('liveType')
  }

  function saveLiveType() {
    if (!liveCategory.value) {
      formError.value = '请选择直播分类'
      return
    }
    if (contentKind.value === 'game' && !selectedGame.value.trim()) {
      formError.value = '请选择直播游戏'
      return
    }
    if (contentKind.value === 'match' && !selectedMatch.value.trim()) {
      formError.value = '请选择赛事'
      return
    }
    if (liveMode.value !== 'voice' && currentRes.value.label === '自定义') {
      if (customW.value < 1 || customH.value < 1) {
        formError.value = '请填写有效分辨率'
        return
      }
    }
    typeConfigured.value = true
    const content =
      contentKind.value === 'game' ? selectedGame.value : contentKind.value === 'match' ? selectedMatch.value : '无'
    currentTypeLabel.value = `${liveTag.value || liveCategory.value}-${content}`
    if (kkCategory.value) categoryTag.value = kkCategory.value
    else if (liveCategory.value === '游戏') categoryTag.value = '手游'
    else categoryTag.value = liveCategory.value
    if (!needsPush.value) {
      pushConfirmed.value = true
      closeModal()
      toast('语聊房间配置已保存，可直接创建房间')
      return
    }
    openModal('pushUrl')
  }

  function confirmPush() {
    pushConfirmed.value = true
    toast('推流地址已确认，请在 OBS 推流成功后再开始直播')
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
      toast(`「${expired[0].title}」已超时失效，已通知预约粉丝`)
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
    draftTime.value = ts
    if (linkedSchedule.value) linkedSchedule.value.startAt = ts
    restoreLinkedId.value = null
    closeModal()
    toast('预计开播时间已更新')
  }

  function clearTime() {
    restoreLinkedId.value = null
    unlinkSchedule()
    closeModal()
    toast('已清除开播时间，将直接开播')
  }

  function switchToSchedule(item: GoLiveSchedule) {
    applySchedule(item)
    closeModal()
    toast('已切换为该场预告')
  }

  function editSchedule(item: GoLiveSchedule) {
    applySchedule(item)
    closeModal()
    toast('已载入该场预告，可修改后开播')
  }

  function askDeleteSchedule(item: GoLiveSchedule) {
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
    toast('预告已删除，已通知预约粉丝（原型）')
  }

  function cancelDeleteSchedule() {
    deleteTarget.value = null
    openModal('previewNotice')
  }

  function startCreateSchedule() {
    if (!canCreateSchedule.value) {
      toast(GO_LIVE_SCHEDULE_LIMIT_HINT)
      return
    }
    restoreLinkedId.value = linkedId.value
    linkedId.value = null
    draftTime.value = null
    titles.value = { ...titles.value, cn: goLiveTitleForTab(liveMode.value) }
    kkCategory.value = GO_LIVE_DEFAULT_CATEGORY
    cover.value = GO_LIVE_DEFAULT_COVER
    openTimeSheet()
  }

  function goFreeLive() {
    unlinkSchedule()
    closeModal()
    tryStartLive()
  }

  function publishSchedule() {
    if (!draftTime.value) {
      toast('请先选择预计开播时间')
      openTimeSheet()
      return
    }
    const result = createGoLiveSchedule({
      title: roomTitle.value,
      cover: cover.value,
      category: kkCategory.value,
      mode: liveMode.value,
      startAt: draftTime.value,
    })
    if (result.error || !result.item) {
      toast(result.error || GO_LIVE_SCHEDULE_LIMIT_HINT)
      return
    }
    applySchedule(result.item)
    toast('预告已发布，粉丝可预约本场直播')
  }

  function ensureReadyToGoLive() {
    if (!guideRead.value) {
      openModal('guide')
      return false
    }
    if (!typeConfigured.value) {
      toast('请先完成开播设置')
      openModal('liveType')
      return false
    }
    if (needsPush.value && !pushConfirmed.value) {
      toast('请先获取并确认推流地址')
      openModal('pushUrl')
      return false
    }
    if (live.value) {
      toast('已在直播中')
      return false
    }
    return true
  }

  function tryStartLive() {
    if (draftTime.value && !linkedSchedule.value) {
      publishSchedule()
      return
    }
    if (!ensureReadyToGoLive()) return
    openModal('startConfirm')
  }

  function beginLive(message: string) {
    live.value = true
    liveSeconds.value = 0
    if (liveTimer) window.clearInterval(liveTimer)
    liveTimer = window.setInterval(() => {
      liveSeconds.value += 1
    }, 1000)
    closeModal()
    toast(message)
  }

  function startLive() {
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
    closeModal()
    toast('已强制关播')
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast('已复制链接')
    } catch {
      toast('复制失败，请手动复制')
    }
  }

  function switchLiveMode(next: GoLiveTab) {
    liveMode.value = next
    if (next === 'voice') {
      toast('已切换为语音开播，无需 OBS 推流')
    } else if (next === 'screen') {
      toast(GO_LIVE_SCREEN_HINT)
    }
  }

  function pickMountGame(id: string, name: string) {
    selectedGameId.value = id
    closeModal()
    toast(`已挂载「${name}」`)
  }

  function pickBackground(id: string) {
    backgroundId.value = id
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
  })

  return {
    titles,
    titleLang,
    roomTitle,
    categoryTag,
    currentTypeLabel,
    live,
    muted,
    volume,
    guideRead,
    typeConfigured,
    pushConfirmed,
    actionHint,
    online,
    durationText,
    modal,
    liveCategory,
    liveTag,
    contentKind,
    selectedGame,
    selectedMatch,
    orientation,
    resolutionIndex,
    customW,
    customH,
    formError,
    listKeyword,
    showGiftAmount,
    onlineUsers,
    currentRes,
    PUSH_STREAM,
    SHARE_LINK,
    liveMode,
    kkCategory,
    ratio,
    gameGroup,
    selectedGameId,
    backgroundId,
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
    timeLabel,
    linkBarTime,
    pickingTimeLabel,
    dayOptions,
    ctaLabel,
    previewStateLabel,
    startConfirmText,
    scheduleBadgeMap,
    deleteTarget,
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
    confirmGuide,
    saveLiveType,
    confirmPush,
    tryStartLive,
    startLive,
    tryStopLive,
    stopLive,
    copyText,
    switchLiveMode,
    openScheduleSheet,
    openTimeSheet,
    confirmTime,
    clearTime,
    switchToSchedule,
    editSchedule,
    askDeleteSchedule,
    confirmDeleteSchedule,
    cancelDeleteSchedule,
    startCreateSchedule,
    goFreeLive,
    pickMountGame,
    pickBackground,
    onBeautySlider,
    resetBeauty,
    pickBeautyItem,
    saveBeauty,
    saveBackground,
    saveRatio,
    openMultiPhone,
    scheduleMeta,
    formatGoLiveScheduleTime,
    nowMs,
  }
}
