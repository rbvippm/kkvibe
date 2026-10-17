<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5MemberRebateEditor from '../../components/mobile/Mh5MemberRebateEditor.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  memberDefaultRebateCategories,
  saveMemberDefaultRebateCategories,
  type MemberRebateCategory,
} from '../../constants/memberRebateRatio'
import '../../styles/mobile-app-shell.css'

const router = useRouter()

const categories = ref<MemberRebateCategory[]>(
  memberDefaultRebateCategories.value.map((category) => ({
    ...category,
    products: category.products.map((product) => ({ ...product })),
  })),
)

const rebateEditor = ref<{ firstError: () => string } | null>(null)

async function saveDefault() {
  const message = rebateEditor.value?.firstError() ?? ''
  if (message) {
    await mh5Alert(message)
    return
  }
  saveMemberDefaultRebateCategories(categories.value)
  await mh5Alert('会员默认退水已保存')
  router.back()
}
</script>

<template>
  <div class="mh5-member-rebate-edit-page">
    <Mh5SubPageHeader title="设置默认退水" />

    <main class="mh5-member-rebate-edit-main">
      <p class="mh5-member-rebate-edit-account">
        邀请链接加入的会员，现金退水按此默认值带出
        <span class="mh5-member-rebate-edit-account__type">默认退水</span>
      </p>

      <Mh5MemberRebateEditor ref="rebateEditor" :categories="categories" />
    </main>

    <footer class="mh5-member-rebate-edit-footer safe-pb">
      <button type="button" class="mh5-member-rebate-edit-footer__btn" @click="saveDefault">保存</button>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
