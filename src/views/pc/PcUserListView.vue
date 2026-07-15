<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  channelLabel,
  maskPhone,
  MOCK_USER_LIST_ROWS,
  sourceLabel,
  USER_CHANNEL_OPTIONS,
  USER_GENDER_OPTIONS,
  USER_REGISTER_PLATFORM_OPTIONS,
  USER_SOURCE_OPTIONS,
  USER_STATUS_OPTIONS,
  type UserAccountStatus,
  type UserChannel,
  type UserGender,
  type UserListRow,
  type UserRegisterPlatform,
  type UserSource,
} from '../../constants/userList'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  status: '' | UserAccountStatus
  gender: '' | UserGender
  userId: string
  inviteCode: string
  phone: string
  kingKongId: string
  startDate: string
  endDate: string
  source: '' | UserSource
  channel: '' | UserChannel
  registerPlatform: '' | UserRegisterPlatform
}

const router = useRouter()

const defaultFilter = (): ListFilter => ({
  status: '',
  gender: '',
  userId: '',
  inviteCode: '',
  phone: '',
  kingKongId: '',
  startDate: '',
  endDate: '',
  source: '',
  channel: '',
  registerPlatform: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const rows = ref<UserListRow[]>(MOCK_USER_LIST_ROWS.map((row) => ({ ...row })))
const selectedIds = ref<string[]>([])
const actionHint = ref('')
const filterHint = ref('')

const thirdPartyVisible = ref(false)
const thirdPartyRows = ref<UserListRow[]>([])

const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
let confirmAction: (() => void) | null = null

function applyFilter() {
  if (filter.value.startDate && filter.value.endDate && filter.value.startDate > filter.value.endDate) {
    filterHint.value = '结束日期不能早于开始日期'
    return
  }
  filterHint.value = ''
  actionHint.value = ''
  appliedFilter.value = { ...filter.value }
  selectedIds.value = []
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
  filterHint.value = ''
  actionHint.value = ''
  selectedIds.value = []
}

function matchRow(row: UserListRow) {
  const f = appliedFilter.value
  if (f.status && row.status !== f.status) return false
  if (f.gender && row.gender !== f.gender) return false
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.inviteCode && !row.inviteCode.includes(f.inviteCode.trim())) return false
  if (f.phone && !row.phone.includes(f.phone.trim())) return false
  if (f.kingKongId && !row.kingKongId.toLowerCase().includes(f.kingKongId.trim().toLowerCase())) {
    return false
  }
  if (f.source && row.source !== f.source) return false
  if (f.channel && row.channel !== f.channel) return false
  if (f.registerPlatform && row.registerPlatform !== f.registerPlatform) return false
  if (f.startDate && row.registeredAt.slice(0, 10) < f.startDate) return false
  if (f.endDate && row.registeredAt.slice(0, 10) > f.endDate) return false
  return true
}

const filteredRows = computed(() => rows.value.filter(matchRow))

const allPageSelected = computed(
  () => filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedIds.value.includes(row.id)),
)

function toggleSelectAll(checked: boolean) {
  if (checked) {
    selectedIds.value = filteredRows.value.map((row) => row.id)
    return
  }
  selectedIds.value = []
}

function toggleRow(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
    return
  }
  selectedIds.value = selectedIds.value.filter((item) => item !== id)
}

function selectedRows() {
  return rows.value.filter((row) => selectedIds.value.includes(row.id))
}

function openConfirm(title: string, message: string, action: () => void) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction = action
  confirmVisible.value = true
}

function closeConfirm() {
  confirmVisible.value = false
  confirmTitle.value = ''
  confirmMessage.value = ''
  confirmAction = null
}

function submitConfirm() {
  confirmAction?.()
  closeConfirm()
}

function batchSetStatus(next: UserAccountStatus) {
  const picked = selectedRows()
  if (!picked.length) {
    actionHint.value = '请先勾选用户'
    return
  }
  const operable = picked.filter((row) => !row.deleted)
  if (!operable.length) {
    actionHint.value = '已删除用户不可批量变更状态'
    return
  }
  const label = next === 'enabled' ? '启用' : '禁用'
  openConfirm(`批量${label}`, `确认将已选 ${operable.length} 个用户设为「${label}」？`, () => {
    const idSet = new Set(operable.map((row) => row.id))
    rows.value = rows.value.map((row) => (idSet.has(row.id) ? { ...row, status: next } : row))
    actionHint.value = `已批量${label} ${operable.length} 个用户`
    if (picked.length !== operable.length) {
      actionHint.value += `（已跳过 ${picked.length - operable.length} 个已删除）`
    }
  })
}

function exportRows() {
  const count = filteredRows.value.length
  if (!count) {
    actionHint.value = '暂无数据可导出'
    return
  }
  actionHint.value = `已模拟导出当前 ${count} 条记录`
}

