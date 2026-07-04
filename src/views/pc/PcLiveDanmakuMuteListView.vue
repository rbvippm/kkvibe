<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfLiveDanmakuMuteAnnot from '../../components/wireframe/WfLiveDanmakuMuteAnnot.vue'
import { useLiveDanmakuMute, type MuteRecord, type MuteSource, type MuteType } from '../../composables/useLiveDanmakuMute'
import '../../styles/pc-wireframe.css'

const { muteRecords, muteUser, unmuteUser } = useLiveDanmakuMute()

const filter = ref({
  userId: '',
  username: '',
  muteSource: '' as '' | MuteSource,
  muteType: '' as '' | MuteType,
  status: '' as '' | 'muted' | 'unmuted',
})

const detailVisible = ref(false)
const detailRow = ref<MuteRecord | null>(null)
const editVisible = ref(false)
const editRow = ref<MuteRecord | null>(null)
const muteType = ref<MuteType>('房间禁言')
const muteReason = ref('')
const muteReasonHint = ref('')

const filteredRows = computed(() => {
  const f = filter.value
  return muteRecords.value.filter((row) => {
    if (f.userId && !row.userId.includes(f.userId.trim())) return false
    if (f.username && !row.username.includes(f.username.trim())) return false
    if (f.muteSource && row.muteSource !== f.muteSource) return false
    if (f.muteType && row.muteType !== f.muteType) return false
    if (f.status === 'muted' && !row.muted) return false
    if (f.status === 'unmuted' && row.muted) return false
    return true
  })
})

