<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RevisionTableRow } from '../../utils/parseRevisionTable'

type DraftRow = RevisionTableRow & { _key: string }

const props = defineProps<{
  rows: RevisionTableRow[]
  editable?: boolean
}>()

const emit = defineEmits<{
  save: [rows: RevisionTableRow[]]
}>()

const draftRows = ref<DraftRow[]>([])
const editingKeys = ref<Set<string>>(new Set())
const dirty = ref(false)

let keySeed = 0
function createKey() {
  keySeed += 1
  return `rev-${keySeed}`
}

function toDraftRows(rows: RevisionTableRow[]): DraftRow[] {
  return rows.map((row) => ({ ...row, _key: createKey() }))
}

function toPlainRows(rows: DraftRow[]): RevisionTableRow[] {
  return rows.map(({ _key: _ignored, ...row }) => ({ ...row }))
}

watch(
  () => JSON.stringify(props.rows),
  () => {
    if (dirty.value || editingKeys.value.size > 0) return
    draftRows.value = toDraftRows(props.rows)
    dirty.value = false
  },
  { immediate: true },
)

const hasEditing = computed(() => editingKeys.value.size > 0)
const canSave = computed(() => dirty.value || hasEditing.value)

function isEditing(key: string) {
  return editingKeys.value.has(key)
}

function todayText() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function markDirty() {
  dirty.value = true
}

function addRow() {
  const key = createKey()
  draftRows.value.push({
    _key: key,
    version: '',
    content: '',
    date: todayText(),
    author: '',
  })
  editingKeys.value = new Set([...editingKeys.value, key])
  markDirty()
}

function toggleEdit(key: string) {
  const next = new Set(editingKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  editingKeys.value = next
}

function removeRow(key: string) {
  const row = draftRows.value.find((item) => item._key === key)
  if (!row) return
  const label = row.version || '该行'
  if (!window.confirm(`确定删除「${label}」？`)) return
  draftRows.value = draftRows.value.filter((item) => item._key !== key)
  const next = new Set(editingKeys.value)
  next.delete(key)
  editingKeys.value = next
  markDirty()
}

function save() {
  const rows = toPlainRows(draftRows.value)
  emit('save', rows)
  editingKeys.value = new Set()
  dirty.value = false
}
</script>

<template>
  <div class="ws-revision" :class="{ 'ws-revision--readonly': editable === false }">
    <div v-if="editable !== false" class="ws-revision__toolbar">
      <button type="button" class="ws-btn ws-btn--sm" @click="addRow">新增</button>
      <button
        type="button"
        class="ws-btn ws-btn--sm ws-btn--primary"
        :disabled="!canSave"
        @click="save"
      >
        保存
      </button>
      <span v-if="dirty || hasEditing" class="ws-revision__hint">有未保存的修改</span>
    </div>

    <div class="ws-revision__scroll">
      <table class="ws-revision-table">
        <thead>
          <tr>
            <th class="ws-revision-table__th ws-revision-table__th--version">版本号</th>
            <th class="ws-revision-table__th ws-revision-table__th--content">修订内容描述</th>
            <th class="ws-revision-table__th ws-revision-table__th--date">时间</th>
            <th class="ws-revision-table__th ws-revision-table__th--author">创建人/更新人</th>
            <th v-if="editable !== false" class="ws-revision-table__th ws-revision-table__th--action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!draftRows.length">
            <td :colspan="editable === false ? 4 : 5" class="ws-revision-table__td ws-revision-table__td--empty">
              <template v-if="editable === false">暂无修订记录</template>
              <template v-else>暂无修订记录，点击「新增」添加一行</template>
            </td>
          </tr>
          <tr
            v-for="row in draftRows"
            :key="row._key"
            :class="{ 'ws-revision-table__row--editing': isEditing(row._key) }"
          >
            <td class="ws-revision-table__td ws-revision-table__td--version">
              <input
                v-if="isEditing(row._key)"
                v-model="row.version"
                class="ws-revision-input"
                placeholder="如 v1.9"
                @input="markDirty"
              />
              <span v-else>{{ row.version }}</span>
            </td>
            <td class="ws-revision-table__td ws-revision-table__td--content">
              <textarea
                v-if="isEditing(row._key)"
                v-model="row.content"
                class="ws-revision-textarea"
                rows="3"
                placeholder="修订内容描述"
                @input="markDirty"
              />
              <span v-else>{{ row.content }}</span>
            </td>
            <td class="ws-revision-table__td ws-revision-table__td--date">
              <input
                v-if="isEditing(row._key)"
                v-model="row.date"
                class="ws-revision-input"
                placeholder="YYYY-MM-DD"
                @input="markDirty"
              />
              <span v-else>{{ row.date }}</span>
            </td>
            <td class="ws-revision-table__td ws-revision-table__td--author">
              <input
                v-if="isEditing(row._key)"
                v-model="row.author"
                class="ws-revision-input"
                placeholder="创建人"
                @input="markDirty"
              />
              <span v-else>{{ row.author }}</span>
            </td>
            <td v-if="editable !== false" class="ws-revision-table__td ws-revision-table__td--action">
              <div class="ws-revision-table__actions">
                <button
                  type="button"
                  class="ws-revision-table__edit-btn"
                  @click="toggleEdit(row._key)"
                >
                  {{ isEditing(row._key) ? '完成' : '编辑' }}
                </button>
                <button
                  type="button"
                  class="ws-revision-table__delete-btn"
                  @click="removeRow(row._key)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
