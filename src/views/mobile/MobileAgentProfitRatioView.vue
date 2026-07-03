<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  agentProfitRatioProducts,
  formatProfitRatioPercent,
  getAgentProfitRelationLabel,
} from '../../constants/agentProfitRatio'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const targetNickname = computed(() => String(route.query.targetName || 'Tom Cat%'))
const relationLabel = computed(() => getAgentProfitRelationLabel(String(route.query.relation || 'direct')))

function goEdit() {
  router.push({
    name: 'mobile-agent-profit-ratio-edit',
    query: {
      targetId: route.query.targetId,
      targetName: route.query.targetName,
      relation: route.query.relation,
    },
  })
}
</script>

<template>
  <div class="mh5-agent-profit-ratio-page">
    <Mh5SubPageHeader title="代理收益比例" />

    <main class="mh5-agent-profit-ratio-main">
      <section class="mh5-agent-profit-ratio-profile">
        <div class="mh5-agent-profit-ratio-profile__left">
          <div class="mh5-agent-profit-ratio-profile__avatar" aria-hidden="true">
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
          <div class="mh5-agent-profit-ratio-profile__meta">
            <h2>{{ targetNickname }}</h2>
            <span class="mh5-agent-profit-ratio-profile__tag">{{ relationLabel }}</span>
          </div>
        </div>
        <button type="button" class="mh5-agent-profit-ratio-profile__edit" @click="goEdit">
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

      <section class="mh5-agent-profit-ratio-table-wrap">
        <table class="mh5-agent-profit-ratio-table">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">占成</th>
              <th scope="col">退水</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in agentProfitRatioProducts" :key="row.key">
              <td class="mh5-agent-profit-ratio-table__product">{{ row.name }}</td>
              <td>
                <span class="mh5-agent-profit-ratio-table__value">
                  {{ formatProfitRatioPercent(row.share) }}
                </span>
              </td>
              <td>
                <span class="mh5-agent-profit-ratio-table__value">
                  {{ formatProfitRatioPercent(row.rebate) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>
