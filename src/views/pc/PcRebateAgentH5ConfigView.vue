<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  MOCK_REBATE_AGENT_H5_ROWS,
  cloneRebateH5Row,
  displayVersionOrDash,
  formatRebateH5Now,
  statusLabel,
  type RebateAgentH5ConfigRow,
} from '../../constants/rebateAgentH5Config'
import { REBATE_AGENT_H5_CONFIG_ANNOT_MAP } from '../../constants/rebateAgentH5ConfigSpec'
import '../../styles/pc-wireframe.css'

const rows = ref<RebateAgentH5ConfigRow[]>(MOCK_REBATE_AGENT_H5_ROWS.map(cloneRebateH5Row))
const listAnnot = REBATE_AGENT_H5_CONFIG_ANNOT_MAP.list
const addAnnot = REBATE_AGENT_H5_CONFIG_ANNOT_MAP.addButton
const modalAnnot = REBATE_AGENT_H5_CONFIG_ANNOT_MAP.modal

type ModalMode = 'add' | 'edit'

const modalVisible = ref(false)
const modalMode = ref<ModalMode>('add')
const editingId = ref<string | null>(null)
const formHint = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  version: '',
  minAppVersion: '',
  updateDesc: '',
  packageFileName: '',
  online: false,
})

const modalTitle = computed(() => (modalMode.value === 'add' ? '新增' : '编辑'))

function resetForm() {
  form.value = {
    version: '',
    minAppVersion: '',
    updateDesc: '',
    packageFileName: '',
    online: false,
  }
  formHint.value = ''
  editingId.value = null
}

function openAddModal() {
  modalMode.value = 'add'
  resetForm()
  modalVisible.value = true
}

function openEditModal(row: RebateAgentH5ConfigRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    version: row.version,
    minAppVersion: row.minAppVersion,
    updateDesc: row.updateDesc,
    packageFileName: row.packageFileName,
    online: row.status === 'online',
  }
  formHint.value = ''
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.zip')) {
    formHint.value = '仅支持上传 zip 格式文件'
    input.value = ''
    return
  }
  form.value.packageFileName = file.name
  formHint.value = ''
  input.value = ''
}

function confirmModal() {
  const version = form.value.version.trim()
  const minAppVersion = form.value.minAppVersion.trim()
  if (!version) {
    formHint.value = '请输入版本号'
    return
  }
  if (!minAppVersion) {
    formHint.value = '请输入兼容APP最小版本号'
    return
  }
  if (!form.value.packageFileName) {
    formHint.value = '请上传 H5 安装包（zip）'
    return
  }

  const now = formatRebateH5Now()
  const status = form.value.online ? 'online' : 'offline'

  if (modalMode.value === 'add') {
    rows.value.unshift({
      id: `rah5_${Date.now()}`,
      version,
      minAppVersion,
      updateDesc: form.value.updateDesc.trim(),
      status,
      packageFileName: form.value.packageFileName,
      updatedAt: now,
      createdAt: now,
    })
  } else if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.version = version
      target.minAppVersion = minAppVersion
      target.updateDesc = form.value.updateDesc.trim()
      target.status = status
      target.packageFileName = form.value.packageFileName
      target.updatedAt = now
    }
  }

  closeModal()
}

