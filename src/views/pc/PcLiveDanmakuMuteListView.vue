<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useLiveDanmakuMute, type MuteRecord, type MuteSource } from '../../composables/useLiveDanmakuMute'
import '../../styles/pc-wireframe.css'

const { muteRecords, muteUser, unmuteUser } = useLiveDanmakuMute()

const filter = ref({
  userId: '',
  username: '',
  muteSource: '' as '' | MuteSource,
  status: '' as '' | 'muted' | 'unmuted',
})

const detailVisible = ref(false)
const detailRow = ref<MuteRecord | null>(null)

const filteredRows = computed(() => {
  const f = filter.value
  return muteRecords.value.filter((row) => {
    if (f.userId && !row.userId.includes(f.userId.trim())) return false
    if (f.username && !row.username.includes(f.username.trim())) return false
    if (f.muteSource && row.muteSource !== f.muteSource) return false
    if (f.status === 'muted' && !row.muted) return false
    if (f.status === 'unmuted' && row.muted) return false
    return true
  })
})

function resetFilter() {
  filter.value = { userId: '', username: '', muteSource: '', status: '' }
}

function toggleMute(row: MuteRecord) {
  if (row.muted) {
    unmuteUser(row.userId, row.roomId)
    return
  }
  muteUser({
    userId: row.userId,
    username: row.username,
    muteSource: '运营',
    reason: row.reason,
    danmakuContent: row.danmakuContent,
    danmakuSentAt: row.danmakuSentAt,
  })
}

function statusLabel(muted: boolean) {
  return muted ? '禁言中' : '已解除'
}

function openDetail(row: MuteRecord) {
  detailRow.value = row
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailRow.value = null
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">用户名：</label>
        <input v-model="filter.username" type="text" class="wf-input" placeholder="请输入用户名" />

        <label class="wf-label">禁言来源：</label>
        <select v-model="filter.muteSource" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="主播">主播</option>
          <option value="运营">运营</option>
        </select>

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="muted">禁言中</option>
          <option value="unmuted">已解除</option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">禁言编号</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">用户名</th>
              <th class="wf-th">禁言来源</th>
              <th class="wf-th">禁言时间</th>
              <th class="wf-th">操作人</th>
              <th class="wf-th">禁言原因</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="10" class="wf-td wf-td--empty">暂无禁言记录</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.recordNo }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td">{{ row.muteSource }}</td>
              <td class="wf-td">{{ row.mutedAt }}</td>
              <td class="wf-td">{{ row.operator }}</td>
              <td class="wf-td">{{ row.reason }}</td>
              <td class="wf-td">
                <span :class="row.muted ? 'live-mute-status--on' : 'live-mute-status--off'">
                  {{ statusLabel(row.muted) }}
                </span>
              </td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openDetail(row)">禁言详情</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action"
                  :class="row.muted ? 'live-mute-action--unmute' : 'live-mute-action--mute'"
                  @click="toggleMute(row)"
                >
                  {{ row.muted ? '解除' : '禁言' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="detailVisible && detailRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDetail"
      >
        <div
          class="wf-modal wf-modal--detail-wide"
          role="dialog"
          aria-labelledby="mute-detail-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="mute-detail-title" class="wf-modal__title">禁言详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </div>
          <div class="wf-modal__body">
            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">禁言详情</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">禁言编号</span>
                  <span class="wf-detail-panel__value">{{ detailRow.recordNo }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">用户</span>
                  <span class="wf-detail-panel__value">{{ detailRow.username }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">用户ID</span>
                  <span class="wf-detail-panel__value wf-detail-panel__value--link">{{ detailRow.userId }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">禁言来源</span>
                  <span class="wf-detail-panel__value">{{ detailRow.muteSource }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">禁言时间</span>
                  <span class="wf-detail-panel__value">{{ detailRow.mutedAt }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">操作人</span>
                  <span class="wf-detail-panel__value">{{ detailRow.operator }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">操作人ID</span>
                  <span class="wf-detail-panel__value">{{ detailRow.operatorId }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">禁言原因</span>
                  <span class="wf-detail-panel__value">{{ detailRow.reason }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">状态</span>
                  <span
                    class="wf-detail-panel__value"
                    :class="detailRow.muted ? 'wf-detail-panel__value--danger' : ''"
                  >
                    {{ statusLabel(detailRow.muted) }}
                  </span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">解除时间</span>
                  <span class="wf-detail-panel__value">{{ detailRow.unmutedAt }}</span>
                </div>
              </div>
            </section>

            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">关联弹幕</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell wf-detail-panel__cell--span-3">
                  <span class="wf-detail-panel__label">弹幕内容</span>
                  <span class="wf-detail-panel__value">{{ detailRow.danmakuContent }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">发送时间</span>
                  <span class="wf-detail-panel__value">{{ detailRow.danmakuSentAt }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">直播主播</span>
                  <span class="wf-detail-panel__value">{{ detailRow.hostName }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">主播ID</span>
                  <span class="wf-detail-panel__value wf-detail-panel__value--link">{{ detailRow.hostId }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">直播场次ID</span>
                  <span class="wf-detail-panel__value">{{ detailRow.sessionId }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">处理结果</span>
                  <span class="wf-detail-panel__value">
                    {{ detailRow.muted ? '已执行禁言' : '已解除禁言' }}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeDetail">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.live-mute-status--on {
  color: var(--pc-danger, #ff4d4f);
}

.live-mute-status--off {
  color: var(--pc-text-muted, #999);
}

.live-mute-action--mute {
  color: var(--pc-primary, #1890ff);
}

.live-mute-action--mute:hover {
  color: var(--pc-focus, #40a9ff);
}

.live-mute-action--unmute {
  color: var(--pc-danger, #ff4d4f);
}

.live-mute-action--unmute:hover {
  color: #ff7875;
}
</style>
