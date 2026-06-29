<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useStickerTags } from '../../composables/useStickerTags'
import {
  MOCK_STICKER_PACK_ROWS,
  STICKER_PACK_MAX_ITEMS,
  STICKER_PACK_NAME_FIELDS,
  STICKER_PACK_STATUS_LABEL,
  STICKER_PACK_STATUS_OPTIONS,
  cloneStickerPackRow,
  createEmptyPackNameI18n,
  formatStickerNow,
  inferTagIdsFromKeywords,
  keywordsFromTagIds,
  matchPackName,
  parseEmojiKeywords,
  stickerTagOptionLabel,
  validateStickerTagIds,
  type StickerPackItem,
  type StickerPackNameI18n,
  type StickerPackRow,
  type StickerPackStatus,
} from '../../constants/stickerManage'
import '../../styles/pc-wireframe.css'

const { tagRows, enabledTags } = useStickerTags()

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
      if (f.name && !matchPackName(row, f.name)) return false
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
  nameI18n: createEmptyPackNameI18n(),
  author: '',
  trayIcon: '',
  sortWeight: 50,
  items: [] as StickerPackItem[],
})

/** 每张贴图已选标签 ID（表单态，保存时同步到 emojiKeywords） */
const itemTagMap = ref<Record<string, string[]>>({})
const openTagSelectId = ref<string | null>(null)

const PREVIEW_EMOJIS = ['😀', '😊', '🥳', '😎', '🤩', '😍', '🤗', '😋', '🙂', '😉']

function syncItemKeywords(itemId: string) {
  const item = form.value.items.find((row) => row.id === itemId)
  if (!item) return
  const tagIds = itemTagMap.value[itemId] ?? []
  item.emojiKeywords = keywordsFromTagIds(tagIds, tagRows.value)
}

function getItemTagIds(itemId: string) {
  return itemTagMap.value[itemId] ?? []
}

function isTagSelected(itemId: string, tagId: string) {
  return getItemTagIds(itemId).includes(tagId)
}

function toggleTagSelect(itemId: string) {
  openTagSelectId.value = openTagSelectId.value === itemId ? null : itemId
}

function closeTagSelect() {
  openTagSelectId.value = null
}

function toggleItemTag(itemId: string, tagId: string) {
  const current = [...getItemTagIds(itemId)]
  const index = current.indexOf(tagId)
  if (index >= 0) {
    current.splice(index, 1)
  } else if (current.length < 3) {
    current.push(tagId)
  } else {
    formError.value = '每张贴图最多选择 3 个贴图标签'
    return
  }
  itemTagMap.value[itemId] = current
  syncItemKeywords(itemId)
  formError.value = ''
}

function initItemTagMap(items: StickerPackItem[]) {
  const next: Record<string, string[]> = {}
  for (const item of items) {
    const inferred = inferTagIdsFromKeywords(item.emojiKeywords, tagRows.value)
    next[item.id] = inferred.length ? inferred : pickRandomTagIds()
  }
  itemTagMap.value = next
  for (const item of items) {
    syncItemKeywords(item.id)
  }
}

function getTagLabel(tagId: string) {
  const tag = tagRows.value.find((row) => row.id === tagId)
  return tag ? stickerTagOptionLabel(tag) : tagId
}

/** 从已启用标签中随机选取 1～2 个（新增贴图时默认填充） */
function pickRandomTagIds(): string[] {
  const pool = enabledTags.value.map((tag) => tag.id)
  if (!pool.length) return []
  const count = Math.random() < 0.5 ? 1 : 2
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length, 3))
}

function assignRandomTags(itemId: string) {
  const tagIds = pickRandomTagIds()
  itemTagMap.value[itemId] = tagIds
  syncItemKeywords(itemId)
}

function resetItemTagMap() {
  itemTagMap.value = {}
  openTagSelectId.value = null
}

