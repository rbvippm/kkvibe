<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  formatMemberRebateNumber,
  formatMemberRebatePercent,
  getMemberRebateProductIcon,
  memberDefaultRebateCategories,
  memberDefaultRebateUpdatedAt,
} from '../../constants/memberRebateRatio'
import { MEMBER_DEFAULT_REBATE_SPEC } from '../../constants/memberRebateRatioSpec'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const { withAgentQuery } = useAgentIdentity()

const categories = computed(() => memberDefaultRebateCategories.value)
const updatedAt = computed(() => memberDefaultRebateUpdatedAt.value)

function goEdit() {
  router.push({ name: 'mobile-member-default-rebate-edit', query: withAgentQuery() })
}
</script>

<template>
  <div class="mh5-member-rebate-page">
    <Mh5SubPageHeader title="会员默认退水">
      <template #right>
        <Mh5SpecAnnot :spec="MEMBER_DEFAULT_REBATE_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-member-rebate-main">
      <section class="mh5-member-rebate-profile">
        <div class="mh5-member-rebate-profile__left">
          <div class="mh5-member-rebate-profile__avatar" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="mh5-member-rebate-profile__meta">
            <h2>默认退水</h2>
            <span class="mh5-member-rebate-profile__tag">邀请链接</span>
          </div>
        </div>
        <button type="button" class="mh5-member-rebate-profile__edit" @click="goEdit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          修改
        </button>
      </section>

      <section class="mh5-member-rebate-list" aria-label="默认退水">
        <article
          v-for="category in categories"
          :key="category.key"
          class="mh5-member-rebate-list__group"
        >
          <div class="mh5-member-rebate-list__row">
            <div class="mh5-member-rebate-list__product">
              <span class="mh5-member-rebate-list__icon" aria-hidden="true">
                {{ getMemberRebateProductIcon(category.key) }}
              </span>
              <span class="mh5-member-rebate-list__name">{{ category.name }}</span>
            </div>
          </div>
          <div
            v-for="product in category.products"
            :key="`${category.key}-${product.key}`"
            class="mh5-member-rebate-list__row mh5-member-rebate-list__row--product"
          >
            <span class="mh5-member-rebate-list__name">{{ product.name }}</span>
            <div class="mh5-member-rebate-list__meta">
              <span class="mh5-member-rebate-list__value">{{ formatMemberRebatePercent(product.rebate) }}</span>
              <span class="mh5-member-rebate-list__max">最高{{ formatMemberRebateNumber(product.maxRebate) }}%</span>
            </div>
          </div>
        </article>
      </section>

      <p class="mh5-member-rebate-updated">修改时间 {{ updatedAt }}</p>
    </main>
  </div>
</template>
