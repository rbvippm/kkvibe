import { computed, ref } from 'vue'
import { MOCK_STICKER_TAG_ROWS, type StickerTagRow } from '../constants/stickerManage'

const tagRows = ref<StickerTagRow[]>(
  MOCK_STICKER_TAG_ROWS.map((row) => ({
    ...row,
    searchKeywords: [...row.searchKeywords],
  })),
)

/** 贴图标签 · 跨页面共享状态（贴图包映射选项来源于此） */
export function useStickerTags() {
  const enabledTags = computed(() =>
    [...tagRows.value]
      .filter((row) => row.status === 'enabled')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  )

  const tagMap = computed(() => new Map(tagRows.value.map((row) => [row.id, row])))

  function getTagById(id: string) {
    return tagMap.value.get(id)
  }

  return {
    tagRows,
    enabledTags,
    tagMap,
    getTagById,
  }
}
