<script setup lang="ts">
import { computed, ref } from 'vue'
import '../styles/pc-wireframe.css'

type TabKey = 'anchor' | 'specificUser' | 'platform'

/** 佣金结算模式 */
type CommissionMode = 'both' | 'game' | 'gift' | 'none'

const activeTab = ref<TabKey>('anchor')

const COMMISSION_MODE_OPTIONS: { value: CommissionMode; label: string }[] = [
  { value: 'both', label: '游戏返佣+礼物打赏' },
  { value: 'game', label: '仅游戏返佣' },
  { value: 'gift', label: '仅礼物打赏' },
  { value: 'none', label: '无' },
]

function modeIncludesGift(mode: CommissionMode) {
  return mode === 'both' || mode === 'gift'
}

function modeIncludesGame(mode: CommissionMode) {
  return mode === 'both' || mode === 'game'
}

type AnchorRow = {
  id: string
  hostId: string
  nickname: string
  commissionMode: CommissionMode
  giftSharePercent: number
  gameRebatePercent: number
}

type SpecificUserRow = {
  id: string
  userId: string
  nickname: string
  commissionMode: CommissionMode
  giftSharePercent: number
  gameRebatePercent: number
}

type PlatformChannelRow = {
  id: string
  channelId: string
  channelName: string
  commissionMode: CommissionMode
  giftSharePercent: number
  gameRebatePercent: number
  deletable: boolean
}

const anchorFilter = ref({ hostId: '' })
const specificFilter = ref({ userId: '' })
const platformFilter = ref({ channel: '' })

const anchorSource = ref<AnchorRow[]>([
  {
    id: 'a1',
    hostId: '3180664521199420601',
    nickname: 'UI',
    commissionMode: 'both',
    giftSharePercent: 55,
    gameRebatePercent: 12,
  },
  {
    id: 'a2',
    hostId: '3180664521199420602',
    nickname: '小旋风_直播',
    commissionMode: 'gift',
    giftSharePercent: 55,
    gameRebatePercent: 0,
  },
])

const specificSource = ref<SpecificUserRow[]>([
  {
    id: 's1',
    userId: '3180664521199420601',
    nickname: 'UI',
    commissionMode: 'both',
    giftSharePercent: 55,
    gameRebatePercent: 10,
  },
  {
    id: 's2',
    userId: '3180664521199420602',
    nickname: '小旋风_直播',
    commissionMode: 'gift',
    giftSharePercent: 55,
    gameRebatePercent: 0,
  },
])

const platformSource = ref<PlatformChannelRow[]>([
  {
    id: 'p1',
    channelId: '全平台',
    channelName: '全平台',
    commissionMode: 'both',
    giftSharePercent: 55,
    gameRebatePercent: 10,
    deletable: false,
  },
  {
    id: 'p2',
    channelId: '3180664521199420601',
    channelName: '平台自营',
    commissionMode: 'gift',
    giftSharePercent: 55,
    gameRebatePercent: 0,
    deletable: true,
  },
  {
    id: 'p3',
    channelId: '3180664521199420602',
    channelName: '渠道A',
    commissionMode: 'game',
    giftSharePercent: 0,
    gameRebatePercent: 15,
    deletable: true,
  },
])

const platformChannelOptions = computed(() => [
  { value: '', label: '请选择' },
  ...platformSource.value
    .filter((r) => r.deletable)
    .map((r) => ({ value: r.channelId, label: r.channelName })),
])

const anchorRows = computed(() => {
  const q = anchorFilter.value.hostId.trim()
  if (!q) return anchorSource.value
  return anchorSource.value.filter((r) => r.hostId.includes(q))
})

const specificRows = computed(() => {
  const q = specificFilter.value.userId.trim()
  if (!q) return specificSource.value
  return specificSource.value.filter((r) => r.userId.includes(q))
})

const platformRows = computed(() => {
  const q = platformFilter.value.channel
  if (!q) return platformSource.value
  return platformSource.value.filter((r) => r.channelId === q || r.channelName === q)
})

function clearAnchorFilter() {
  anchorFilter.value.hostId = ''
}

function clearSpecificFilter() {
  specificFilter.value.userId = ''
}

function clearPlatformFilter() {
  platformFilter.value.channel = ''
}

/** 弹框 · 新增特定用户 */
type QueriedUser = {
  username: string
  userId: string
  kingKongId: string
}

