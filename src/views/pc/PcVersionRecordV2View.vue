<script setup lang="ts">
import { ref } from 'vue'
import {
  VERSION_RECORD_V2_META,
  VERSION_V2_BACKGROUND,
  VERSION_V2_FEATURE_LIST,
  VERSION_V2_GOALS,
  VERSION_V2_REVISIONS,
} from '../../constants/versionRecordV2'
import '../../styles/pc-wireframe.css'

type DocTab = 'summary' | 'revisions'

const activeTab = ref<DocTab>('summary')
</script>

<template>
  <div class="pc-wireframe-page version-record-page">
    <section class="wf-block">
      <header class="version-record-page__header">
        <p class="version-record-page__version">版本号：{{ VERSION_RECORD_V2_META.version }}</p>
        <h2 class="version-record-page__title">需求名称：{{ VERSION_RECORD_V2_META.title }}</h2>
        <p class="version-record-page__meta">最近更新：{{ VERSION_RECORD_V2_META.updatedAt }}</p>
      </header>

      <div class="wf-tabs version-record-page__tabs">
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'summary' }"
          @click="activeTab = 'summary'"
        >
          需求概要
        </button>
        <button
          type="button"
          class="wf-tab"
          :class="{ 'wf-tab--active': activeTab === 'revisions' }"
          @click="activeTab = 'revisions'"
        >
          修订记录
        </button>
      </div>

      <div v-if="activeTab === 'summary'" class="version-record-page__summary">
        <section class="version-record-page__section">
          <h3 class="version-record-page__section-title">1. 需求背景</h3>
          <ul class="version-record-page__list">
            <li v-for="(item, index) in VERSION_V2_BACKGROUND" :key="index">{{ item }}</li>
          </ul>
        </section>

        <section class="version-record-page__section">
          <h3 class="version-record-page__section-title">2. 需求目标</h3>
          <ul class="version-record-page__list">
            <li v-for="(item, index) in VERSION_V2_GOALS" :key="index">{{ item }}</li>
          </ul>
        </section>

        <section class="version-record-page__section">
          <h3 class="version-record-page__section-title">3. 需求功能清单</h3>
          <div class="wf-table-wrap">
            <table class="wf-table version-record-page__table">
              <thead>
                <tr>
                  <th class="wf-th wf-th--no">编号</th>
                  <th class="wf-th">模块</th>
                  <th class="wf-th">功能点</th>
                  <th class="wf-th version-record-page__th-desc">说明</th>
                  <th class="wf-th">关联页面</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="VERSION_V2_FEATURE_LIST.length === 0">
                  <td colspan="5" class="wf-td wf-td--empty">暂无功能清单</td>
                </tr>
                <tr v-for="row in VERSION_V2_FEATURE_LIST" :key="row.id">
                  <td class="wf-td wf-td--center">{{ row.id }}</td>
                  <td class="wf-td">{{ row.module }}</td>
                  <td class="wf-td">{{ row.feature }}</td>
                  <td class="wf-td version-record-page__td-desc">{{ row.description }}</td>
                  <td class="wf-td version-record-page__td-pages">
                    <p
                      v-for="page in row.relatedPages"
                      :key="page"
                      class="version-record-page__page-item"
                    >
                      {{ page }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div v-else class="wf-table-wrap">
        <table class="wf-table version-record-page__table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">版本号</th>
              <th class="wf-th">修订日期</th>
              <th class="wf-th version-record-page__th-desc">修订内容</th>
              <th class="wf-th">修订人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="VERSION_V2_REVISIONS.length === 0">
              <td colspan="5" class="wf-td wf-td--empty">暂无修订记录</td>
            </tr>
            <tr v-for="row in VERSION_V2_REVISIONS" :key="row.id">
              <td class="wf-td wf-td--center">{{ row.id }}</td>
              <td class="wf-td">{{ row.version }}</td>
              <td class="wf-td">{{ row.date }}</td>
              <td class="wf-td version-record-page__td-desc">{{ row.content }}</td>
              <td class="wf-td">{{ row.author }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.version-record-page__header {
  margin-bottom: 16px;
}

.version-record-page__version {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-primary, #1677ff);
}

.version-record-page__title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--pc-text, #262626);
}

.version-record-page__meta {
  margin: 0;
  font-size: 12px;
  color: var(--pc-text-muted, #8c8c8c);
}

.version-record-page__tabs {
  margin-bottom: 0;
}

.version-record-page__summary {
  padding-top: 16px;
}

.version-record-page__section {
  margin-bottom: 24px;
}

.version-record-page__section:last-child {
  margin-bottom: 0;
}

.version-record-page__section-title {
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1677ff);
  font-size: 15px;
  font-weight: 600;
  color: var(--pc-text, #262626);
}

.version-record-page__list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--pc-text-secondary, #595959);
}

.version-record-page__list li + li {
  margin-top: 8px;
}

.version-record-page__table {
  margin-top: 0;
}

.version-record-page__th-desc,
.version-record-page__td-desc {
  min-width: 280px;
  white-space: pre-line;
}

.version-record-page__td-pages {
  min-width: 200px;
}

.version-record-page__page-item {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--pc-text-secondary, #595959);
}

.version-record-page__page-item + .version-record-page__page-item {
  margin-top: 4px;
}
</style>