function removeRow(row: RebateAgentH5ConfigRow) {
  if (!window.confirm(`确定删除版本「${row.version}」吗？`)) return
  rows.value = rows.value.filter((item) => item.id !== row.id)
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--add" @click="openAddModal">+ 新增</button>
          <WfSpecAnnot
            :no="addAnnot.no"
            :title="addAnnot.title"
            :items="[...addAnnot.items]"
            placement="bottom"
          />
        </span>
      </div>

      <div class="wf-table-wrap">
        <div class="rah5-list-head">
          <WfSpecAnnot
            :no="listAnnot.no"
            :title="listAnnot.title"
            :items="[...listAnnot.items]"
            placement="bottom"
          />
        </div>
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">版本号</th>
              <th class="wf-th">兼容APP最小版本号</th>
              <th class="wf-th">更新描述</th>
              <th class="wf-th">上线/下线</th>
              <th class="wf-th">更新时间</th>
              <th class="wf-th">创建时间</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.version }}</td>
              <td class="wf-td">{{ displayVersionOrDash(row.minAppVersion) }}</td>
              <td class="wf-td">{{ displayVersionOrDash(row.updateDesc) }}</td>
              <td class="wf-td">{{ statusLabel(row.status) }}</td>
              <td class="wf-td">{{ row.updatedAt }}</td>
              <td class="wf-td">{{ row.createdAt }}</td>
              <td class="wf-td wf-td--actions">
                <button type="button" class="wf-link-action" @click="openEditModal(row)">编辑</button>
                <span class="wf-action-sep">|</span>
                <button
                  type="button"
                  class="wf-link-action wf-link-action--danger"
                  @click="removeRow(row)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="8" class="wf-td wf-td--empty">暂无 H5 配置数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-muted">共 {{ rows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="modalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeModal"
      >
        <div
          class="wf-modal wf-modal--scroll rah5-modal"
          role="dialog"
          :aria-labelledby="'rah5-modal-title'"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="rah5-modal-title" class="wf-modal__title wf-modal__title--with-spec">
              {{ modalTitle }}
              <WfSpecAnnot
                :no="modalAnnot.no"
                :title="modalAnnot.title"
                :items="[...modalAnnot.items]"
                placement="bottom"
              />
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">
              ×
            </button>
          </div>

          <div class="wf-modal__body">
            <div class="wf-form-row rah5-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">版本号</label>
              <div class="rah5-version-field">
                <span class="rah5-version-prefix" aria-hidden="true">V</span>
                <input
                  v-model="form.version"
                  type="text"
                  class="wf-input rah5-version-input"
                  placeholder="请输入版本号"
                />
              </div>
            </div>

            <div class="wf-form-row rah5-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">兼容APP最小版本号</label>
              <div class="rah5-version-field-wrap">
                <div class="rah5-version-field">
                  <span class="rah5-version-prefix" aria-hidden="true">V</span>
                  <input
                    v-model="form.minAppVersion"
                    type="text"
                    class="wf-input rah5-version-input"
                    placeholder="请输入版本号"
                  />
                </div>
                <p class="rah5-caution">!!! 注意事项：低于该版本的客户端将无法加载本 H5 包</p>
              </div>
            </div>

            <div class="wf-form-row rah5-form-row">
              <label class="wf-form-row__label">更新描述</label>
              <textarea
                v-model="form.updateDesc"
                class="wf-input rah5-textarea"
                rows="3"
                placeholder="请输入更新描述"
              />
            </div>

            <div class="wf-form-row rah5-form-row">
              <label class="wf-form-row__label wf-form-row__label--required">安装包</label>
              <div>
                <button type="button" class="wf-btn wf-btn--primary" @click="triggerUpload">
                  点击上传H5包
                </button>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".zip,application/zip"
                  class="rah5-file-input"
                  @change="onFileChange"
                />
                <p class="wf-form-row__hint">仅支持上传zip格式文件.</p>
                <p v-if="form.packageFileName" class="rah5-file-ok">
                  <span class="rah5-file-ok__name">文件已上传：{{ form.packageFileName }}</span>
                  <span class="rah5-file-ok__check" aria-hidden="true">✓</span>
                </p>
              </div>
            </div>

            <div class="wf-form-row rah5-form-row">
              <label class="wf-form-row__label">上线/下线</label>
              <button
                type="button"
                class="rah5-switch"
                :class="{ 'rah5-switch--on': form.online }"
                role="switch"
                :aria-checked="form.online"
                @click="form.online = !form.online"
              >
                <span class="rah5-switch__knob" />
              </button>
            </div>

            <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
          </div>

          <div class="wf-modal__footer rah5-modal__footer">
            <button type="button" class="wf-btn wf-btn--primary wf-btn--lg" @click="confirmModal">
              确认
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.rah5-list-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.rah5-form-row {
  grid-template-columns: 140px 1fr;
}

.rah5-version-field-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.rah5-version-field {
  display: inline-flex;
  align-items: stretch;
  max-width: 280px;
  width: 100%;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 2px;
  overflow: hidden;
  background: #fff;
}

.rah5-version-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 0 8px;
  background: #f5f5f5;
  border-right: 1px solid var(--pc-border, #d9d9d9);
  color: var(--pc-text-secondary, #666);
  font-size: 14px;
}

.rah5-version-input {
  flex: 1;
  min-width: 0;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.rah5-caution {
  margin: 0;
  color: #ff4d4f;
  font-size: 13px;
  line-height: 1.4;
  white-space: normal;
}

.rah5-textarea {
  width: 100%;
  min-height: 72px;
  resize: vertical;
  line-height: 1.5;
  padding-top: 6px;
  padding-bottom: 6px;
}

.rah5-file-input {
  display: none;
}

.rah5-file-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--pc-text, #333);
}

.rah5-file-ok__name {
  word-break: break-word;
}

.rah5-file-ok__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #52c41a;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
}

.rah5-switch {
  position: relative;
  width: 44px;
  height: 22px;
  margin-top: 5px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #bfbfbf;
  cursor: pointer;
  transition: background 0.2s ease;
}

.rah5-switch--on {
  background: #1677ff;
}

.rah5-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.rah5-switch--on .rah5-switch__knob {
  transform: translateX(22px);
}

.rah5-modal {
  width: min(560px, 92vw);
}

.rah5-modal__footer {
  justify-content: center;
}
</style>
