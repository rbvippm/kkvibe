<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { LIVE_BROADCAST_LIST_ANNOT_MAP } from '../../constants/liveBroadcastListSpec'
import {
  LIVE_BROADCAST_CATEGORY_OPTIONS,
  LIVE_BROADCAST_METRIC_COLUMNS,
  LIVE_BROADCAST_MODE_OPTIONS,
  LIVE_BROADCAST_PAGE_SIZE_OPTIONS,
  LIVE_BROADCAST_ROWS,
  LIVE_BROADCAST_STATUS_OPTIONS,
  formatLiveBroadcastGame,
  formatLiveBroadcastMetric,
  liveBroadcastMetricTotal,
  liveBroadcastPeopleTotal,
  liveBroadcastModeLabel,
  liveBroadcastStatusLabel,
  type LiveBroadcastMode,
  type LiveBroadcastRow,
  type LiveBroadcastStatus,
  type LiveBroadcastViewMode,
} from '../../constants/liveBroadcastList'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  hostId: string
  roomId: string
  mode: '' | LiveBroadcastMode
  category: string
  status: '' | LiveBroadcastStatus
}

const router = useRouter()

const defaultFilter = (): ListFilter => ({
  hostId: '',
  roomId: '',
  mode: '',
  category: '',
  status: '',
})

const statusAnnot = LIVE_BROADCAST_LIST_ANNOT_MAP.liveStatus
const metricAnnotByKey = {
  people: LIVE_BROADCAST_LIST_ANNOT_MAP.people,
  appointment: LIVE_BROADCAST_LIST_ANNOT_MAP.appointment,
  heat: LIVE_BROADCAST_LIST_ANNOT_MAP.heat,
  like: LIVE_BROADCAST_LIST_ANNOT_MAP.like,
} as const

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const viewMode = ref<LiveBroadcastViewMode>('list')
const pageSize = ref<(typeof LIVE_BROADCAST_PAGE_SIZE_OPTIONS)[number]>(10)
const page = ref(1)
const jumpInput = ref('1')

const filteredRows = computed(() => LIVE_BROADCAST_ROWS.filter(matchRow))

const total = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})
const pageNumbers = computed(() => {
  const last = totalPages.value
  const current = page.value
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, last]
  if (current >= last - 3) return [1, last - 4, last - 3, last - 2, last - 1, last]
  return [1, current - 1, current, current + 1, last]
})

function matchRow(row: LiveBroadcastRow) {
  const f = appliedFilter.value
  const hostId = f.hostId.trim()
  const roomId = f.roomId.trim()
  if (hostId && !row.hostId.includes(hostId)) return false
  if (roomId && !row.roomId.includes(roomId)) return false
  if (f.mode && row.mode !== f.mode) return false
  if (f.category && row.category !== f.category) return false
  if (f.status && row.status !== f.status) return false
  return true
}

function resetPage() {
  page.value = 1
  jumpInput.value = '1'
}

function applyFilter() {
  appliedFilter.value = { ...filter.value }
  resetPage()
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  resetPage()
}

function goPage(next: number) {
  const safe = Math.min(totalPages.value, Math.max(1, next))
  page.value = safe
  jumpInput.value = String(safe)
}

function jumpToPage() {
  const next = Number(jumpInput.value)
  if (!Number.isInteger(next)) {
    jumpInput.value = String(page.value)
    return
  }
  goPage(next)
}

function enterRoom() {
  void router.push({ name: 'pc-live-broadcast' })
}

watch(pageSize, () => {
  resetPage()
})

