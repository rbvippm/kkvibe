<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { mineHomeRouteName } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const route = useRoute()
const types = ['功能异常', '体验建议', '账号问题', '其他'] as const
const selectedType = ref<(typeof types)[number]>('功能异常')
const content = ref('')
const submitting = ref(false)

function goBack() {
  router.push({ name: mineHomeRouteName(route.query.from) })
}

async function submitFeedback() {
  const text = content.value.trim()
  if (!text) {
    await mh5Alert({ title: '请填写反馈内容', showCancel: false })
    return
  }
  if (submitting.value) return
  submitting.value = true
  window.setTimeout(async () => {
    submitting.value = false
    content.value = ''
    await mh5Alert({ title: '反馈已提交', message: '我们会尽快处理，感谢你的建议', showCancel: false })
  }, 400)
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('意见反馈')" :on-back="goBack" />
    <main class="mh5-settings-main mh5-mine-feedback">
      <p class="mh5-mine-feedback__hint">{{ $t('选择问题类型，描述越具体我们越快帮你处理') }}</p>
      <div class="mh5-mine-feedback__types" role="tablist" :aria-label="$t('问题类型')">
        <button
          v-for="item in types"
          :key="item"
          type="button"
          class="mh5-mine-feedback__type"
          :class="{ 'mh5-mine-feedback__type--active': selectedType === item }"
          @click="selectedType = item"
        >
          {{ $t(item) }}
        </button>
      </div>
      <label class="mh5-mine-feedback__field">
        <span>{{ $t('反馈内容') }}</span>
        <textarea
          v-model="content"
          class="mh5-mine-feedback__textarea"
          maxlength="300"
          :placeholder="$t('请描述你遇到的问题或建议')"
        />
        <em>{{ content.trim().length }}/300</em>
      </label>
      <button
        type="button"
        class="mh5-mine-feedback__submit"
        :disabled="submitting"
        @click="submitFeedback"
      >
        {{ submitting ? $t('提交中…') : $t('提交反馈') }}
      </button>
    </main>
  </div>
</template>
