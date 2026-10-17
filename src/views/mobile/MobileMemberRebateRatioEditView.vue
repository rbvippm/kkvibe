<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5MemberRebateEditor from '../../components/mobile/Mh5MemberRebateEditor.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  getMemberRebateCategories,
  MEMBER_REBATE_RATIO_TYPE_LABEL,
  parseMemberRebateRatioType,
  saveMemberRebateCategories,
  type MemberRebateCategory,
} from '../../constants/memberRebateRatio'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const ratioType = computed(() => parseMemberRebateRatioType(String(route.query.ratioType || 'cash')))
const ratioTypeLabel = computed(() => MEMBER_REBATE_RATIO_TYPE_LABEL[ratioType.value])

const categories = ref<MemberRebateCategory[]>(
  getMemberRebateCategories(ratioType.value).value.map((category) => ({
    ...category,
    products: category.products.map((product) => ({ ...product })),
  })),
)

const rebateEditor = ref<{ firstError: () => string } | null>(null)

const targetNickname = computed(() => String(route.query.targetName || 'OO12300932'))
const pageTitle = computed(() => `设置${ratioTypeLabel.value}退水`)

async function saveRatios() {
  const message = rebateEditor.value?.firstError() ?? ''
  if (message) {
    await mh5Alert(message)
    return
  }
  saveMemberRebateCategories(ratioType.value, categories.value)
  await mh5Alert(`${ratioTypeLabel.value}退水比例已保存`)
  router.back()
}
</script>

<template>
  <div class="mh5-member-rebate-edit-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <main class="mh5-member-rebate-edit-main">
      <p class="mh5-member-rebate-edit-account">
        会员账号：{{ targetNickname }}
        <span class="mh5-member-rebate-edit-account__type">{{ ratioTypeLabel }}退水</span>
      </p>

      <Mh5MemberRebateEditor ref="rebateEditor" :categories="categories" />
    </main>

    <footer class="mh5-member-rebate-edit-footer safe-pb">
      <button type="button" class="mh5-member-rebate-edit-footer__btn" @click="saveRatios">{{ $t('保存') }}</button>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