watch(totalPages, (last) => {
  if (page.value > last) goPage(last)
})
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label" for="lbl-host-id">主播ID</label>
        <input
          id="lbl-host-id"
          v-model="filter.hostId"
          type="text"
          class="wf-input"
          placeholder="请输入主播ID"
        />

        <label class="wf-label" for="lbl-room-id">直播间ID</label>
        <input
          id="lbl-room-id"
          v-model="filter.roomId"
          type="text"
          class="wf-input"
          placeholder="请输入直播间ID"
        />

        <label class="wf-label" for="lbl-mode">直播模式</label>
        <select id="lbl-mode" v-model="filter.mode" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_BROADCAST_MODE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label" for="lbl-category">直播分类</label>
        <select id="lbl-category" v-model="filter.category" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="item in LIVE_BROADCAST_CATEGORY_OPTIONS" :key="item" :value="item">
            {{ item }}
          </option>
        </select>

        <label class="wf-label" for="lbl-status">直播状态</label>
        <select id="lbl-status" v-model="filter.status" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="opt in LIVE_BROADCAST_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <WfSpecAnnot
          :no="statusAnnot.no"
          :title="statusAnnot.title"
          :items="[...statusAnnot.items]"
        />

        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
          <button
            type="button"
            class="wf-btn"
            :class="viewMode === 'list' ? 'wf-btn--primary' : 'wf-btn--default'"
            @click="viewMode = 'list'"
          >
            列表式
          </button>
          <button
            type="button"
            class="wf-btn"
            :class="viewMode === 'card' ? 'wf-btn--primary' : 'wf-btn--default'"
            @click="viewMode = 'card'"
          >
            卡片式
          </button>
        </span>
      </div>

      <div v-if="viewMode === 'list'" class="wf-table-wrap">
        <table class="wf-table lbl-table">
          <thead>
            <tr>
              <th class="wf-th">直播间ID</th>
              <th class="wf-th">直播模式</th>
              <th class="wf-th">主播</th>
              <th class="wf-th">主播ID</th>
              <th class="wf-th">游戏分类 / 游戏名称</th>
              <th class="wf-th">直播分类</th>
              <th class="wf-th">直播状态</th>
              <th
                v-for="col in LIVE_BROADCAST_METRIC_COLUMNS"
                :key="col.key"
                class="wf-th lbl-th-metric"
              >
                <span class="lbl-th-head">
                  {{ col.label }}
                  <WfSpecAnnot
                    :no="metricAnnotByKey[col.key].no"
                    :title="metricAnnotByKey[col.key].title"
                    :items="[...metricAnnotByKey[col.key].items]"
                    placement="top"
                  />
                </span>
              </th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!pageRows.length">
              <td colspan="12" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
            <tr v-for="row in pageRows" :key="row.roomId">
              <td class="wf-td">{{ row.roomId }}</td>
              <td class="wf-td">{{ liveBroadcastModeLabel(row.mode) }}</td>
              <td class="wf-td">{{ row.hostName }}</td>
              <td class="wf-td">{{ row.hostId }}</td>
              <td class="wf-td">{{ formatLiveBroadcastGame(row) }}</td>
              <td class="wf-td">{{ row.category }}</td>
              <td class="wf-td">{{ liveBroadcastStatusLabel(row.status) }}</td>
              <td
                v-for="col in LIVE_BROADCAST_METRIC_COLUMNS"
                :key="`${row.roomId}-${col.key}`"
                class="wf-td lbl-metric"
              >
                <template v-if="col.key === 'people'">
                  <p class="lbl-metric__line">总数 {{ formatLiveBroadcastMetric(liveBroadcastPeopleTotal(row.metrics.people)) }}</p>
                  <p class="lbl-metric__line">基准 {{ formatLiveBroadcastMetric(row.metrics.people.base) }}</p>
                  <p class="lbl-metric__line">虚拟 {{ formatLiveBroadcastMetric(row.metrics.people.virtual) }}</p>
                  <p class="lbl-metric__line">会员 {{ formatLiveBroadcastMetric(row.metrics.people.member) }}</p>
                  <p class="lbl-metric__line">游客 {{ formatLiveBroadcastMetric(row.metrics.people.guest) }}</p>
                </template>
                <template v-else>
                  <p class="lbl-metric__line">总数 {{ formatLiveBroadcastMetric(liveBroadcastMetricTotal(row.metrics[col.key])) }}</p>
                  <p class="lbl-metric__line">基准 {{ formatLiveBroadcastMetric(row.metrics[col.key].base) }}</p>
                  <p class="lbl-metric__line">实际 {{ formatLiveBroadcastMetric(row.metrics[col.key].actual) }}</p>
                </template>
              </td>
              <td class="wf-td wf-td--actions wf-td--center">
                <button type="button" class="wf-link-action" @click="enterRoom">进入直播间</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="lbl-card-wrap">
        <p v-if="!pageRows.length" class="wf-td--empty">暂无数据</p>
        <article v-for="row in pageRows" :key="row.roomId" class="lbl-card">
          <img :src="row.cover" :alt="row.hostName" class="lbl-card__cover" />
          <div class="lbl-card__body">
            <h2 class="lbl-card__name">{{ row.hostName }}</h2>
            <p class="lbl-card__meta">直播间ID {{ row.roomId }}</p>
            <p class="lbl-card__meta">
              {{ liveBroadcastModeLabel(row.mode) }} · {{ row.category }} · {{ liveBroadcastStatusLabel(row.status) }}
            </p>
            <p class="lbl-card__meta">{{ formatLiveBroadcastGame(row) }}</p>
            <div class="lbl-card__metrics">
              <p v-for="col in LIVE_BROADCAST_METRIC_COLUMNS" :key="col.key" class="lbl-card__metric">
                {{ col.label }}
                <template v-if="col.key === 'people'">
                  <span>总数 {{ formatLiveBroadcastMetric(liveBroadcastPeopleTotal(row.metrics.people)) }}</span>
                  <span>基准 {{ formatLiveBroadcastMetric(row.metrics.people.base) }}</span>
                  <span>虚拟 {{ formatLiveBroadcastMetric(row.metrics.people.virtual) }}</span>
                  <span>会员 {{ formatLiveBroadcastMetric(row.metrics.people.member) }}</span>
                  <span>游客 {{ formatLiveBroadcastMetric(row.metrics.people.guest) }}</span>
                </template>
                <template v-else>
                  <span>总数 {{ formatLiveBroadcastMetric(liveBroadcastMetricTotal(row.metrics[col.key])) }}</span>
                  <span>基准 {{ formatLiveBroadcastMetric(row.metrics[col.key].base) }}</span>
                  <span>实际 {{ formatLiveBroadcastMetric(row.metrics[col.key].actual) }}</span>
                </template>
              </p>
            </div>
            <button type="button" class="wf-link-action" @click="enterRoom">进入直播间</button>
          </div>
        </article>
      </div>

      <div class="wf-pagination lbl-pagination">
        <span>共 {{ total }} 条</span>
        <select v-model.number="pageSize" class="wf-input wf-input--select lbl-pagination__size">
          <option v-for="size in LIVE_BROADCAST_PAGE_SIZE_OPTIONS" :key="size" :value="size">
            {{ size }}条/页
          </option>
        </select>
        <button
          type="button"
          class="lbl-page-btn"
          :disabled="page <= 1"
          aria-label="上一页"
          @click="goPage(page - 1)"
        >
          ‹
        </button>
        <button
          v-for="num in pageNumbers"
          :key="num"
          type="button"
          class="lbl-page-btn"
          :class="{ 'lbl-page-btn--active': num === page }"
          @click="goPage(num)"
        >
          {{ num }}
        </button>
        <button
          type="button"
          class="lbl-page-btn"
          :disabled="page >= totalPages"
          aria-label="下一页"
          @click="goPage(page + 1)"
        >
          ›
        </button>
        <span class="lbl-pagination__jump">
          前往
          <input
            v-model="jumpInput"
            type="text"
            class="wf-input lbl-pagination__jump-input"
            @keydown.enter.prevent="jumpToPage"
            @blur="jumpToPage"
          />
          页
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lbl-table {
  table-layout: auto;
  min-width: 1280px;
}

