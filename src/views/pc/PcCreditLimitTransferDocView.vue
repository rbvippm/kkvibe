<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PRD_DIMENSION_HINT, PRD_DIMENSION_LABELS, type PcPrdDimensionKey } from '../../constants/pcPrdSpec'
import {
  CREDIT_LIMIT_TRANSFER_BACKGROUND,
  CREDIT_LIMIT_TRANSFER_FEATURE_LIST,
  CREDIT_LIMIT_TRANSFER_GOALS,
  CREDIT_LIMIT_TRANSFER_META,
} from '../../constants/creditLimitTransferSpec'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import '../../styles/pc-wireframe.css'

type DocTab = 'summary' | 'features'

const activeTab = ref<DocTab>('features')
const prdDimensionKeys = Object.keys(PRD_DIMENSION_LABELS) as PcPrdDimensionKey[]
</script>

<template>
  <div class="pc-wireframe-page wf-doc-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <header class="wf-doc-page__header">
        <p class="wf-doc-page__module">所属模块：{{ CREDIT_LIMIT_TRANSFER_META.module }}</p>
        <h2 class="wf-doc-page__title">需求名称：{{ CREDIT_LIMIT_TRANSFER_META.title }}</h2>
        <p class="wf-doc-page__meta">
          PRD 版本：{{ CREDIT_LIMIT_TRANSFER_META.prdVersion }} · 最近更新：{{
            CREDIT_LIMIT_TRANSFER_META.updatedAt
          }}
        </p>
        <p class="wf-doc-page__hint">{{ PRD_DIMENSION_HINT }}</p>
        <RouterLink :to="{ name: 'pc-credit-limit-transfer' }" class="wf-doc-page__back">
          ← 返回信用额度上下分记录
        </RouterLink>
      </header>

      <div class="wf-tabs wf-doc-page__tabs">
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'summary' }"
          @click="activeTab = 'summary'"
        >
          PRD 概要
        </button>
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'features' }"
          @click="activeTab = 'features'"
        >
          功能清单
        </button>
      </div>

      <div v-if="activeTab === 'summary'" class="wf-doc-page__summary">
        <section class="wf-doc-page__section">
          <h3 class="wf-doc-page__section-title">1. 需求背景</h3>
          <ul class="wf-doc-page__list">
            <li v-for="(item, index) in CREDIT_LIMIT_TRANSFER_BACKGROUND" :key="index">
              {{ item }}
            </li>
          </ul>
        </section>

        <section class="wf-doc-page__section">
          <h3 class="wf-doc-page__section-title">2. 需求目标</h3>
          <ul class="wf-doc-page__list">
            <li v-for="(item, index) in CREDIT_LIMIT_TRANSFER_GOALS" :key="index">{{ item }}</li>
          </ul>
        </section>

        <section class="wf-doc-page__section">
          <h3 class="wf-doc-page__section-title">3. 功能索引</h3>
          <div class="wf-table-wrap">
            <table class="wf-table">
              <thead>
                <tr>
                  <th class="wf-th wf-th--no">编号</th>
                  <th class="wf-th">模块</th>
                  <th class="wf-th">功能点</th>
                  <th class="wf-th">页面位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in CREDIT_LIMIT_TRANSFER_FEATURE_LIST" :key="row.id">
                  <td class="wf-td wf-td--center">{{ row.id }}</td>
                  <td class="wf-td">{{ row.module }}</td>
                  <td class="wf-td">{{ row.feature }}</td>
                  <td class="wf-td">{{ row.pageLocation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div v-else class="wf-doc-page__features">
        <article
          v-for="row in CREDIT_LIMIT_TRANSFER_FEATURE_LIST"
          :key="row.id"
          class="wf-doc-page__feature-card"
        >
          <header class="wf-doc-page__feature-header">
            <span class="wf-doc-page__feature-id">注{{ row.id }}</span>
            <div>
              <h3 class="wf-doc-page__feature-title">{{ row.feature }}</h3>
              <p class="wf-doc-page__feature-meta">
                {{ row.module }} · {{ row.pageLocation }}
              </p>
            </div>
          </header>
          <dl class="wf-doc-page__prd-grid">
            <div v-for="key in prdDimensionKeys" :key="key" class="wf-doc-page__prd-item">
              <dt>{{ PRD_DIMENSION_LABELS[key] }}</dt>
              <dd>{{ row.prd[key] }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  </div>
</template>
