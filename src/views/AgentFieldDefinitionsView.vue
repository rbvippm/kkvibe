<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AGENT_FIELD_DEF_FORMULAS,
  AGENT_FIELD_DEF_META,
  AGENT_FIELD_DEF_MODULES,
  AGENT_FIELD_DEF_SCENARIOS,
} from '../constants/agentFieldDefinitions'
import '../styles/home-entry.css'
import '../styles/agent-field-definitions.css'

onMounted(() => {
  document.documentElement.classList.add('theme-home-light')
})

onUnmounted(() => {
  document.documentElement.classList.remove('theme-home-light')
})
</script>

<template>
  <div class="agent-field-def">
    <header class="agent-field-def__header">
      <div class="agent-field-def__header-inner">
        <RouterLink to="/" class="agent-field-def__back">← 返回首页</RouterLink>
        <p class="agent-field-def__eyebrow">{{ AGENT_FIELD_DEF_META.subtitle }}</p>
        <h1 class="agent-field-def__title">{{ AGENT_FIELD_DEF_META.title }}</h1>
        <div class="agent-field-def__nav">
          <a
            v-for="mod in AGENT_FIELD_DEF_MODULES"
            :key="mod.id"
            class="agent-field-def__nav-link"
            :href="`#field-${mod.id}`"
          >
            {{ mod.title.replace(/^模块[:：]?【?/, '').replace(/】$/, '') }}
          </a>
        </div>
      </div>
    </header>

    <main class="agent-field-def__main">
      <section
        v-for="mod in AGENT_FIELD_DEF_MODULES"
        :id="`field-${mod.id}`"
        :key="mod.id"
        class="agent-field-def__section"
      >
        <h2 class="agent-field-def__section-title">{{ mod.title }}</h2>
        <p v-if="mod.note" class="agent-field-def__section-note">{{ mod.note }}</p>
        <div class="agent-field-def__table-wrap">
          <table class="agent-field-def__table">
            <thead>
              <tr>
                <th v-for="col in AGENT_FIELD_DEF_META.columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in mod.rows" :key="`${mod.id}-${row.no}-${row.name}`">
                <td class="agent-field-def__td--no">{{ row.no }}</td>
                <td class="agent-field-def__td--name">{{ row.name }}</td>
                <td>{{ row.biz }}</td>
                <td>{{ row.dimension }}</td>
                <td class="agent-field-def__td--method">{{ row.method }}</td>
                <td class="agent-field-def__td--handler">{{ row.handler }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="agent-field-def__section">
        <h2 class="agent-field-def__section-title">核心公式汇总</h2>
        <ol class="agent-field-def__formulas">
          <li v-for="(item, index) in AGENT_FIELD_DEF_FORMULAS" :key="index">{{ item }}</li>
        </ol>
      </section>

      <section class="agent-field-def__section">
        <h2 class="agent-field-def__section-title">统计场景说明</h2>
        <div class="agent-field-def__scenarios">
          <article
            v-for="(scene, index) in AGENT_FIELD_DEF_SCENARIOS"
            :key="index"
            class="agent-field-def__scenario"
          >
            <h3>{{ scene.title }}</h3>
            <ul>
              <li v-for="(line, lineIndex) in scene.lines" :key="lineIndex">{{ line }}</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
