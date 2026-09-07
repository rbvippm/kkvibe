<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ANCHOR_GAME_PAGE_SIZE,
  defaultGamePickerModuleId,
  filterAnchorGames,
  listGameModuleTabs,
} from '../../constants/gameProduct'

const selectedIds = defineModel<string[]>({ required: true })

const props = withDefaults(
  defineProps<{
    keyword?: string
    resetKey?: string
    pageSize?: number
  }>(),
  {
    keyword: '',
    resetKey: '',
    pageSize: ANCHOR_GAME_PAGE_SIZE,
  },
)

const focusedModuleId = ref(defaultGamePickerModuleId())
const page = ref(1)

const moduleTabs = computed(() => listGameModuleTabs())
const filteredList = computed(() => filterAnchorGames(props.keyword, focusedModuleId.value))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / props.pageSize)))
const pageItems = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filteredList.value.slice(start, start + props.pageSize)
})
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))
const selectedCount = computed(() => selectedIds.value.length)
const allMatchIds = computed(() => filterAnchorGames(props.keyword).map((item) => item.id))
const moduleMatchIds = computed(() => filteredList.value.map((item) => item.id))
const allSelected = computed(
  () => allMatchIds.value.length > 0 && allMatchIds.value.every((id) => selectedIds.value.includes(id)),
)
const allPartialSelected = computed(
  () => !allSelected.value && allMatchIds.value.some((id) => selectedIds.value.includes(id)),
)
const moduleAllSelected = computed(
  () => moduleMatchIds.value.length > 0 && moduleMatchIds.value.every((id) => selectedIds.value.includes(id)),
)
const modulePartialSelected = computed(
  () => !moduleAllSelected.value && moduleMatchIds.value.some((id) => selectedIds.value.includes(id)),
)
const focusedModuleLabel = computed(
  () => moduleTabs.value.find((item) => item.value === focusedModuleId.value)?.label || '模块',
)
const moduleSelectLabel = computed(() => `${focusedModuleLabel.value}全选`)

function resetPicker() {
  focusedModuleId.value = defaultGamePickerModuleId()
  page.value = 1
}

watch(
  () => props.resetKey,
  () => {
    resetPicker()
  },
)

watch(
  () => props.keyword,
  () => {
    page.value = 1
  },
)

watch(focusedModuleId, () => {
  page.value = 1
})

watch(totalPages, (max) => {
  if (page.value > max) page.value = max
})

function setModule(moduleId: string) {
  focusedModuleId.value = moduleId
}

function isProductChecked(id: string) {
  return selectedIds.value.includes(id)
}

function toggleProduct(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index >= 0) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function toggleIds(ids: string[], selected: boolean) {
  if (!ids.length) return
  if (selected) {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id))
    return
  }
  selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
}

function toggleAll() {
  toggleIds(allMatchIds.value, allSelected.value)
}

function toggleModuleAll() {
  toggleIds(moduleMatchIds.value, moduleAllSelected.value)
}

function goPage(next: number) {
  if (next < 1 || next > totalPages.value) return
  page.value = next
}
</script>

<template>
  <div class="wf-game-picker">
    <div class="wf-game-picker__bar">
      <label class="wf-game-picker__check">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="allPartialSelected"
          :disabled="!allMatchIds.length"
          @change="toggleAll"
        />
        全部选择
      </label>
      <span class="wf-muted">已选：{{ selectedCount }}</span>
    </div>

    <div class="wf-game-picker__block">
      <p class="wf-game-picker__title">模块</p>
      <div v-if="moduleTabs.length" class="wf-game-picker__mods" role="tablist" aria-label="模块分类">
        <button
          v-for="opt in moduleTabs"
          :key="opt.value"
          type="button"
          class="wf-game-picker__mod"
          :class="{ 'wf-game-picker__mod--on': focusedModuleId === opt.value }"
          role="tab"
          :aria-selected="focusedModuleId === opt.value"
          @click="setModule(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <p v-else class="wf-td--empty wf-game-picker__empty">暂无启用模块</p>
    </div>

    <div class="wf-game-picker__block">
      <p class="wf-game-picker__title">产品</p>
      <div class="wf-game-picker__bar wf-game-picker__bar--product">
        <label class="wf-game-picker__check">
          <input
            type="checkbox"
            :checked="moduleAllSelected"
            :indeterminate="modulePartialSelected"
            :disabled="!moduleMatchIds.length"
            @change="toggleModuleAll"
          />
          {{ moduleSelectLabel }}
        </label>
      </div>

      <div v-if="pageItems.length" class="wf-game-picker__grid">
        <label v-for="item in pageItems" :key="item.id" class="wf-game-picker__check">
          <input type="checkbox" :checked="isProductChecked(item.id)" @change="toggleProduct(item.id)" />
          {{ item.name }}
        </label>
      </div>
      <p v-else class="wf-td--empty wf-game-picker__empty">暂无匹配游戏</p>
    </div>

    <div v-if="filteredList.length" class="wf-pagination wf-game-picker__pages">
      <button
        type="button"
        class="wf-btn wf-btn--default"
        :disabled="page <= 1"
        @click="goPage(page - 1)"
      >
        上一页
      </button>
      <button
        v-for="num in pageNumbers"
        :key="num"
        type="button"
        class="wf-btn"
        :class="num === page ? 'wf-btn--primary' : 'wf-btn--default'"
        @click="goPage(num)"
      >
        {{ num }}
      </button>
      <button
        type="button"
        class="wf-btn wf-btn--default"
        :disabled="page >= totalPages"
        @click="goPage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.wf-game-picker {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--pc-border-light);
}

.wf-game-picker__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.wf-game-picker__bar--product {
  justify-content: flex-start;
  margin-bottom: 8px;
}

.wf-game-picker__block {
  margin-bottom: 12px;
}

.wf-game-picker__block:last-of-type {
  margin-bottom: 0;
}

.wf-game-picker__title {
  margin: 0 0 8px;
  color: var(--pc-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.wf-game-picker__mods {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wf-game-picker__mod {
  padding: 2px 10px;
  border: 1px solid var(--pc-border);
  border-radius: 2px;
  background: #fff;
  color: var(--pc-text);
  font-size: 12px;
  line-height: 22px;
  cursor: pointer;
}

.wf-game-picker__mod--on {
  border-color: var(--pc-primary);
  background: var(--pc-primary-bg);
  color: var(--pc-primary);
}

.wf-game-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.wf-game-picker__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pc-text);
  font-size: 14px;
  cursor: pointer;
}

.wf-game-picker__empty {
  padding: 24px 0;
  text-align: center;
}

.wf-game-picker__pages {
  height: auto;
  min-height: 56px;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0 0;
}
</style>