function normalizePackNameI18n(raw: StickerPackNameI18n): StickerPackNameI18n {
  return {
    zhCn: raw.zhCn.trim(),
    en: raw.en.trim(),
    th: raw.th.trim(),
    zhTw: raw.zhTw.trim(),
    vi: raw.vi.trim(),
  }
}

function resetForm() {
  form.value = {
    nameI18n: createEmptyPackNameI18n(),
    author: '',
    trayIcon: '',
    sortWeight: 50,
    items: [],
  }
  resetItemTagMap()
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
    nameI18n: { ...row.nameI18n },
    author: row.author,
    trayIcon: row.trayIcon,
    sortWeight: row.sortWeight,
    items: row.items.map((item) => ({ ...item })),
  }
  initItemTagMap(form.value.items)
  formError.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  closeTagSelect()
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
    const id = `si_new_${Date.now()}_${i}`
    form.value.items.push({
      id,
      fileName: `sticker_${idx}.png`,
      preview: PREVIEW_EMOJIS[idx % PREVIEW_EMOJIS.length],
      emojiKeywords: '',
    })
    assignRandomTags(id)
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
    const id = `si_file_${Date.now()}_${i}`
    form.value.items.push({
      id,
      fileName: file.name,
      preview: PREVIEW_EMOJIS[(form.value.items.length + i) % PREVIEW_EMOJIS.length],
      emojiKeywords: '',
    })
    assignRandomTags(id)
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
    const id = `si_drop_${Date.now()}_${i}`
    form.value.items.push({
      id,
      fileName: file.name,
      preview: PREVIEW_EMOJIS[(form.value.items.length + i) % PREVIEW_EMOJIS.length],
      emojiKeywords: '',
    })
    assignRandomTags(id)
  }
  formError.value = take < files.length ? `已添加 ${take} 张，超出单包上限的部分已忽略` : ''
}

function removeItem(id: string) {
  form.value.items = form.value.items.filter((item) => item.id !== id)
  const { [id]: _, ...rest } = itemTagMap.value
  itemTagMap.value = rest
  if (openTagSelectId.value === id) closeTagSelect()
}

function validateForm(publish: boolean): boolean {
  const nameI18n = normalizePackNameI18n(form.value.nameI18n)
  const author = form.value.author.trim()
  for (const field of STICKER_PACK_NAME_FIELDS) {
    const value = nameI18n[field.key]
    if (!value) {
      formError.value = `请输入贴图包名称（${field.label}）`
      return false
    }
    if (value.length > 50) {
      formError.value = `贴图包名称（${field.label}）不能超过 50 个字符`
      return false
    }
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
    const tagIds = getItemTagIds(item.id)
    const err = validateStickerTagIds(tagIds)
    if (err) {
      formError.value = `「${item.fileName}」：${err}`
      return false
    }
    syncItemKeywords(item.id)
  }
  if (publish && form.value.items.some((item) => getItemTagIds(item.id).length === 0)) {
    formError.value = '上架前请为每张贴图选择贴图标签'
    return false
  }
  formError.value = ''
  return true
}