.wf-table .wf-th--op {
  width: 108px;
}

.lbl-th-metric,
.lbl-metric {
  min-width: 118px;
}

.lbl-th-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lbl-metric {
  word-break: keep-all;
  overflow-wrap: normal;
}

.lbl-card-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.lbl-card {
  border: 1px solid var(--pc-border-light);
  background: var(--pc-bg-page);
}

.lbl-card__cover {
  display: block;
  width: 100%;
  height: 124px;
  object-fit: cover;
  background: var(--pc-bg-table-head);
}

.lbl-card__body {
  padding: 10px 12px 12px;
}

.lbl-card__name {
  margin: 0 0 6px;
  font-size: var(--pc-font-size);
  font-weight: 600;
  color: var(--pc-text);
}

.lbl-card__meta {
  margin: 0 0 4px;
  color: var(--pc-text-secondary);
  font-size: var(--pc-font-size-sm);
  word-break: break-word;
}

.lbl-metric__line {
  margin: 0;
  line-height: 1.5;
}

.lbl-card__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  margin: 4px 0 8px;
}

.lbl-card__metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  color: var(--pc-text);
  font-size: var(--pc-font-size-sm);
  line-height: 1.5;
}

.lbl-pagination {
  justify-content: flex-end;
  gap: 8px;
  padding: 0 16px;
}

.lbl-pagination__size {
  width: 96px;
}

.lbl-pagination__jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lbl-pagination__jump-input {
  width: 48px;
  text-align: center;
}

.lbl-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--pc-border);
  border-radius: var(--pc-radius);
  background: var(--pc-bg-page);
  color: var(--pc-text);
  cursor: pointer;
}

.lbl-page-btn:disabled {
  color: var(--pc-text-muted);
  cursor: not-allowed;
}

.lbl-page-btn--active {
  border-color: var(--pc-primary);
  background: var(--pc-primary);
  color: #fff;
}
</style>
