<script setup lang="ts">
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { ASSISTANT_MODAL_TITLES, useLiveAnchorAssistant } from '../../composables/useLiveAnchorAssistant'
import {
  ANCHOR_TITLE_LANGS,
  GO_LIVE_GUIDE_STEPS,
  LIVE_CATEGORIES,
  LIVE_TAGS,
  PLAY_RESOLUTIONS,
} from '../../constants/liveAnchorAssistant'
import '../../styles/pc-wireframe.css'
import '../../styles/live-anchor-assistant.css'

const a = useLiveAnchorAssistant()

function onCoverClick() {
  a.toast('已选择示意图封面（原型）')
}
</script>

<template>
  <div class="pc-wireframe-page lal-page">
    <WfPagePathMenu />
    <p v-if="a.actionHint.value" class="lal-hint">{{ a.actionHint.value }}</p>

    <div class="lal-shell">
      <section class="lal-center">
        <div class="lal-head">
          <div class="lal-head__main">
            <h2 class="lal-title">{{ a.roomTitle.value }}</h2>
            <button type="button" class="lal-edit" @click="a.openModal('basic')">编辑</button>
            <span class="lal-tag">{{ a.categoryTag.value }}</span>
          </div>
          <button type="button" class="wf-btn wf-btn--default" @click="a.openScheduleSheet">
            预告 {{ a.activeSchedules.value.length }}
          </button>
        </div>
        <div class="lal-stats" :class="{ 'is-live': a.live.value }">
          <span>在线 <b>{{ a.online.value }}</b></span>
          <span>时长 <b>{{ a.durationText.value }}</b></span>
        </div>
        <div class="lal-modes" role="tablist" aria-label="开播模式">
          <button
            v-for="item in a.GO_LIVE_TABS"
            :key="item.key"
            type="button"
            class="lal-mode"
            :class="{ 'is-on': a.liveMode.value === item.key }"
            @click="a.switchLiveMode(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
        <button v-if="a.linkedSchedule.value" type="button" class="lal-linkbar" @click="a.openScheduleSheet">
          <span>
            已关联：{{ a.linkBarTime.value }}（{{ a.linkedSchedule.value.subscriberCount }}人已预约）
          </span>
          <span>切换/管理 ›</span>
        </button>
        <div class="lal-preview" :class="{ 'lal-preview--cover': !a.live.value && a.linkedSchedule.value, 'is-live': a.live.value }">
          <img
            v-if="!a.live.value && a.linkedSchedule.value"
            class="lal-preview__cover"
            :src="a.cover.value"
            alt=""
          />
          <div class="lal-preview__state">
            <div class="lal-preview__icon" aria-hidden="true">
              {{ a.liveMode.value === 'voice' ? '🎙' : a.liveMode.value === 'screen' ? '📱' : '📺' }}
            </div>
            <strong>{{ a.previewStateLabel.value }}</strong>
            <em v-if="a.linkedSchedule.value && !a.live.value">已回填</em>
            <p v-if="a.liveMode.value === 'screen' && !a.live.value" class="lal-preview__hint">{{ a.GO_LIVE_SCREEN_HINT }}</p>
          </div>
          <div class="lal-preview__dock">
            <div class="lal-preview__dock-left">
              <button
                type="button"
                class="lal-icon-btn"
                :class="{ 'is-on': a.muted.value }"
                :title="a.muted.value ? '取消静音' : '静音'"
                :aria-label="a.muted.value ? '取消静音' : '静音'"
                @click="a.muted.value = !a.muted.value"
              >
                <svg v-if="a.muted.value" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5A.5.5 0 0 1 2 9.5v-3A.5.5 0 0 1 2.5 6Zm8.1-.9.7.7-1.5 1.5 1.5 1.5-.7.7-1.5-1.5-1.5 1.5-.7-.7 1.5-1.5-1.5-1.5.7-.7 1.5 1.5 1.5-1.5Z" />
                </svg>
                <svg v-else viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5A.5.5 0 0 1 2 9.5v-3A.5.5 0 0 1 2.5 6Zm7.6-1.2a3.6 3.6 0 0 1 0 6.4l-.7-1.1a2.3 2.3 0 0 0 0-4.2l.7-1.1Zm1.8-1.6a5.6 5.6 0 0 1 0 9.6l-.8-1.1a4.3 4.3 0 0 0 0-7.4l.8-1.1Z" />
                </svg>
              </button>
              <label class="lal-vol">
                <input v-model.number="a.volume.value" type="range" min="0" max="100" :aria-label="`音量 ${a.volume.value}`" />
                <span>{{ a.volume.value }}</span>
              </label>
            </div>
            <div class="lal-preview__dock-right">
              <button
                type="button"
                class="lal-icon-btn"
                title="分享"
                aria-label="分享"
                @click="a.openModal('share')"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M10.2 3.6a1.6 1.6 0 1 1 1.7 1.55L7.4 7.3a1.6 1.6 0 0 1 0 1.4l4.5 2.15a1.6 1.6 0 1 1-.55 1.15L6.9 9.85a1.6 1.6 0 1 1 0-3.7l4.45-2.15a1.6 1.6 0 0 1-.15-.4Z" />
                </svg>
              </button>
              <button
                type="button"
                class="lal-icon-btn"
                title="刷新画面"
                aria-label="刷新画面"
                @click="a.toast('画面已刷新')"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M13.2 8A5.2 5.2 0 1 1 8 2.8V1.2L11 3.4 8 5.6V4a4 4 0 1 0 4 4h1.2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="lal-chips">
          <button v-if="a.liveMode.value === 'video'" type="button" class="lal-chip" @click="a.openModal('beauty')">
            美颜{{ a.beautyOn.value ? ' · 开' : '' }}
          </button>
          <button
            v-if="a.liveMode.value !== 'voice'"
            type="button"
            class="lal-chip"
            @click="a.openModal('ratio')"
          >
            画面 {{ a.ratio.value === 'original' ? '原始' : a.ratio.value }}
          </button>
          <button type="button" class="lal-chip" @click="a.openModal('mountGame')">
            游戏{{ a.selectedMountGame.value ? ` · ${a.selectedMountGame.value.name}` : '' }}
          </button>
          <button v-if="a.liveMode.value === 'voice'" type="button" class="lal-chip" @click="a.openModal('background')">
            房间背景
          </button>
          <button v-if="a.liveMode.value === 'screen'" type="button" class="lal-chip" @click="a.openMultiPhone">
            多手机
          </button>
        </div>
        <div class="lal-bar">
          <button type="button" class="lal-guide" :class="{ 'is-done': a.guideRead.value }" @click="a.openModal('guide')">
            开播说明<span v-if="!a.guideRead.value"> *必读</span>
          </button>
          <div class="lal-bar__actions">
            <button type="button" class="wf-btn wf-btn--add" @click="a.openSettings">开播设置</button>
            <button type="button" class="lal-time-btn" @click="a.openTimeSheet">
              <span>预计开播</span>
              <strong>{{ a.timeLabel.value }}</strong>
            </button>
            <button
              v-if="!a.live.value"
              type="button"
              class="wf-btn wf-btn--primary"
              @click="a.tryStartLive"
            >
              {{ a.ctaLabel.value }}
            </button>
            <button
              v-else
              type="button"
              class="wf-btn wf-btn--danger"
              @click="a.tryStopLive"
            >
              强制关播
            </button>
          </div>
        </div>
      </section>

      <aside class="lal-right">
        <div class="lal-right__top">
          <strong>在线列表</strong>
          <span class="lal-right__count">{{ a.online.value }}</span>
          <label class="lal-heat">
            <input v-model="a.showGiftAmount.value" type="checkbox" />
            打赏金额
          </label>
        </div>
        <div class="lal-search">
          <input v-model="a.listKeyword.value" placeholder="搜索昵称或 ID" />
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
        </div>
        <div class="lal-list">
          <div v-if="!a.onlineUsers.value.length" class="lal-empty">
            {{ a.live.value ? '暂无在线用户' : '开播后将显示在线观众' }}
          </div>
          <div v-for="user in a.onlineUsers.value" :key="user.id" class="lal-user">
            <span class="lal-user__avatar" aria-hidden="true">{{ user.nickname.slice(0, 1) }}</span>
            <span class="lal-user__meta">
              <b>{{ user.nickname }}</b>
              <em>{{ user.id }}</em>
            </span>
            <span v-if="a.showGiftAmount.value" class="lal-user__gift">{{ user.giftAmount }}</span>
          </div>
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="a.modal.value" class="wf-modal-mask" @click.self="a.closeModal">
        <div
          class="wf-modal wf-modal--scroll"
          :class="{
            'wf-modal--narrow': ['guide', 'share', 'startConfirm', 'stopConfirm', 'deleteSchedule', 'ratio'].includes(a.modal.value),
          }"
          role="dialog"
          aria-modal="true"
        >
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">{{ a.modal.value ? ASSISTANT_MODAL_TITLES[a.modal.value] : '' }}</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="a.closeModal">×</button>
          </header>
          <div class="wf-modal__body">
            <p v-if="a.formError.value" class="wf-modal__error">{{ a.formError.value }}</p>

            <template v-if="a.modal.value === 'guide'">
              <p>PC 端主播开播流程请根据下述内容逐步进行，确认每一步成功后再进行下一步！</p>
              <ol class="lal-steps">
                <li v-for="(step, index) in GO_LIVE_GUIDE_STEPS" :key="step">step{{ index + 1 }}：{{ step }}</li>
              </ol>
            </template>

            <template v-else-if="a.modal.value === 'basic'">
              <div class="lal-form-grid">
                <div class="lal-lang">
                  <button
                    v-for="lang in ANCHOR_TITLE_LANGS"
                    :key="lang.key"
                    type="button"
                    :class="{ 'is-on': a.titleLang.value === lang.key }"
                    @click="a.titleLang.value = lang.key"
                  >
                    {{ lang.label }}
                  </button>
                </div>
                <label class="wf-field">
                  <span>标题：</span>
                  <textarea v-model="a.roomTitle.value" rows="3" maxlength="200" placeholder="请输入" />
                  <span class="wf-muted">{{ a.roomTitle.value.length }}/200</span>
                </label>
                <div class="lal-cover">
                  <div class="lal-cover__img lal-cover--tall">竖版封面</div>
                  <div>
                    <button type="button" class="wf-btn wf-btn--default" @click="onCoverClick">上传封面</button>
                    <p class="wf-muted">为保证封面的观看质量请选择合适的 16：9 尺寸图片</p>
                  </div>
                </div>
                <div class="lal-cover">
                  <div class="lal-cover__img">横版封面</div>
                  <div>
                    <button type="button" class="wf-btn wf-btn--default" @click="onCoverClick">上传封面</button>
                    <p class="wf-muted">为保证封面的观看质量请选择合适的 525*444 尺寸的图片</p>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'previewNotice'">
              <p class="wf-muted">有效预告 {{ a.activeSchedules.value.length }}/5，与移动端直播中心共用场次。</p>
              <div v-if="!a.activeSchedules.value.length" class="lal-empty">暂无有效预告，可新建一场或直接开播</div>
              <div
                v-for="item in a.activeSchedules.value"
                :key="item.id"
                class="lal-sch"
                :class="{ 'lal-sch--on': a.linkedId.value === item.id }"
              >
                <div class="lal-sch__main">
                  <img :src="item.cover" alt="" />
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ a.formatGoLiveScheduleTime(item.startAt, a.nowMs.value) }} · {{ item.subscriberCount }}人已预约</p>
                    <p class="wf-muted">{{ a.scheduleMeta(item) }}</p>
                  </div>
                  <span
                    v-if="a.scheduleBadgeMap.value[item.id]"
                    class="lal-badge"
                    :class="`lal-badge--${a.scheduleBadgeMap.value[item.id]?.tone}`"
                  >
                    {{ a.scheduleBadgeMap.value[item.id]?.text }}
                  </span>
                </div>
                <div class="lal-sch__ops">
                  <button type="button" class="wf-btn wf-btn--default" @click="a.editSchedule(item)">编辑</button>
                  <button type="button" class="wf-btn wf-btn--danger" @click="a.askDeleteSchedule(item)">删除</button>
                  <span v-if="a.linkedId.value === item.id" class="lal-sch__cur">当前关联</span>
                  <button v-else type="button" class="wf-btn wf-btn--add" @click="a.switchToSchedule(item)">切换以此开播</button>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'liveType'">
              <div class="lal-current">
                <strong>当前</strong>
                <span>{{ a.currentTypeLabel.value }} · {{ a.liveMode.value === 'video' ? '视频' : a.liveMode.value === 'voice' ? '语音' : '手机画面' }}</span>
              </div>
              <h4>最近开播</h4>
              <label class="wf-field">
                <span>客户端直播类型：</span>
                <select v-model="a.kkCategory.value">
                  <option v-for="item in a.GO_LIVE_CATEGORIES" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
              <label class="wf-field">
                <span>直播分类：</span>
                <select v-model="a.liveCategory.value">
                  <option v-for="item in LIVE_CATEGORIES" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
              <label class="wf-field">
                <span>直播标签：</span>
                <select v-model="a.liveTag.value">
                  <option value="">请选择</option>
                  <option v-for="item in LIVE_TAGS" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
              <p>直播内容：</p>
              <label><input v-model="a.contentKind.value" type="radio" value="none" /> 无</label>
              <label><input v-model="a.contentKind.value" type="radio" value="match" /> 赛事选择</label>
              <label><input v-model="a.contentKind.value" type="radio" value="game" /> 游戏选择</label>
              <p v-if="a.contentKind.value === 'game'" class="wf-muted">
                {{ a.selectedGame.value }} · 提示：在客户端直播列表中会有直播游戏标识
              </p>
              <p v-if="a.contentKind.value === 'match'">{{ a.selectedMatch.value }}</p>
              <template v-if="a.liveMode.value !== 'voice'">
                <h4>播放格式</h4>
                <div class="lal-orient">
                  <button type="button" :class="{ 'is-on': a.orientation.value === 'portrait' }" @click="a.orientation.value = 'portrait'">
                    竖屏
                  </button>
                  <button type="button" :class="{ 'is-on': a.orientation.value === 'landscape' }" @click="a.orientation.value = 'landscape'">
                    横屏
                  </button>
                </div>
                <p class="wf-muted">说明：客户端会根据选择的方向和分辨率宽高比进行展示</p>
                <div class="lal-res">
                  <span>分辨率：</span>
                  <select v-model.number="a.resolutionIndex.value">
                    <option v-for="(item, index) in PLAY_RESOLUTIONS" :key="item.label" :value="index">{{ item.label }}</option>
                  </select>
                  <span>W：</span>
                  <input
                    v-if="a.currentRes.value.label === '自定义'"
                    v-model.number="a.customW.value"
                    type="number"
                    min="1"
                  />
                  <input v-else :value="a.currentRes.value.w" disabled />
                  <span>H：</span>
                  <input
                    v-if="a.currentRes.value.label === '自定义'"
                    v-model.number="a.customH.value"
                    type="number"
                    min="1"
                  />
                  <input v-else :value="a.currentRes.value.h" disabled />
                </div>
              </template>
              <p v-else class="wf-muted">语音开播无需推流分辨率，保存后可直接创建房间。</p>
            </template>

            <template v-else-if="a.modal.value === 'pushUrl'">
              <p>请将以下信息填入 OBS「推流」设置，确认推流成功后再点开始直播。</p>
              <p>服务器：{{ a.PUSH_STREAM.server }}</p>
              <p>推流密钥：{{ a.PUSH_STREAM.key }}</p>
            </template>

            <template v-else-if="a.modal.value === 'share'">
              <p>{{ a.SHARE_LINK }}</p>
            </template>

            <template v-else-if="a.modal.value === 'startConfirm'">
              <p>{{ a.startConfirmText.value }}</p>
            </template>

            <template v-else-if="a.modal.value === 'stopConfirm'">
              <p>确认强制结束本场直播？结束后预览恢复「暂未直播」。</p>
            </template>

            <template v-else-if="a.modal.value === 'scheduleTime'">
              <p>已选时间：{{ a.pickingTimeLabel.value }}</p>
              <p class="wf-muted">须晚于现在至少 15 分钟、不超过 7 天，两场间隔至少 1 小时。</p>
              <div class="lal-time-pick">
                <label class="wf-field">
                  日期
                  <select v-model.number="a.timeDay.value">
                    <option v-for="item in a.dayOptions.value" :key="item.offset" :value="item.offset">{{ item.label }}</option>
                  </select>
                </label>
                <label class="wf-field">
                  时
                  <select v-model.number="a.timeHour.value">
                    <option v-for="item in a.GO_LIVE_SCHEDULE_HOURS" :key="`h-${item}`" :value="item">
                      {{ String(item).padStart(2, '0') }}
                    </option>
                  </select>
                </label>
                <label class="wf-field">
                  分
                  <select v-model.number="a.timeMinute.value">
                    <option v-for="item in a.GO_LIVE_SCHEDULE_MINUTES" :key="`m-${item}`" :value="item">
                      {{ String(item).padStart(2, '0') }}
                    </option>
                  </select>
                </label>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'beauty'">
              <div class="lal-beauty__head">
                <strong>{{ a.beautyOn.value ? '已开启' : '已关闭' }}</strong>
                <button type="button" class="wf-btn wf-btn--default" @click="a.resetBeauty">重置</button>
              </div>
              <label class="lal-beauty__switch">
                <input v-model="a.beautyOn.value" type="checkbox" />
                美颜开关
              </label>
              <p>当前：{{ a.beautySliderLabel.value }}</p>
              <input
                type="range"
                min="0"
                max="100"
                :value="a.beautySliderValue.value"
                @input="a.onBeautySlider"
              />
              <div class="lal-beauty__row">
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'level' }" @click="a.pickBeautyItem('level')">
                  美颜级别 {{ a.beautyLevel.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'style' }" @click="a.pickBeautyItem('style')">
                  风格 {{ a.beautyStyle.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'white' }" @click="a.pickBeautyItem('white')">
                  美白 {{ a.beautyWhite.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'contrast' }" @click="a.pickBeautyItem('contrast')">
                  对比度 {{ a.beautyContrast.value }}
                </button>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'background'">
              <div class="lal-bg-list">
                <button
                  v-for="item in a.GO_LIVE_BACKGROUNDS"
                  :key="item.id"
                  type="button"
                  class="lal-bg"
                  :class="{ 'is-on': a.backgroundId.value === item.id }"
                  @click="a.pickBackground(item.id)"
                >
                  <img :src="item.image" alt="" />
                  <span>{{ item.name }}</span>
                </button>
              </div>
              <button type="button" class="wf-btn wf-btn--default" @click="a.toast('打开相册（原型）')">相册</button>
            </template>

            <template v-else-if="a.modal.value === 'ratio'">
              <div class="lal-orient">
                <button
                  v-for="item in a.GO_LIVE_RATIOS"
                  :key="item.key"
                  type="button"
                  :class="{ 'is-on': a.ratio.value === item.key }"
                  @click="a.ratio.value = item.key"
                >
                  {{ item.label }}
                </button>
              </div>
              <div class="lal-ratio-preview" :class="`lal-ratio-preview--${a.ratio.value === '16:9' ? 'wide' : a.ratio.value === '4:3' ? 'box' : 'tall'}`">
                手机画面
              </div>
              <p class="wf-muted">{{ a.ratioHint.value }}</p>
            </template>

            <template v-else-if="a.modal.value === 'mountGame'">
              <div class="lal-orient">
                <button
                  v-for="group in a.GO_LIVE_GAME_GROUPS"
                  :key="group.key"
                  type="button"
                  :class="{ 'is-on': a.gameGroup.value === group.key }"
                  @click="a.gameGroup.value = group.key"
                >
                  {{ group.label }}
                </button>
              </div>
              <div class="lal-game-grid">
                <button
                  v-for="game in a.mountGames.value"
                  :key="game.id"
                  type="button"
                  class="lal-mount"
                  :class="{ 'is-on': a.selectedGameId.value === game.id }"
                  @click="a.pickMountGame(game.id, game.name)"
                >
                  <img :src="game.icon" alt="" />
                  <span>{{ game.name }}</span>
                </button>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'deleteSchedule'">
              <p>删除后已预约粉丝将收到取消通知，该场次不可恢复。</p>
              <p v-if="a.deleteTarget.value">场次：{{ a.deleteTarget.value.title }}</p>
            </template>
          </div>
          <footer class="wf-modal__footer">
            <button
              v-if="!['guide', 'share', 'pushUrl', 'deleteSchedule', 'previewNotice'].includes(a.modal.value)"
              type="button"
              class="wf-btn wf-btn--default"
              @click="a.closeModal"
            >
              取消
            </button>
            <button v-if="a.modal.value === 'guide'" type="button" class="wf-btn wf-btn--primary" @click="a.confirmGuide">
              我已知悉
            </button>
            <button v-if="a.modal.value === 'basic'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBasic">
              确定
            </button>
            <button v-if="a.modal.value === 'liveType'" type="button" class="wf-btn wf-btn--primary" @click="a.saveLiveType">
              确定
            </button>
            <template v-if="a.modal.value === 'pushUrl'">
              <button type="button" class="wf-btn wf-btn--add" @click="a.copyText(a.PUSH_STREAM.key)">复制密钥</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="a.confirmPush">已确认推流</button>
            </template>
            <button v-if="a.modal.value === 'share'" type="button" class="wf-btn wf-btn--primary" @click="a.copyText(a.SHARE_LINK)">
              复制链接
            </button>
            <button v-if="a.modal.value === 'startConfirm'" type="button" class="wf-btn wf-btn--danger" @click="a.startLive">
              确定
            </button>
            <button v-if="a.modal.value === 'stopConfirm'" type="button" class="wf-btn wf-btn--danger" @click="a.stopLive">
              确定
            </button>
            <template v-if="a.modal.value === 'previewNotice'">
              <button type="button" class="wf-btn wf-btn--default" @click="a.closeModal">关闭</button>
              <button type="button" class="wf-btn wf-btn--default" @click="a.goFreeLive">不使用预告，直接开播</button>
              <button
                type="button"
                class="wf-btn wf-btn--add"
                :disabled="!a.canCreateSchedule.value"
                @click="a.startCreateSchedule"
              >
                新建一场直播预告
              </button>
            </template>
            <template v-if="a.modal.value === 'scheduleTime'">
              <button type="button" class="wf-btn wf-btn--danger" @click="a.clearTime">清除时间</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="a.confirmTime">确定</button>
            </template>
            <button v-if="a.modal.value === 'beauty'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBeauty">
              确定
            </button>
            <button v-if="a.modal.value === 'background'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBackground">
              确定
            </button>
            <button v-if="a.modal.value === 'ratio'" type="button" class="wf-btn wf-btn--primary" @click="a.saveRatio">
              确定
            </button>
            <template v-if="a.modal.value === 'deleteSchedule'">
              <button type="button" class="wf-btn wf-btn--default" @click="a.cancelDeleteSchedule">再想想</button>
              <button type="button" class="wf-btn wf-btn--danger" @click="a.confirmDeleteSchedule">删除</button>
            </template>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>
