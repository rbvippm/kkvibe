<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  cloneMemberRebateProducts,
  getMemberRebateProductIcon,
  getMemberRebateProducts,
  MEMBER_REBATE_RATIO_TYPE_LABEL,
  parseMemberRebateRatioType,
  saveMemberRebateProducts,
  type MemberRebateProduct,
} from '../../constants/memberRebateRatio'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const ratioType = computed(() => parseMemberRebateRatioType(String(route.query.ratioType || 'cash')))
const ratioTypeLabel = computed(() => MEMBER_REBATE_RATIO_TYPE_LABEL[ratioType.value])

const rebatePercent = ref(0)
const products = ref<MemberRebateProduct[]>(
  cloneMemberRebateProducts(getMemberRebateProducts(ratioType.value).value),
)

const targetNickname = computed(() => String(route.query.targetName || 'OO12300932'))
const pageTitle = computed(() => `设置${ratioTypeLabel.value}退水`)

function clampRebate(product: MemberRebateProduct, value: number) {
  if (Number.isNaN(value) || value < 0) return 0
  return Math.min(value, product.maxRebate)
}

function updateRebate(product: MemberRebateProduct, raw: string) {
  product.rebate = clampRebate(product, Number(raw))
}

function applyGlobalRebate() {
  products.value.forEach((product) => {
    product.rebate = clampRebate(product, rebatePercent.value)
  })
}

async function saveRatios() {
  saveMemberRebateProducts(ratioType.value, products.value)
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

      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">退水</span>
        <div class="mh5-agent-credit-slider">
          <div class="mh5-agent-credit-slider__track">
            <div class="mh5-agent-credit-slider__fill" :style="{ width: `${rebatePercent}%` }" />
            <input
              v-model.number="rebatePercent"
              class="mh5-agent-credit-slider__input"
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label="退水比例"
              @change="applyGlobalRebate"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ rebatePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section
        v-for="product in products"
        :key="product.key"
        class="mh5-member-rebate-edit-product"
      >
        <div class="mh5-member-rebate-edit-product__head">
          <span class="mh5-member-rebate-edit-product__icon" aria-hidden="true">
            {{ getMemberRebateProductIcon(product.key) }}
          </span>
          <h3>{{ product.name }}</h3>
        </div>
        <div class="mh5-member-rebate-edit-product__panel">
          <div class="mh5-member-rebate-edit-product__row">
            <span>退水</span>
            <label class="mh5-member-rebate-edit-product__input-wrap">
              <input
                :value="product.rebate"
                type="number"
                min="0"
                :max="product.maxRebate"
                step="0.1"
                inputmode="decimal"
                @input="updateRebate(product, ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
          </div>
        </div>
      </section>
    </main>

    <footer class="mh5-member-rebate-edit-footer safe-pb">
      <button type="button" class="mh5-member-rebate-edit-footer__btn" @click="saveRatios">保存</button>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