const MOCK_USER_DIRECTORY: Record<string, QueriedUser> = {
  '3180664521199420601': {
    username: 'UI',
    userId: '3180664521199420601',
    kingKongId: 'KK100886',
  },
  '3180664521199420602': {
    username: '小旋风_直播',
    userId: '3180664521199420602',
    kingKongId: 'KK203415',
  },
  '3180664521199420999': {
    username: '南岸听风',
    userId: '3180664521199420999',
    kingKongId: 'KK778201',
  },
}

const addSpecificModalVisible = ref(false)
const addSpecificQueryId = ref('')
const addSpecificQueried = ref<QueriedUser | null>(null)
const addSpecificQuerying = ref(false)
const addSpecificQueryHint = ref('')
const addSpecificCommissionMode = ref<CommissionMode>('both')
const addSpecificGiftPercent = ref(55)
const addSpecificGamePercent = ref(10)

function resetAddSpecificModal() {
  addSpecificQueryId.value = ''
  addSpecificQueried.value = null
  addSpecificQuerying.value = false
  addSpecificQueryHint.value = ''
  addSpecificCommissionMode.value = 'both'
  addSpecificGiftPercent.value = 55
  addSpecificGamePercent.value = 10
}

function openAddSpecificModal() {
  resetAddSpecificModal()
  addSpecificModalVisible.value = true
}

function closeAddSpecificModal() {
  addSpecificModalVisible.value = false
  resetAddSpecificModal()
}

async function queryAddSpecificUser() {
  const id = addSpecificQueryId.value.trim()
  addSpecificQueryHint.value = ''
  addSpecificQueried.value = null
  if (!id) {
    addSpecificQueryHint.value = '请输入用户 ID'
    return
  }
  addSpecificQuerying.value = true
  await new Promise((r) => setTimeout(r, 400))
  addSpecificQuerying.value = false
  const found = MOCK_USER_DIRECTORY[id]
  if (!found) {
    addSpecificQueryHint.value = '未查询到该用户，请核对 ID 后重试'
    return
  }
  if (specificSource.value.some((r) => r.userId === found.userId)) {
    addSpecificQueryHint.value = '该用户已在特定用户列表中'
    return
  }
  addSpecificQueried.value = { ...found }
}

function removeAddSpecificQueried() {
  addSpecificQueried.value = null
}

function confirmAddSpecificUser() {
  if (!addSpecificQueried.value) {
    addSpecificQueryHint.value = '请先查询并确认要添加的用户'
    return
  }
  const mode = addSpecificCommissionMode.value
  if (modeIncludesGift(mode) && (addSpecificGiftPercent.value < 0 || addSpecificGiftPercent.value > 100)) {
    addSpecificQueryHint.value = '用户礼物分成比例需在 0～100 之间'
    return
  }
  if (modeIncludesGame(mode) && (addSpecificGamePercent.value < 0 || addSpecificGamePercent.value > 100)) {
    addSpecificQueryHint.value = '游戏返佣比例需在 0～100 之间'
    return
  }
  const u = addSpecificQueried.value
  specificSource.value.push({
    id: `s_${Date.now()}`,
    userId: u.userId,
    nickname: u.username,
    commissionMode: mode,
    giftSharePercent: modeIncludesGift(mode) ? addSpecificGiftPercent.value : 0,
    gameRebatePercent: modeIncludesGame(mode) ? addSpecificGamePercent.value : 0,
  })
  closeAddSpecificModal()
}

function removeSpecific(id: string) {
  specificSource.value = specificSource.value.filter((r) => r.id !== id)
}

function removePlatform(id: string) {
  platformSource.value = platformSource.value.filter((r) => r.id !== id)
}

/** 弹框 · 新增渠道配置 */
type ChannelOption = {
  channelId: string
  channelName: string
}

const MOCK_CHANNEL_DIRECTORY: ChannelOption[] = [
  { channelId: '3180664521199420701', channelName: '渠道B' },
  { channelId: '3180664521199420702', channelName: '渠道C' },
  { channelId: 'h5', channelName: 'H5 / Web' },
  { channelId: 'mini_program', channelName: '微信小程序' },
  { channelId: 'android_store', channelName: '应用商店包' },
]

const addPlatformModalVisible = ref(false)
const addPlatformSelectedChannelId = ref('')
const addPlatformQueryHint = ref('')
const addPlatformCommissionMode = ref<CommissionMode>('both')
const addPlatformGiftPercent = ref(55)
const addPlatformGamePercent = ref(10)