function openThirdParty() {
  const picked = selectedRows()
  if (!picked.length) {
    actionHint.value = '请先勾选用户'
    return
  }
  actionHint.value = ''
  thirdPartyRows.value = picked
  thirdPartyVisible.value = true
}

function closeThirdParty() {
  thirdPartyVisible.value = false
  thirdPartyRows.value = []
}

function toggleStatus(row: UserListRow) {
  if (row.deleted) {
    actionHint.value = '已删除用户不可变更状态'
    return
  }
  const next: UserAccountStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  const label = next === 'enabled' ? '启用' : '禁用'
  openConfirm(label, `确认${label}用户 ${row.userId}？`, () => {
    rows.value = rows.value.map((item) => (item.id === row.id ? { ...item, status: next } : item))
    actionHint.value = `已${label}用户 ${row.userId}`
  })
}

function goDetail(row: UserListRow) {
  void router.push({ name: 'pc-user-detail', query: { userId: row.userId } })
}

function resetPassword(row: UserListRow) {
  if (row.deleted) {
    actionHint.value = '已删除用户不可重置密码'
    return
  }
  openConfirm('重置密码', `确认重置用户 ${row.userId} 的登录密码？`, () => {
    actionHint.value = `已重置用户 ${row.userId} 的登录密码（原型模拟）`
  })
}

function unlockUser(row: UserListRow) {
  if (row.deleted) {
    actionHint.value = '已删除用户不可解锁'
    return
  }
  if (!row.locked) {
    actionHint.value = `用户 ${row.userId} 未锁定`
    return
  }
  openConfirm('解锁', `确认解锁用户 ${row.userId}？`, () => {
    rows.value = rows.value.map((item) => (item.id === row.id ? { ...item, locked: false } : item))
    actionHint.value = `已解锁用户 ${row.userId}`
  })
}

function resetSecurityPassword(row: UserListRow) {
  if (row.deleted) {
    actionHint.value = '已删除用户不可重置安全密码'
    return
  }
  openConfirm('重置安全密码', `确认重置用户 ${row.userId} 的安全密码？`, () => {
    actionHint.value = `已重置用户 ${row.userId} 的安全密码（原型模拟）`
  })
}