function resetFilter() {
  filter.value = { userId: '', username: '', muteSource: '', muteType: '', status: '' }
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

function openEdit(row: MuteRecord) {
  editRow.value = row
  muteType.value = row.muteType
  muteReason.value = row.reason
  muteReasonHint.value = ''
  editVisible.value = true
}

function closeEdit() {
  editVisible.value = false
  editRow.value = null
  muteType.value = '房间禁言'
  muteReason.value = ''
  muteReasonHint.value = ''
}

function saveEdit() {
  const row = editRow.value
  if (!row) return
  if (!muteReason.value.trim()) {
    muteReasonHint.value = '请输入禁言原因'
    return
  }
  if (row.muted && row.muteType !== muteType.value) {
    unmuteUser(row.userId, { roomId: row.roomId, muteType: row.muteType })
  }
  muteUser({
    userId: row.userId,
    username: row.username,
    muteSource: '运营',
    muteType: muteType.value,
    reason: muteReason.value.trim(),
    danmakuContent: row.danmakuContent,
    danmakuSentAt: row.danmakuSentAt,
  })
  closeEdit()
}

function confirmUnmute(row: MuteRecord) {
  unmuteUser(row.userId, { roomId: row.roomId, muteType: row.muteType })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />
        <WfLiveDanmakuMuteAnnot context="filterUserId" placement="bottom" />

        <label class="wf-label">用户名：</label>
        <input v-model="filter.username" type="text" class="wf-input" placeholder="请输入用户名" />
        <WfLiveDanmakuMuteAnnot context="filterUsername" placement="bottom" />

        <label class="wf-label">禁言来源：</label>
        <select v-model="filter.muteSource" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="主播">主播</option>
          <option value="运营">运营</option>
        </select>
        <WfLiveDanmakuMuteAnnot context="filterMuteSource" placement="bottom" />

        <label class="wf-label">禁言类型：</label>
        <select v-model="filter.muteType" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="房间禁言">房间禁言</option>
          <option value="全局禁言">全局禁言</option>
        </select>
        <WfLiveDanmakuMuteAnnot context="filterMuteType" placement="bottom" />

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option value="muted">禁言中</option>
          <option value="unmuted">已解除</option>
        </select>
        <WfLiveDanmakuMuteAnnot context="filterStatus" placement="bottom" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <WfLiveDanmakuMuteAnnot context="searchReset" placement="bottom" />
        </span>
      </div>

      <div class="wf-table-wrap live-mute-list__table-head">
        <WfLiveDanmakuMuteAnnot context="tableRecord" placement="bottom" />
        <table class="wf-table wf-table--mute-list">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">禁言编号</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">用户名</th>
              <th class="wf-th">禁言来源</th>
              <th class="wf-th">禁言类型</th>
              <th class="wf-th">禁言时间</th>
              <th class="wf-th">操作人</th>
              <th class="wf-th">禁言原因</th>
              <th class="wf-th wf-th--status">状态</th>
              <th class="wf-th wf-th--op">
                <span class="live-mute-list__op-head">
                  操作
                  <WfLiveDanmakuMuteAnnot context="detailAction" placement="top" />
                  <WfLiveDanmakuMuteAnnot context="editAction" placement="top" />
                  <WfLiveDanmakuMuteAnnot context="unmuteAction" placement="top" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="11" class="wf-td wf-td--empty">暂无禁言记录</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.recordNo }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.username }}</td>
              <td class="wf-td">{{ row.muteSource }}</td>
              <td class="wf-td">{{ row.muteType }}</td>
              <td class="wf-td">{{ row.mutedAt }}</td>
              <td class="wf-td">{{ row.operator }}</td>
              <td class="wf-td">{{ row.reason }}</td>
              <td class="wf-td wf-td--status">
                <span :class="row.muted ? 'live-mute-status--on' : 'live-mute-status--off'">
                  {{ statusLabel(row.muted) }}
                </span>
              </td>
              <td class="wf-td wf-td--actions wf-td--center">
                <button type="button" class="wf-link-action" @click="openDetail(row)">禁言详情</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="openEdit(row)">编辑</button>
                <template v-if="row.muted">
                  <span class="wf-action-sep">|</span>
                  <button
                    type="button"
                    class="wf-link-action live-mute-action--unmute"
                    @click="confirmUnmute(row)"
                  >
                    解除限制
                  </button>
                </template>
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
                  <span class="wf-detail-panel__label">禁言类型</span>
                  <span class="wf-detail-panel__value">{{ detailRow.muteType }}</span>
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

    <Teleport to="body">
      <div
        v-if="editVisible && editRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeEdit"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="mute-edit-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="mute-edit-title" class="wf-modal__title">编辑禁言</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeEdit">×</button>
          </div>
          <div class="wf-modal__body">
            <p class="live-mute-modal__user">
              用户：<strong>{{ editRow.username }}</strong>（{{ editRow.userId }}）
            </p>
            <p class="live-mute-modal__meta">
              当前状态：<span :class="editRow.muted ? 'live-mute-status--on' : 'live-mute-status--off'">
                {{ statusLabel(editRow.muted) }}
              </span>
            </p>
            <div class="wf-form-row">
              <span class="wf-form-row__label">禁言类型</span>
              <div class="live-mute-modal__type-group">
                <label class="live-mute-modal__type">
                  <input v-model="muteType" type="radio" value="房间禁言" />
                  房间禁言
                </label>
                <label class="live-mute-modal__type">
                  <input v-model="muteType" type="radio" value="全局禁言" />
                  全局禁言
                </label>
              </div>
            </div>
            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="mute-edit-reason-input">
                禁言原因
              </label>
              <input
                id="mute-edit-reason-input"
                v-model="muteReason"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入禁言原因"
                maxlength="50"
                @keydown.enter.prevent="saveEdit"
              />
            </div>
            <p v-if="muteReasonHint" class="wf-modal__hint">{{ muteReasonHint }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeEdit">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="saveEdit">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.live-mute-list__table-head {
  position: relative;
}

.live-mute-list__table-head > :deep(.wf-spec-annot) {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.live-mute-list__op-head {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.live-mute-status--on {
  color: var(--pc-danger, #ff4d4f);
}

.live-mute-status--off {
  color: var(--pc-text-muted, #999);
}

.live-mute-action--unmute {
  color: var(--pc-danger, #ff4d4f);
}

.live-mute-action--unmute:hover {
  color: #ff7875;
}

.live-mute-modal__user {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--pc-text, #333);
}

.live-mute-modal__meta {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--pc-text-secondary, #666);
}

.live-mute-modal__type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding-top: 6px;
}

.live-mute-modal__type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--pc-text, #333);
  cursor: pointer;
}

.live-mute-modal__type input {
  margin: 0;
  cursor: pointer;
}
</style>