function savePack(status: StickerPackStatus) {
  const publish = status === 'online'
  if (!validateForm(publish)) return

  const now = formatStickerNow()
  const nameI18n = normalizePackNameI18n(form.value.nameI18n)
  const payload = {
    name: nameI18n.zhCn,
    nameI18n,
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
      贴图包用于管理整套贴图资源（如 Cuppy 系列）。每张贴图的 Emoji 映射请从「贴图标签管理」中多选 1～3 个标签；单包最多
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
              <div class="sticker-name-i18n">
                <p class="sticker-name-i18n__heading wf-form-row__label wf-form-row__label--required">贴图包名称</p>
                <div
                  v-for="field in STICKER_PACK_NAME_FIELDS"
                  :key="field.key"
                  class="wf-form-row sticker-name-i18n__row"
                >
                  <label
                    class="wf-form-row__label"
                    :class="{ 'wf-form-row__label--required': field.required }"
                  >
                    {{ field.label }}
                  </label>
                  <div>
                    <input
                      v-model="form.nameI18n[field.key]"
                      type="text"
                      class="wf-input wf-input--full"
                      maxlength="50"
                      required
                      :placeholder="`请输入${field.label}名称`"
                    />
                    <p class="wf-form-row__hint">{{ form.nameI18n[field.key].length }}/50</p>
                  </div>
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

              <div v-if="form.items.length === 0" class="sticker-items-empty">暂未上传贴图，请批量上传后从贴图标签中选择映射</div>

              <ul v-else class="sticker-item-list" @click="closeTagSelect">
                <li v-for="item in form.items" :key="item.id" class="sticker-item-row">
                  <span class="sticker-item-row__preview">{{ item.preview }}</span>
                  <span class="sticker-item-row__name" :title="item.fileName">{{ item.fileName }}</span>
                  <label class="sticker-item-row__label">Emoji 映射</label>
                  <div class="sticker-tag-select" @click.stop>
                    <button
                      type="button"
                      class="sticker-tag-select__trigger"
                      :class="{ 'sticker-tag-select__trigger--open': openTagSelectId === item.id }"
                      @click="toggleTagSelect(item.id)"
                    >
                      <span v-if="getItemTagIds(item.id).length" class="sticker-tag-select__chips">
                        <span
                          v-for="tagId in getItemTagIds(item.id)"
                          :key="tagId"
                          class="sticker-kw-tag"
                        >
                          {{ getTagLabel(tagId) }}
                        </span>
                      </span>
                      <span v-else class="sticker-tag-select__placeholder">请选择贴图标签（1～3 个）</span>
                      <span class="sticker-tag-select__arrow" aria-hidden="true">▼</span>
                    </button>
                    <div v-if="openTagSelectId === item.id" class="sticker-tag-select__panel">
                      <p v-if="enabledTags.length === 0" class="sticker-tag-select__empty">
                        暂无启用的贴图标签，请先在「贴图标签管理」中添加并启用
                      </p>
                      <label
                        v-for="tag in enabledTags"
                        :key="tag.id"
                        class="sticker-tag-select__option"
                        :class="{
                          'sticker-tag-select__option--disabled':
                            !isTagSelected(item.id, tag.id) && getItemTagIds(item.id).length >= 3,
                        }"
                      >
                        <input
                          type="checkbox"
                          :checked="isTagSelected(item.id, tag.id)"
                          :disabled="!isTagSelected(item.id, tag.id) && getItemTagIds(item.id).length >= 3"
                          @change="toggleItemTag(item.id, tag.id)"
                        />
                        <span class="sticker-tag-select__option-label">{{ stickerTagOptionLabel(tag) }}</span>
                      </label>
                    </div>
                  </div>
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

.sticker-name-i18n {
  margin-bottom: 16px;
  padding: 12px 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
}

.sticker-name-i18n__heading {
  margin: 0 0 12px;
}

.sticker-name-i18n__row {
  margin-bottom: 12px;
}

.sticker-name-i18n__row:last-child {
  margin-bottom: 0;
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
  grid-template-columns: 48px 120px 72px minmax(200px, 1fr) auto 56px;
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

.sticker-tag-select {
  position: relative;
  min-width: 0;
}

.sticker-tag-select__trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.sticker-tag-select__trigger--open,
.sticker-tag-select__trigger:hover {
  border-color: #1890ff;
}

.sticker-tag-select__placeholder {
  color: #bfbfbf;
}

.sticker-tag-select__chips {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
}

.sticker-tag-select__arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: #8c8c8c;
}

.sticker-tag-select__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.sticker-tag-select__empty {
  margin: 0;
  padding: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.sticker-tag-select__option {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
}

.sticker-tag-select__option:last-child {
  border-bottom: none;
}

.sticker-tag-select__option:hover {
  background: #f5f7fa;
}

.sticker-tag-select__option--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.sticker-tag-select__option-label {
  font-size: 13px;
  color: #262626;
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
