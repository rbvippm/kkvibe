<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useStickerTags } from '../../composables/useStickerTags'
import {
  STICKER_TAG_STATUS_LABEL,
  STICKER_TAG_STATUS_OPTIONS,
  parseEmojiKeywords,
  type StickerTagRow,
  type StickerTagStatus,
} from '../../constants/stickerManage'
import '../../styles/pc-wireframe.css'

const { tagRows } = useStickerTags()

const filter = ref({
  label: '',
  status: '' as '' | StickerTagStatus,
})

const appliedFilter = ref({ ...filter.value })

const filteredRows = computed(() => {
  const f = appliedFilter.value
  return tagRows.value
    .filter((row) => {
      if (f.label && !row.label.includes(f.label.trim()) && !row.guideEmoji.includes(f.label.trim())) {
        return false
      }
      if (f.status && row.status !== f.status) return false
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = { label: '', status: '' }
  appliedFilter.value = { ...filter.value }
}

function removeRow(row: StickerTagRow) {
  if (!window.confirm(`确定删除标签「${row.guideEmoji} ${row.label}」吗？`)) return
  tagRows.value = tagRows.value.filter((item) => item.id !== row.id)
}

type ModalMode = 'add' | 'edit'

const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const formError = ref('')

const form = ref({
  guideEmoji: '',
  label: '',
  searchKeywordsRaw: '',
  sortOrder: 50,
  status: 'enabled' as StickerTagStatus,
})

function resetForm() {
  form.value = {
    guideEmoji: '',
    label: '',
    searchKeywordsRaw: '',
    sortOrder: tagRows.value.length > 0 ? Math.max(...tagRows.value.map((r) => r.sortOrder)) - 10 : 50,
    status: 'enabled',
  }
  formError.value = ''
}

function openAddModal() {
  modalMode.value = 'add'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

function openEditModal(row: StickerTagRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    guideEmoji: row.guideEmoji,
    label: row.label,
    searchKeywordsRaw: row.searchKeywords.join(', '),
    sortOrder: row.sortOrder,
    status: row.status,
  }
  formError.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  formError.value = ''
}

function validateForm(): boolean {
  const guideEmoji = form.value.guideEmoji.trim()
  const label = form.value.label.trim()
  const keywords = parseEmojiKeywords(form.value.searchKeywordsRaw)

  if (!guideEmoji) {
    formError.value = '请选择引导 Emoji'
    return false
  }
  if (!label) {
    formError.value = '请输入标签名称'
    return false
  }
  if (label.length > 6) {
    formError.value = '标签名称建议 2～4 个字，最多 6 字'
    return false
  }
  if (keywords.length === 0) {
    formError.value = '请配置关联搜索词（至少 1 个）'
    return false
  }
  if (form.value.sortOrder < 0 || form.value.sortOrder > 9999) {
    formError.value = '展示排序需在 0～9999 之间'
    return false
  }

  formError.value = ''
  return true
}

function confirmModal() {
  if (!validateForm()) return

  const payload = {
    guideEmoji: form.value.guideEmoji.trim(),
    label: form.value.label.trim(),
    searchKeywords: parseEmojiKeywords(form.value.searchKeywordsRaw),
    sortOrder: form.value.sortOrder,
    status: form.value.status,
  }

  if (modalMode.value === 'add') {
    tagRows.value.push({
      id: `tag_${Date.now()}`,
      ...payload,
    })
  } else if (editingId.value) {
    const target = tagRows.value.find((item) => item.id === editingId.value)
    if (target) Object.assign(target, payload)
  }

  closeModal()
}

function toggleStatus(row: StickerTagRow) {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
}

function statusClass(status: StickerTagStatus) {
  return status === 'enabled'
    ? 'sticker-tag-status sticker-tag-status--enabled'
    : 'sticker-tag-status sticker-tag-status--disabled'
}

const commonEmojis = ['👋', '😂', '❤️', '😴', '🔥', '🎉', '😍', '👍', '😭', '🤔']
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <p class="wf-notice">
      <span class="wf-notice-label">说明：</span>
      贴图标签对应 App 顶部横向快捷筛选项（如 👋 你好、😂 笑趴）。用户点击标签时，前端将「关联搜索词」发送给搜索接口，拉取绑定了这些词的单张贴图。
    </p>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">标签名称：</label>
        <input v-model="filter.label" type="text" class="wf-input" placeholder="支持名称或 Emoji" />

        <label class="wf-label">状态：</label>
        <select v-model="filter.status" class="wf-input wf-input--select">
          <option
            v-for="opt in STICKER_TAG_STATUS_OPTIONS"
            :key="opt.value || 'all'"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--add" @click="openAddModal">新增标签</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">标签 ID</th>
              <th class="wf-th wf-th--emoji">引导 Emoji</th>
              <th class="wf-th">标签名称</th>
              <th class="wf-th">关联搜索词</th>
              <th class="wf-th wf-th--sort">排序</th>
              <th class="wf-th">状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="8" class="wf-td wf-td--empty">暂无标签数据</td>
            </tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.id }}</td>
              <td class="wf-td wf-td--center">
                <span class="sticker-tag-emoji">{{ row.guideEmoji }}</span>
              </td>
              <td class="wf-td">{{ row.label }}</td>
              <td class="wf-td">
                <span v-for="kw in row.searchKeywords" :key="kw" class="sticker-kw-tag">{{ kw }}</span>
              </td>
              <td class="wf-td wf-td--center">{{ row.sortOrder }}</td>
              <td class="wf-td">
                <span :class="statusClass(row.status)">{{ STICKER_TAG_STATUS_LABEL[row.status] }}</span>
              </td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openEditModal(row)">编辑</button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="toggleStatus(row)">
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action wf-link-action--danger" @click="removeRow(row)">删除</button>
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
        <div class="wf-modal" role="dialog" aria-labelledby="tag-modal-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="tag-modal-title" class="wf-modal__title">
              {{ modalMode === 'add' ? '新增贴图标签' : '编辑贴图标签' }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">×</button>
          </div>

          <div class="wf-modal__body">
            <p v-if="formError" class="sticker-form-error">{{ formError }}</p>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">引导 Emoji</label>
              <div>
                <div class="sticker-emoji-picker">
                  <button
                    v-for="emoji in commonEmojis"
                    :key="emoji"
                    type="button"
                    class="sticker-emoji-picker__btn"
                    :class="{ 'sticker-emoji-picker__btn--active': form.guideEmoji === emoji }"
                    @click="form.guideEmoji = emoji"
                  >
                    {{ emoji }}
                  </button>
                  <input
                    v-model="form.guideEmoji"
                    type="text"
                    class="wf-input sticker-emoji-picker__input"
                    maxlength="4"
                    placeholder="或输入"
                  />
                </div>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">标签名称</label>
              <input
                v-model="form.label"
                type="text"
                class="wf-input wf-input--full"
                maxlength="6"
                placeholder="如 你好、笑趴，建议 2～4 字"
              />
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">关联词配置</label>
              <div>
                <input
                  v-model="form.searchKeywordsRaw"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="如 😂, 🤣, 哈哈, lol（逗号分隔）"
                />
                <p class="wf-form-row__hint">点击该标签时，前端将这些词发送给搜索接口</p>
                <div v-if="parseEmojiKeywords(form.searchKeywordsRaw).length" class="sticker-kw-preview">
                  <span v-for="kw in parseEmojiKeywords(form.searchKeywordsRaw)" :key="kw" class="sticker-kw-tag">{{ kw }}</span>
                </div>
              </div>
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">展示排序</label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                max="9999"
                class="wf-input wf-input--full"
                placeholder="数字越小越靠前"
              />
            </div>

            <div class="wf-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">状态</label>
              <select v-model="form.status" class="wf-input wf-input--select wf-input--full">
                <option value="enabled">启用</option>
                <option value="disabled">禁用</option>
              </select>
            </div>
          </div>

          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmModal">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.sticker-tag-emoji {
  font-size: 24px;
}

.sticker-kw-tag {
  display: inline-block;
  margin: 0 4px 4px 0;
  padding: 2px 6px;
  font-size: 12px;
  background: #f0f5ff;
  border: 1px solid #adc6ff;
  border-radius: 2px;
}

.sticker-tag-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 2px;
}

.sticker-tag-status--enabled {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.sticker-tag-status--disabled {
  color: #8c8c8c;
  background: #fafafa;
  border: 1px solid #d9d9d9;
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

.sticker-emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.sticker-emoji-picker__btn {
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.sticker-emoji-picker__btn--active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.sticker-emoji-picker__input {
  width: 72px;
}

.sticker-kw-preview {
  margin-top: 8px;
}

.wf-th--emoji {
  width: 88px;
}

.wf-th--sort {
  width: 72px;
}
</style>
