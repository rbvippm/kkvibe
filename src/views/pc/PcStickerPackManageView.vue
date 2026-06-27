<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  MOCK_STICKER_PACK_ROWS,
  STICKER_PACK_MAX_ITEMS,
  STICKER_PACK_STATUS_LABEL,
  STICKER_PACK_STATUS_OPTIONS,
  cloneStickerPackRow,
  formatStickerNow,
  parseEmojiKeywords,
  validateEmojiKeywords,
  type StickerPackItem,
  type StickerPackRow,
  type StickerPackStatus,
} from '../../constants/stickerManage'
import '../../styles/pc-wireframe.css'

const rows = ref<StickerPackRow[]>(MOCK_STICKER_PACK_ROWS.map(cloneStickerPackRow))

const filter = ref({
  name: '',
  status: '' as '' | StickerPackStatus,
  publishedStart: '',
  publishedEnd: '',
  creator: '',
})

const appliedFilter = ref({ ...filter.value })

const filteredRows = computed(() => {
  const f = appliedFilter.value
  return rows.value
    .filter((row) => {
      if (f.name && !row.name.includes(f.name.trim())) return false
      if (f.status && row.status !== f.status) return false
      if (f.creator && !row.creator.includes(f.creator.trim())) return false
      if (f.publishedStart || f.publishedEnd) {
        if (!row.publishedAt) return false
        const date = row.publishedAt.slice(0, 10)
        if (f.publishedStart && date < f.publishedStart) return false
        if (f.publishedEnd && date > f.publishedEnd) return false
      }
      return true
    })
    .sort((a, b) => a.sortWeight - b.sortWeight)
})

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = { name: '', status: '', publishedStart: '', publishedEnd: '', creator: '' }
  appliedFilter.value = { ...filter.value }
}

function canDelete(row: StickerPackRow) {
  return row.status === 'draft' || row.status === 'offline'
}

function toggleStatus(row: StickerPackRow) {
  if (row.status === 'online') {
    row.status = 'offline'
  } else if (row.status === 'offline') {
    row.status = 'online'
    if (!row.publishedAt) row.publishedAt = formatStickerNow()
  }
  row.updatedAt = formatStickerNow()
}

function removeRow(row: StickerPackRow) {
  if (!canDelete(row)) {
    window.alert('仅草稿或已下架状态的贴图包可删除')
    return
  }
  if (!window.confirm(`确定删除贴图包「${row.name}」吗？`)) return
  rows.value = rows.value.filter((item) => item.id !== row.id)
}

type ModalMode = 'add' | 'edit'

const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const formError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const form = ref({
  name: '',
  author: '',
  trayIcon: '',
  sortWeight: 50,
  items: [] as StickerPackItem[],
})

const PREVIEW_EMOJIS = ['😀', '😊', '🥳', '😎', '🤩', '😍', '🤗', '😋', '🙂', '😉']

function resetForm() {
  form.value = {
    name: '',
    author: '',
    trayIcon: '',
    sortWeight: 50,
    items: [],
  }
  formError.value = ''
}

function openAddModal() {
  modalMode.value = 'add'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

function openEditModal(row: StickerPackRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    name: row.name,
    author: row.author,
    trayIcon: row.trayIcon,
    sortWeight: row.sortWeight,
    items: row.items.map((item) => ({ ...item })),
  }
  formError.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  formError.value = ''
}