const addPlatformChannelDropdownOptions = computed(() => [
  { value: '', label: '请选择渠道' },
  ...MOCK_CHANNEL_DIRECTORY.filter(
    (c) => !platformSource.value.some((r) => r.channelId === c.channelId),
  ).map((c) => ({
    value: c.channelId,
    label: c.channelName,
  })),
])

function resetAddPlatformModal() {
  addPlatformSelectedChannelId.value = ''
  addPlatformQueryHint.value = ''
  addPlatformCommissionMode.value = 'both'
  addPlatformGiftPercent.value = 55
  addPlatformGamePercent.value = 10
}

function openAddPlatformModal() {
  resetAddPlatformModal()
  addPlatformModalVisible.value = true
}

function closeAddPlatformModal() {
  addPlatformModalVisible.value = false
  resetAddPlatformModal()
}

function confirmAddPlatformChannel() {
  addPlatformQueryHint.value = ''
  const id = addPlatformSelectedChannelId.value
  if (!id) {
    addPlatformQueryHint.value = '请选择渠道'
    return
  }
  const ch = MOCK_CHANNEL_DIRECTORY.find((c) => c.channelId === id)
  if (!ch) {
    addPlatformQueryHint.value = '未找到该渠道信息'
    return
  }
  if (platformSource.value.some((r) => r.channelId === ch.channelId)) {
    addPlatformQueryHint.value = '该渠道已在配置列表中'
    return
  }
  const mode = addPlatformCommissionMode.value
  if (modeIncludesGift(mode) && (addPlatformGiftPercent.value < 0 || addPlatformGiftPercent.value > 100)) {
    addPlatformQueryHint.value = '用户礼物分成比例需在 0～100 之间'
    return
  }
  if (modeIncludesGame(mode) && (addPlatformGamePercent.value < 0 || addPlatformGamePercent.value > 100)) {
    addPlatformQueryHint.value = '游戏返佣比例需在 0～100 之间'
    return
  }
  platformSource.value.push({
    id: `p_${Date.now()}`,
    channelId: ch.channelId,
    channelName: ch.channelName,
    commissionMode: mode,
    giftSharePercent: modeIncludesGift(mode) ? addPlatformGiftPercent.value : 0,
    gameRebatePercent: modeIncludesGame(mode) ? addPlatformGamePercent.value : 0,
    deletable: true,
  })
  closeAddPlatformModal()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <!-- Tab 切换三块内容 -->
    <div class="wf-top">
      <div class="wf-tabs">
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'anchor' }"
          @click="activeTab = 'anchor'"
        >
          主播配置
        </button>
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'specificUser' }"
          @click="activeTab = 'specificUser'"
        >
          特定用户配置
        </button>
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'platform' }"
          @click="activeTab = 'platform'"
        >
          平台用户配置
        </button>
      </div>
      <div class="wf-notice">
        <span class="wf-notice-label">礼物比例匹配优先级：</span>
        礼物结算给用户时，按照该优先级读取配置进行结算【
        <strong>主播配置</strong>
        ＞
        <strong>特定用户配置</strong>
        ＞
        <strong>平台用户配置</strong>
        】；游戏返佣与礼物打赏的佣金模式、比例字段均适用同一优先级。
      </div>
    </div>

    <!-- 主播配置 -->
    <template v-if="activeTab === 'anchor'">
      <section class="wf-block">
        <div class="wf-toolbar">
          <label class="wf-label">主播ID：</label>
          <input
            v-model="anchorFilter.hostId"
            type="text"
            class="wf-input"
            placeholder="请输入用户ID"
          />
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="clearAnchorFilter">清除</button>
        </div>

        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">主播ID</th>
              <th class="wf-th">昵称</th>
              <th class="wf-th">佣金模式</th>
              <th class="wf-th">主播礼物分成比例</th>
              <th class="wf-th">游戏返佣比例</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in anchorRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.hostId }}</td>
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">
                <select v-model="row.commissionMode" class="wf-select">
                  <option
                    v-for="opt in COMMISSION_MODE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGift(row.commissionMode)">
                  <input
                    v-model.number="row.giftSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGame(row.commissionMode)">
                  <input
                    v-model.number="row.gameRebatePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
            </tr>
            <tr v-if="anchorRows.length === 0">
              <td colspan="6" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="wf-pagination">分页组件</div>
      </section>
    </template>

    <!-- 特定用户配置 -->
    <template v-else-if="activeTab === 'specificUser'">
      <section class="wf-block">
        <div class="wf-toolbar">
          <label class="wf-label">用户ID：</label>
          <input
            v-model="specificFilter.userId"
            type="text"
            class="wf-input"
            placeholder="请输入用户ID"
          />
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="clearSpecificFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openAddSpecificModal">新增特定用户</button>
        </div>

        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">昵称</th>
              <th class="wf-th">佣金模式</th>
              <th class="wf-th">用户礼物分成比例</th>
              <th class="wf-th">游戏返佣比例</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in specificRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.userId }}</td>
              <td class="wf-td">{{ row.nickname }}</td>
              <td class="wf-td">
                <select v-model="row.commissionMode" class="wf-select">
                  <option
                    v-for="opt in COMMISSION_MODE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGift(row.commissionMode)">
                  <input
                    v-model.number="row.giftSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGame(row.commissionMode)">
                  <input
                    v-model.number="row.gameRebatePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-del" @click="removeSpecific(row.id)">删除</button>
              </td>
            </tr>
            <tr v-if="specificRows.length === 0">
              <td colspan="7" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="wf-pagination">分页组件</div>
      </section>
    </template>

    <!-- 平台用户配置 -->
    <template v-else>
      <section class="wf-block">
        <div class="wf-toolbar wf-toolbar--platform">
          <label class="wf-label">渠道：</label>
          <select v-model="platformFilter.channel" class="wf-input wf-input--select">
            <option v-for="opt in platformChannelOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="clearPlatformFilter">清除</button>
          <button type="button" class="wf-btn wf-btn--add" @click="openAddPlatformModal">新增渠道配置</button>
          <p class="wf-tip">
            注意：未单独配置渠道的礼物分成比例，统一走平台默认比例。
          </p>
        </div>

        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">渠道ID</th>
              <th class="wf-th">渠道名</th>
              <th class="wf-th">佣金模式</th>
              <th class="wf-th">用户礼物分成比例</th>
              <th class="wf-th">游戏返佣比例</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in platformRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.channelId }}</td>
              <td class="wf-td">{{ row.channelName }}</td>
              <td class="wf-td">
                <select v-model="row.commissionMode" class="wf-select">
                  <option
                    v-for="opt in COMMISSION_MODE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGift(row.commissionMode)">
                  <input
                    v-model.number="row.giftSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td">
                <template v-if="modeIncludesGame(row.commissionMode)">
                  <input
                    v-model.number="row.gameRebatePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                  />
                  <span class="wf-pct">%</span>
                </template>
                <span v-else class="wf-muted">—</span>
              </td>
              <td class="wf-td wf-td--center">
                <span v-if="!row.deletable" class="wf-muted">不可删除</span>
                <button v-else type="button" class="wf-link-del" @click="removePlatform(row.id)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="wf-pagination">分页组件</div>
      </section>
    </template>

    <!-- 新增特定用户弹框 -->
    <Teleport to="body">
      <div
        v-if="addSpecificModalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeAddSpecificModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="add-specific-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="add-specific-title" class="wf-modal__title">新增特定用户</h3>
            <button
              type="button"
              class="wf-modal__close"
              aria-label="关闭"
              @click="closeAddSpecificModal"
            >
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <div class="wf-modal__query">
              <label class="wf-label">用户ID：</label>
              <input
                v-model="addSpecificQueryId"
                type="text"
                class="wf-input"
                placeholder="请输入用户ID"
                @keyup.enter="queryAddSpecificUser"
              />
              <button
                type="button"
                class="wf-btn wf-btn--primary"
                :disabled="addSpecificQuerying"
                @click="queryAddSpecificUser"
              >
                {{ addSpecificQuerying ? '查询中…' : '查询' }}
              </button>
            </div>
            <p v-if="addSpecificQueryHint" class="wf-modal__hint">{{ addSpecificQueryHint }}</p>

            <table class="wf-table wf-table--modal">
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th wf-th--op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="addSpecificQueried">
                  <td class="wf-td">{{ addSpecificQueried.username }}</td>
                  <td class="wf-td">{{ addSpecificQueried.userId }}</td>
                  <td class="wf-td">{{ addSpecificQueried.kingKongId }}</td>
                  <td class="wf-td wf-td--center">
                    <button type="button" class="wf-link-del" @click="removeAddSpecificQueried">
                      移除
                    </button>
                  </td>
                </tr>
                <tr v-else>
                  <td colspan="4" class="wf-td wf-td--empty">请先输入用户 ID 并点击查询</td>
                </tr>
              </tbody>
            </table>

            <div
              class="wf-modal__commission"
              :class="{ 'wf-modal__commission--disabled': !addSpecificQueried }"
            >
              <div class="wf-modal__field">
                <label class="wf-modal__field-label">佣金模式</label>
                <select
                  v-model="addSpecificCommissionMode"
                  class="wf-select wf-select--full"
                  :disabled="!addSpecificQueried"
                >
                  <option
                    v-for="opt in COMMISSION_MODE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div
                v-if="modeIncludesGift(addSpecificCommissionMode)"
                class="wf-modal__field"
              >
                <label class="wf-modal__field-label">用户礼物分成比例</label>
                <div class="wf-modal__pct-row">
                  <input
                    v-model.number="addSpecificGiftPercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                    :disabled="!addSpecificQueried"
                  />
                  <span class="wf-pct">%</span>
                </div>
              </div>
              <div
                v-if="modeIncludesGame(addSpecificCommissionMode)"
                class="wf-modal__field"
              >
                <label class="wf-modal__field-label">游戏返佣比例</label>
                <div class="wf-modal__pct-row">
                  <input
                    v-model.number="addSpecificGamePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    class="wf-input wf-input--pct"
                    :disabled="!addSpecificQueried"
                  />
                  <span class="wf-pct">%</span>
                </div>
              </div>
            </div>
            <p v-if="!addSpecificQueried" class="wf-modal__commission-tip">
              查询到用户后可配置佣金模式与分成比例
            </p>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeAddSpecificModal">
              取消
            </button>
            <button
              type="button"
              class="wf-btn wf-btn--primary"
              :disabled="!addSpecificQueried"
              @click="confirmAddSpecificUser"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 新增渠道配置弹框 -->
    <Teleport to="body">
      <div
        v-if="addPlatformModalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeAddPlatformModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="add-platform-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="add-platform-title" class="wf-modal__title">新增渠道配置</h3>
            <button
              type="button"
              class="wf-modal__close"
              aria-label="关闭"
              @click="closeAddPlatformModal"
            >
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <div class="wf-modal__query">
              <label class="wf-label">渠道：</label>
              <select
                v-model="addPlatformSelectedChannelId"
                class="wf-input wf-input--select wf-input--channel"
              >
                <option
                  v-for="opt in addPlatformChannelDropdownOptions"
                  :key="opt.value || 'empty'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <p v-if="addPlatformQueryHint" class="wf-modal__hint">{{ addPlatformQueryHint }}</p>

            <div
              class="wf-modal__commission"
              :class="{ 'wf-modal__commission--disabled': !addPlatformSelectedChannelId }"
            >
              <div class="wf-modal__field">
                <label class="wf-modal__field-label">佣金模式</label>
                <select
                  v-model="addPlatformCommissionMode"
                  class="wf-select wf-select--full"
                  :disabled="!addPlatformSelectedChannelId"
                >
                  <option
                    v-for="opt in COMMISSION_MODE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div
                v-if="modeIncludesGift(addPlatformCommissionMode)"
                class="wf-modal__field"
              >
                <label class="wf-modal__field-label">用户礼物分成比例</label>
                <div class="wf-modal__pct-row">
                  <input
                    v-model.number="addPlatformGiftPercent"
                    type="number"
                    min="0"
                    max="100"
                    class="wf-input wf-input--pct"
                    :disabled="!addPlatformSelectedChannelId"
                  />
                  <span class="wf-pct">%</span>
                </div>
              </div>
              <div
                v-if="modeIncludesGame(addPlatformCommissionMode)"
                class="wf-modal__field"
              >
                <label class="wf-modal__field-label">游戏返佣比例</label>
                <div class="wf-modal__pct-row">
                  <input
                    v-model.number="addPlatformGamePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    class="wf-input wf-input--pct"
                    :disabled="!addPlatformSelectedChannelId"
                  />
                  <span class="wf-pct">%</span>
                </div>
              </div>
            </div>
            <p v-if="!addPlatformSelectedChannelId" class="wf-modal__commission-tip">
              选择渠道后可配置佣金模式与分成比例
            </p>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeAddPlatformModal">
              取消
            </button>
            <button
              type="button"
              class="wf-btn wf-btn--primary"
              :disabled="!addPlatformSelectedChannelId"
              @click="confirmAddPlatformChannel"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
