<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PRD_DIMENSION_HINT, PRD_DIMENSION_LABELS, type PcPrdDimensionKey } from '../../constants/pcPrdSpec'
import {
  LIVE_DANMAKU_MUTE_BACKGROUND,
  LIVE_DANMAKU_MUTE_FEATURE_LIST,
  LIVE_DANMAKU_MUTE_GOALS,
  LIVE_DANMAKU_MUTE_META,
} from '../../constants/liveDanmakuMuteSpec'
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
        <p class="wf-doc-page__module">所属模块：{{ LIVE_DANMAKU_MUTE_META.module }}</p>
        <h2 class="wf-doc-page__title">需求名称：{{ LIVE_DANMAKU_MUTE_META.title }}</h2>
        <p class="wf-doc-page__meta">
          PRD 版本：{{ LIVE_DANMAKU_MUTE_META.prdVersion }} · 最近更新：{{ LIVE_DANMAKU_MUTE_META.updatedAt }}
        </p>
        <p class="wf-doc-page__hint">{{ PRD_DIMENSION_HINT }}</p>
        <RouterLink :to="{ name: 'pc-live-danmaku-mute-list' }" class="wf-doc-page__back">
          ← 返回禁言列表
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
            <li v-for="(item, index) in LIVE_DANMAKU_MUTE_BACKGROUND" :key="index">{{ item }}</li>
          </ul>
        </section>

        <section class="wf-doc-page__section">
          <h3 class="wf-doc-page__section-title">2. 需求目标</h3>
          <ul class="wf-doc-page__list">
            <li v-for="(item, index) in LIVE_DANMAKU_MUTE_GOALS" :key="index">{{ item }}</li>
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
                <tr v-for="row in LIVE_DANMAKU_MUTE_FEATURE_LIST" :key="row.id">
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
          v-for="row in LIVE_DANMAKU_MUTE_FEATURE_LIST"
          :key="row.id"
          class="wf-doc-page__feature-card"
        >
          <header class="wf-doc-page__feature-header">
            <span class="wf-doc-page__feature-id">#{{ row.id }}</span>
            <div>
              <h4 class="wf-doc-page__feature-name">{{ row.module }} · {{ row.feature }}</h4>
              <p class="wf-doc-page__feature-loc">{{ row.pageLocation }}</p>
            </div>
          </header>
          <dl class="wf-doc-page__dimension-list">
            <div
              v-for="key in prdDimensionKeys"
              :key="key"
              class="wf-doc-page__dimension-row"
            >
              <dt class="wf-doc-page__dimension-label">{{ PRD_DIMENSION_LABELS[key] }}</dt>
              <dd class="wf-doc-page__dimension-value">{{ row.prd[key] }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  </div>
</template>