function mockTrayUpload() {
  form.value.trayIcon = '🧁'
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function addMockItems(count: number) {
  const remaining = STICKER_PACK_MAX_ITEMS - form.value.items.length
  if (remaining <= 0) {
    formError.value = `单包最多 ${STICKER_PACK_MAX_ITEMS} 张贴图`
    return
  }
  const addCount = Math.min(count, remaining)
  for (let i = 0; i < addCount; i += 1) {
    const idx = form.value.items.length + 1
    form.value.items.push({
      id: `si_new_${Date.now()}_${i}`,
      fileName: `sticker_${idx}.png`,
      preview: PREVIEW_EMOJIS[idx % PREVIEW_EMOJIS.length],
      emojiKeywords: PREVIEW_EMOJIS[idx % PREVIEW_EMOJIS.length],
    })
  }
  formError.value = ''
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  const remaining = STICKER_PACK_MAX_ITEMS - form.value.items.length
  if (remaining <= 0) {
    formError.value = `单包最多 ${STICKER_PACK_MAX_ITEMS} 张贴图`
    input.value = ''
    return
  }
  const take = Math.min(files.length, remaining)
  for (let i = 0; i < take; i += 1) {
    const file = files[i]
    form.value.items.push({
      id: `si_file_${Date.now()}_${i}`,
      fileName: file.name,
      preview: PREVIEW_EMOJIS[(form.value.items.length + i) % PREVIEW_EMOJIS.length],
      emojiKeywords: '',
    })
  }
  if (files.length > take) {
    formError.value = `已添加 ${take} 张，超出单包上限的部分已忽略`
  } else {
    formError.value = ''
  }
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (!files?.length) return
  const remaining = STICKER_PACK_MAX_ITEMS - form.value.items.length
  if (remaining <= 0) {
    formError.value = `单包最多 ${STICKER_PACK_MAX_ITEMS} 张贴图`
    return
  }
  const take = Math.min(files.length, remaining)
  for (let i = 0; i < take; i += 1) {
    const file = files[i]
    form.value.items.push({
      id: `si_drop_${Date.now()}_${i}`,
      fileName: file.name,
      preview: PREVIEW_EMOJIS[(form.value.items.length + i) % PREVIEW_EMOJIS.length],
      emojiKeywords: '',
    })
  }
  formError.value = take < files.length ? `已添加 ${take} 张，超出单包上限的部分已忽略` : ''
}

function removeItem(id: string) {
  form.value.items = form.value.items.filter((item) => item.id !== id)
}

function validateForm(publish: boolean): boolean {
  const name = form.value.name.trim()
  const author = form.value.author.trim()
  if (!name) {
    formError.value = '请输入贴图包名称'
    return false
  }
  if (name.length > 50) {
    formError.value = '贴图包名称不能超过 50 个字符'
    return false
  }
  if (!author) {
    formError.value = '请输入发行者/作者'
    return false
  }
  if (!form.value.trayIcon.trim()) {
    formError.value = '请上传托盘图标（建议 PNG/WebP，96×96 px）'
    return false
  }
  if (form.value.items.length === 0) {
    formError.value = '请至少上传 1 张贴图'
    return false
  }
  for (const item of form.value.items) {
    const err = validateEmojiKeywords(item.emojiKeywords)
    if (err) {
      formError.value = `「${item.fileName}」：${err}`
      return false
    }
  }
  if (publish && form.value.items.some((item) => !item.emojiKeywords.trim())) {
    formError.value = '上架前请为每张贴图配置 Emoji 映射'
    return false
  }
  formError.value = ''
  return true
}

function savePack(status: StickerPackStatus) {
  const publish = status === 'online'
  if (!validateForm(publish)) return

  const now = formatStickerNow()
  const payload = {
    name: form.value.name.trim(),
    author: form.value.author.trim(),
    trayIcon: form.value.trayIcon.trim(),
    sortWeight: form.value.sortWeight || 0,
    stickerCount: form.value.items.length,
    status,
    items: form.value.items.map((item) => ({ ...item })),
    updatedAt: now,
  }

  if (modalMode.value === 'add') {
    rows.value.push({
      id: `pack_${Date.now()}`,
      ...payload,
      publishedAt: publish ? now : null,
      creator: '运营-当前用户',
      createdAt: now,
    })
  } else if (editingId.value) {
    const target = rows.value.find((item) => item.id === editingId.value)
    if (target) {
      Object.assign(target, payload)
      if (publish && !target.publishedAt) target.publishedAt = now
      if (status === 'draft') target.publishedAt = target.publishedAt
    }
  }

  closeModal()
}

function statusClass(status: StickerPackStatus) {
  if (status === 'online') return 'sticker-pack-status sticker-pack-status--online'
  if (status === 'offline') return 'sticker-pack-status sticker-pack-status--offline'
  return 'sticker-pack-status sticker-pack-status--draft'
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <p class="wf-notice">
      <span class="wf-notice-label">说明：</span>
      贴图包用于管理整套贴图资源（如 Cuppy 系列）。每张贴图需绑定 1～3 个 Emoji，供 App 端「文字/表情符号搜索」使用；单包最多
      {{ STICKER_PACK_MAX_ITEMS }} 张。
    </p>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">贴图包名称：</label>
        <input v-model="filter.name" type="text" class="wf-input" placeholder="支持模糊匹配" />

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option
            v-for="opt in STICKER_PACK_STATUS_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">操作人：</label>
        <input v-model="filter.creator" type="text" class="wf-input" placeholder="请输入操作人" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">发布时间：</label>
        <input v-model="filter.publishedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.publishedEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--add" @click="openAddModal">新增贴图包</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">包 ID</th>
              <th class="wf-th">贴图包名称</th>
              <th class="wf-th wf-th--icon">托盘图标</th>
              <th class="wf-th wf-th--count">贴图数量</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--sort">排序权重</th>
              <th class="wf-th">上架时间</th>
              <th class="wf-th">操作人</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="10" class="wf-td wf-td--empty">暂无贴图包数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.id }}</td>
              <td class="wf-td">{{ row.name }}</td>
              <td class="wf-td wf-td--center">
                <span class="sticker-tray-icon" :title="row.name">{{ row.trayIcon }}</span>
              </td>
              <td class="wf-td wf-td--center">{{ row.stickerCount }}</td>
              <td class="wf-td">
                <span :class="statusClass(row.status)">{{ STICKER_PACK_STATUS_LABEL[row.status] }}</span>
              </td>
              <td class="wf-td wf-td--center">{{ row.sortWeight }}</td>
              <td class="wf-td">{{ row.publishedAt || '—' }}</td>
              <td class="wf-td">{{ row.creator }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openEditModal(row)">编辑</button>
                <template v-if="row.status !== 'draft'">
                  <span class="wf-action-sep">|</span>
                  <button type="button" class="wf-link-action" @click="toggleStatus(row)">
                    {{ row.status === 'online' ? '下架' : '上架' }}
                  </button>
                </template>
                <template v-if="canDelete(row)">
                  <span class="wf-action-sep">|</span>
                  <button type="button" class="wf-link-action wf-link-action--danger" @click="removeRow(row)">
                    删除
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
      <div v-if="modalVisible" class="wf-modal-mask" role="presentation" @click.self="closeModal">
        <div
          class="wf-modal wf-modal--detail-wide sticker-pack-modal"
          role="dialog"
          aria-labelledby="pack-modal-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="pack-modal-title" class="wf-modal__title">
              {{ modalMode === 'add' ? '新增贴图包' : '编辑贴图包' }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </div>

          <div class="wf-modal__body sticker-pack-modal__body">
            <p v-if="formError" class="sticker-form-error">{{ formError }}</p>

            <section class="sticker-form-section">
              <h4 class="sticker-form-section__title">基础信息</h4>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">贴图包名称</label>
                <div>
                  <input
                    v-model="form.name"
                    type="text"
                    class="wf-input wf-input--full"
                    maxlength="50"
                    placeholder="如 Cuppy、节日限定，最多 50 字"
                  />
                  <p class="wf-form-row__hint">{{ form.name.length }}/50</p>
                </div>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">发行者/作者</label>
                <input
                  v-model="form.author"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="展示在 App 贴图包详情页"
                />
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">托盘图标</label>
                <div class="sticker-tray-upload">
                  <span v-if="form.trayIcon" class="sticker-tray-icon sticker-tray-icon--large">{{ form.trayIcon }}</span>
                  <span v-else class="sticker-tray-icon sticker-tray-icon--empty">96×96</span>
                  <div>
                    <button type="button" class="wf-btn wf-btn--default" @click="mockTrayUpload">模拟上传</button>
                    <p class="wf-form-row__hint">建议 PNG 或 WebP，96×96 px，用于 App 底部 Tab</p>
                  </div>
                </div>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label">全局排序权重</label>
                <input
                  v-model.number="form.sortWeight"
                  type="number"
                  min="0"
                  max="9999"
                  class="wf-input wf-input--full"
                  placeholder="数字越小越靠前"
                />
              </div>
            </section>

            <section class="sticker-form-section">
              <h4 class="sticker-form-section__title">
                内容管理
                <span class="sticker-form-section__sub">已上传 {{ form.items.length }}/{{ STICKER_PACK_MAX_ITEMS }} 张</span>
              </h4>

              <div
                class="sticker-upload-zone"
                :class="{ 'sticker-upload-zone--active': dragOver }"
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @drop.prevent="onDrop"
              >
                <p class="sticker-upload-zone__text">拖拽图片到此处批量上传，或</p>
                <button type="button" class="wf-btn wf-btn--primary" @click="triggerFileInput">选择文件</button>
                <button type="button" class="wf-btn wf-btn--default" @click="addMockItems(3)">模拟添加 3 张</button>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/png,image/webp,image/jpeg"
                  multiple
                  class="sticker-upload-zone__input"
                  @change="onFilesSelected"
                />
              </div>

              <div v-if="form.items.length === 0" class="sticker-items-empty">暂未上传贴图，请批量上传后配置 Emoji 映射</div>

              <ul v-else class="sticker-item-list">
                <li v-for="item in form.items" :key="item.id" class="sticker-item-row">
                  <span class="sticker-item-row__preview">{{ item.preview }}</span>
                  <span class="sticker-item-row__name" :title="item.fileName">{{ item.fileName }}</span>
                  <label class="sticker-item-row__label">Emoji 映射</label>
                  <input
                    v-model="item.emojiKeywords"
                    type="text"
                    class="wf-input sticker-item-row__input"
                    placeholder="如 ☕,😋（1～3 个，逗号分隔）"
                  />
                  <span class="sticker-item-row__tags">
                    <span v-for="kw in parseEmojiKeywords(item.emojiKeywords)" :key="kw" class="sticker-kw-tag">{{ kw }}</span>
                  </span>
                  <button type="button" class="wf-link-action wf-link-action--danger" @click="removeItem(item.id)">移除</button>
                </li>
              </ul>
            </section>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
            <button type="button" class="wf-btn wf-btn--default" @click="savePack('draft')">保存为草稿</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="savePack('online')">立即上架</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.sticker-tray-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 24px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.sticker-tray-icon--large {
  width: 96px;
  height: 96px;
  font-size: 48px;
}

.sticker-tray-icon--empty {
  color: #bfbfbf;
  font-size: 12px;
}

.sticker-pack-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 2px;
}

.sticker-pack-status--online {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.sticker-pack-status--offline {
  color: #8c8c8c;
  background: #fafafa;
  border: 1px solid #d9d9d9;
}

.sticker-pack-status--draft {
  color: #d48806;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.sticker-form-error {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-size: 13px;
  color: #cf1322;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 2px;
}

.sticker-form-section {
  margin-bottom: 20px;
}

.sticker-form-section__title {
  margin: 0 0 12px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

.sticker-form-section__sub {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #8c8c8c;
}

.sticker-tray-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sticker-upload-zone {
  padding: 20px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 2px;
  transition: border-color 0.2s, background 0.2s;
}

.sticker-upload-zone--active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.sticker-upload-zone__text {
  margin: 0 0 12px;
  font-size: 13px;
  color: #595959;
}

.sticker-upload-zone__input {
  display: none;
}

.sticker-items-empty {
  padding: 24px;
  font-size: 13px;
  color: #8c8c8c;
  text-align: center;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.sticker-item-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid #f0f0f0;
}

.sticker-item-row {
  display: grid;
  grid-template-columns: 48px 140px 72px 1fr auto 56px;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.sticker-item-row:last-child {
  border-bottom: none;
}

.sticker-item-row__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 22px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.sticker-item-row__name {
  overflow: hidden;
  font-size: 12px;
  color: #595959;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticker-item-row__label {
  font-size: 12px;
  color: #8c8c8c;
}

.sticker-item-row__input {
  min-width: 0;
}

.sticker-item-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sticker-kw-tag {
  padding: 2px 6px;
  font-size: 12px;
  background: #f0f5ff;
  border: 1px solid #adc6ff;
  border-radius: 2px;
}

.sticker-pack-modal__body {
  max-height: min(70vh, 640px);
  overflow-y: auto;
}

.wf-th--icon {
  width: 80px;
}

.wf-th--count {
  width: 80px;
}

.wf-th--sort {
  width: 88px;
}
</style>