function deleteUser(row: UserListRow) {
  if (row.deleted) return
  openConfirm('删除用户', `确认删除用户 ${row.userId}？删除后不可恢复操作（原型软删除）。`, () => {
    rows.value = rows.value.map((item) =>
      item.id === row.id ? { ...item, deleted: true, status: 'disabled' } : item,
    )
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
    actionHint.value = `已删除用户 ${row.userId}`
  })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option v-for="opt in USER_STATUS_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">性别：</label>
        <select v-model="filter.gender" class="wf-input wf-input--select">
          <option v-for="opt in USER_GENDER_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">邀请码：</label>
        <input v-model="filter.inviteCode" type="text" class="wf-input" placeholder="请输入邀请码" />

        <label class="wf-label">手机号码：</label>
        <input v-model="filter.phone" type="text" class="wf-input" placeholder="请输入手机号码" />

        <label class="wf-label">金刚号：</label>
        <input v-model="filter.kingKongId" type="text" class="wf-input" placeholder="请输入金刚号" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">注册时间：</label>
        <input v-model="filter.startDate" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.endDate" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">来源：</label>
        <select v-model="filter.source" class="wf-input wf-input--select">
          <option v-for="opt in USER_SOURCE_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">渠道：</label>
        <select v-model="filter.channel" class="wf-input wf-input--select">
          <option v-for="opt in USER_CHANNEL_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">注册平台：</label>
        <select v-model="filter.registerPlatform" class="wf-input wf-input--select">
          <option
            v-for="opt in USER_REGISTER_PLATFORM_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar user-list__toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
          <button type="button" class="wf-btn user-list__btn--enable" @click="batchSetStatus('enabled')">
            启用
          </button>
          <button type="button" class="wf-btn user-list__btn--disable" @click="batchSetStatus('disabled')">
            禁用
          </button>
          <button type="button" class="wf-btn user-list__btn--export" @click="exportRows">导出</button>
          <button type="button" class="wf-btn wf-btn--default" @click="openThirdParty">查询三方ID</button>
        </span>
        <p v-if="filterHint || actionHint" class="wf-modal__hint">{{ filterHint || actionHint }}</p>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table user-list__table">
          <thead>
            <tr>
              <th class="wf-th wf-th--check">
                <input
                  type="checkbox"
                  :checked="allPageSelected"
                  :disabled="!filteredRows.length"
                  @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">用户ID</th>
              <th class="wf-th">金刚号</th>
              <th class="wf-th">来源</th>
              <th class="wf-th">所属渠道</th>
              <th class="wf-th">昵称</th>
              <th class="wf-th">邀请码</th>
              <th class="wf-th">手机号码</th>
              <th class="wf-th">签名</th>
              <th class="wf-th">好友数</th>
              <th class="wf-th">最近上线时间</th>
              <th class="wf-th">注册时间</th>
              <th class="wf-th wf-th--op">管理</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="14" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleRow(row.id, ($event.target as HTMLInputElement).checked)"
                />
              </td>
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--bill">{{ row.userId }}</td>
              <td class="wf-td">{{ row.kingKongId }}</td>
              <td class="wf-td">{{ sourceLabel(row.source) }}</td>
              <td class="wf-td">{{ channelLabel(row.channel) }}</td>
              <td class="wf-td">{{ row.nickname || '-' }}</td>
              <td class="wf-td wf-td--center">{{ row.inviteCode }}</td>
              <td class="wf-td">{{ row.phone ? maskPhone(row.phone) : '-' }}</td>
              <td class="wf-td">{{ row.signature || '-' }}</td>
              <td class="wf-td wf-td--center">{{ row.friendCount }}</td>
              <td class="wf-td">{{ row.lastOnlineAt || '-' }}</td>
              <td class="wf-td">{{ row.registeredAt }}</td>
              <td class="wf-td wf-td--actions">
                <button
                  type="button"
                  class="wf-link-action"
                  :class="row.status === 'enabled' ? 'wf-link-action--danger' : 'user-list__link--enable'"
                  :disabled="row.deleted"
                  @click="toggleStatus(row)"
                >
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </button>
                <button type="button" class="wf-link-action" @click="goDetail(row)">查看详情</button>
                <button
                  type="button"
                  class="wf-link-action"
                  :disabled="row.deleted"
                  @click="resetPassword(row)"
                >
                  重置密码
                </button>
                <button
                  type="button"
                  class="wf-link-action"
                  :disabled="row.deleted"
                  @click="unlockUser(row)"
                >
                  解锁
                </button>
                <span class="user-list__muted">{{ row.realNameVerified ? '已实名' : '未实名' }}</span>
                <button
                  type="button"
                  class="wf-link-action"
                  :disabled="row.deleted"
                  @click="resetSecurityPassword(row)"
                >
                  重置安全密码
                </button>
                <button
                  v-if="!row.deleted"
                  type="button"
                  class="wf-link-action user-list__link--delete"
                  @click="deleteUser(row)"
                >
                  删除
                </button>
                <span v-else class="user-list__muted">已删除</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <!-- 查询三方 ID -->
    <div v-if="thirdPartyVisible" class="wf-modal-mask" @click.self="closeThirdParty">
      <div class="wf-modal wf-modal--scroll" role="dialog" aria-modal="true" aria-labelledby="third-party-title">
        <header class="wf-modal__header">
          <h3 id="third-party-title" class="wf-modal__title">查询三方ID</h3>
          <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeThirdParty">×</button>
        </header>
        <div class="wf-modal__body">
          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">三方ID</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in thirdPartyRows" :key="row.id">
                  <td class="wf-td wf-td--bill">{{ row.userId }}</td>
                  <td class="wf-td">{{ row.kingKongId }}</td>
                  <td class="wf-td">{{ row.thirdPartyId || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer class="wf-modal__footer">
          <button type="button" class="wf-btn wf-btn--default" @click="closeThirdParty">关闭</button>
        </footer>
      </div>
    </div>

    <!-- 确认弹框 -->
    <div v-if="confirmVisible" class="wf-modal-mask" @click.self="closeConfirm">
      <div class="wf-modal" role="dialog" aria-modal="true" aria-labelledby="user-confirm-title">
        <header class="wf-modal__header">
          <h3 id="user-confirm-title" class="wf-modal__title">{{ confirmTitle }}</h3>
          <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeConfirm">×</button>
        </header>
        <div class="wf-modal__body">
          <p>{{ confirmMessage }}</p>
        </div>
        <footer class="wf-modal__footer">
          <button type="button" class="wf-btn wf-btn--default" @click="closeConfirm">取消</button>
          <button type="button" class="wf-btn wf-btn--primary" @click="submitConfirm">确定</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list__toolbar {
  flex-wrap: wrap;
  gap: 8px 12px;
}

.user-list__btn--enable {
  border-color: #67c23a;
  background: #67c23a;
  color: #fff;
}

.user-list__btn--disable {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #f56c6c;
}

.user-list__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.user-list__table {
  table-layout: auto;
  min-width: 1680px;
}

.wf-th--check {
  width: 40px;
  text-align: center;
}

.user-list__table .wf-td--actions {
  min-width: 460px;
  white-space: nowrap;
}

.user-list__table .wf-td--actions .wf-link-action,
.user-list__table .wf-td--actions .user-list__muted {
  margin-right: 12px;
}

.user-list__link--enable {
  color: #67c23a;
}

.user-list__link--delete {
  color: var(--pc-text-muted);
}

.user-list__muted {
  color: var(--pc-text-muted);
  font-size: inherit;
}
</style>
