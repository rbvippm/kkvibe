<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useMermaidDiagrams } from '../../composables/useMermaidRender'
import { avInteractionModesDiagrams } from '../../constants/avInteractionModesDiagrams'
import '../../styles/pc-wireframe.css'

type MermaidMount = HTMLElement | null

const mermaidSlots = ref<Partial<Record<keyof typeof avInteractionModesDiagrams, MermaidMount>>>({})

function bindMermaidSlot(key: keyof typeof avInteractionModesDiagrams) {
  return (el: Element | ComponentPublicInstance | null) => {
    mermaidSlots.value[key] = el instanceof Element ? (el as HTMLElement) : null
  }
}

useMermaidDiagrams(mermaidSlots, avInteractionModesDiagrams)
</script>

<template>
  <div class="pc-wireframe-page aim-doc-page">
    <WfPagePathMenu />

    <div class="aim-doc">
      <div class="wrap">
        <header class="doc-header">
          <h1>互联网音视频互动 · 三种核心模式</h1>
          <div class="meta">
            <span class="badge">v1.0</span>
            <span>需求调研</span>
            <span>更新：2026-06-17</span>
          </div>
          <div class="notice">
            <strong>说明：</strong>本文档从关系链、权限控制、核心目的、技术侧重点四个维度，对比
            <strong>链接分享</strong>（Google Meet）、<strong>好友通话</strong>（微信/FaceTime）、<strong>直播连麦</strong>（抖音/B站）三种模式，并说明 KK Vibe 当前产品定位。
            完整 PDF：<code>docs/音视频互动三种模式需求调研.pdf</code>
          </div>
        </header>

        <section id="framework">
          <h2>1. 分析框架</h2>
          <div :ref="bindMermaidSlot('framework')" class="mermaid" />
          <table>
            <thead>
              <tr><th>维度</th><th>说明</th><th>关键问题</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>关系链</strong></td><td>如何发现彼此、建立会话</td><td>陌生人 / 半熟人 / 强关系？</td></tr>
              <tr><td><strong>权限控制</strong></td><td>角色划分与操作权限</td><td>是否有绝对主持人？</td></tr>
              <tr><td><strong>核心目的</strong></td><td>用户主要诉求</td><td>沟通 / 陪伴 / 娱乐变现？</td></tr>
              <tr><td><strong>技术侧重点</strong></td><td>工程优先投入</td><td>质量 / 分发 / 弱网 / 混流</td></tr>
            </tbody>
          </table>
        </section>

        <section id="modes">
          <h2>2. 三种模式概览</h2>

          <h3>2.1 链接分享（Google Meet / Zoom）</h3>
          <p><strong>定义：</strong>临时性泛社交组会。专属 URL 点击加入，Host 主客制控场。</p>
          <div :ref="bindMermaidSlot('meetJourney')" class="mermaid" />

          <h3>2.2 好友通话（微信 / FaceTime）</h3>
          <p><strong>定义：</strong>强关系链熟人互动。单呼或群视频，成员平等自管设备。</p>
          <div :ref="bindMermaidSlot('friendJourney')" class="mermaid" />

          <h3>2.3 直播连麦（抖音 / B 站）</h3>
          <p><strong>定义：</strong>公开广播 + 连麦嘉宾 + 大规模围观，主播绝对中心化。</p>
          <div :ref="bindMermaidSlot('liveJourney')" class="mermaid" />
        </section>

        <section id="compare">
          <h2>3. 四维度对比</h2>
          <table>
            <thead>
              <tr>
                <th>维度</th>
                <th>链接分享</th>
                <th>好友通话</th>
                <th>直播连麦</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>建立连接</strong></td><td>专属 URL</td><td>好友/群组</td><td>进房后申请连麦</td></tr>
              <tr><td><strong>角色划分</strong></td><td>Host vs 与会者</td><td>平等成员</td><td>主播 / 嘉宾 / 观众</td></tr>
              <tr><td><strong>隐私度</strong></td><td>半私密</td><td>极私密</td><td>全公开</td></tr>
              <tr><td><strong>权限模型</strong></td><td>主客制</td><td>去中心化</td><td>绝对中心化</td></tr>
              <tr><td><strong>核心诉求</strong></td><td>高效沟通</td><td>情感陪伴</td><td>娱乐变现</td></tr>
              <tr><td><strong>典型规模</strong></td><td>2～500 人</td><td>1～9 人</td><td>万级观众</td></tr>
            </tbody>
          </table>
        </section>

        <section id="permission">
          <h2>4. 权限模型</h2>
          <div :ref="bindMermaidSlot('permission')" class="mermaid" />
        </section>

        <section id="tech">
          <h2>5. 技术架构差异</h2>
          <h3>5.1 链接分享 · SFU + 信令</h3>
          <div :ref="bindMermaidSlot('meetTech')" class="mermaid" />
          <h3>5.2 好友通话 · P2P + 推送</h3>
          <div :ref="bindMermaidSlot('friendTech')" class="mermaid" />
          <h3>5.3 直播连麦 · CDN + 混流</h3>
          <div :ref="bindMermaidSlot('liveTech')" class="mermaid" />
        </section>

        <section id="kkvibe">
          <h2>6. KK Vibe 定位</h2>
          <div :ref="bindMermaidSlot('kkvibePosition')" class="mermaid" />
          <table>
            <thead>
              <tr><th>对比项</th><th>模式三标准</th><th>KK Vibe 现状</th></tr>
            </thead>
            <tbody>
              <tr><td>媒体形态</td><td>视频 + 连麦</td><td>语音为主</td></tr>
              <tr><td>发现入口</td><td>推荐流</td><td>语聊大厅</td></tr>
              <tr><td>角色体系</td><td>主播/嘉宾/观众</td><td>房主/房管/在麦/观众</td></tr>
              <tr><td>关系链</td><td>弱关系</td><td>半公开，暂无好友链</td></tr>
            </tbody>
          </table>
        </section>

        <section id="roadmap">
          <h2>7. 后续建议</h2>
          <table>
            <thead>
              <tr><th>优先级</th><th>事项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td>P0</td><td>巩固模式三核心链路</td><td>麦位状态机、上麦审批、App/H5 协同</td></tr>
              <tr><td>P1</td><td>链接分享入房</td><td>引入模式一，支持运营拉新</td></tr>
              <tr><td>P2</td><td>房间隐私分级</td><td>公开 / 半公开 / 私密</td></tr>
              <tr><td>P3</td><td>好友关系链</td><td>引入模式二，需社交图谱</td></tr>
            </tbody>
          </table>
        </section>

        <section id="api">
          <h2>8. 核心 API 字段（Live Room）</h2>
          <table>
            <thead>
              <tr><th>字段</th><th>类型</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td><code>room_id</code></td><td>string</td><td>语聊房 ID</td></tr>
              <tr><td><code>anchor_user_id</code></td><td>string</td><td>房主 ID</td></tr>
              <tr><td><code>room_type</code></td><td>enum</td><td>public | semi_public | private</td></tr>
              <tr><td><code>seat_index</code></td><td>integer</td><td>麦位 1～8</td></tr>
              <tr><td><code>seat_status</code></td><td>enum</td><td>empty | occupied | locked | muted</td></tr>
              <tr><td><code>user_role</code></td><td>enum</td><td>anchor | admin | on_mic | viewer</td></tr>
              <tr><td><code>mic_apply_status</code></td><td>enum</td><td>none | pending | approved | rejected</td></tr>
              <tr><td><code>rtc_token</code></td><td>string</td><td>RTC 鉴权 Token</td></tr>
            </tbody>
          </table>
        </section>

        <footer>
          KK Vibe 原型文档 · Markdown：<code>docs/音视频互动三种模式需求调研.md</code>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aim-doc-page {
  background: #f5f5f7;
}

.aim-doc {
  --bg: #f5f5f7;
  --surface: #ffffff;
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --accent: #0071e3;
  --border: #d2d2d7;
  --code-bg: #f5f5f7;
  --warn-bg: #fff8e6;
  --warn-border: #f5d565;

  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
}

.aim-doc * {
  box-sizing: border-box;
}

.wrap {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 0 48px;
}

header.doc-header {
  background: var(--surface);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

header.doc-header h1 {
  margin: 0 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #e8f4fd;
  color: var(--accent);
}

.notice {
  background: var(--warn-bg);
  border: 1px solid var(--warn-border);
  border-radius: 12px;
  padding: 14px 18px;
  margin: 20px 0 0;
  font-size: 14px;
}

section {
  background: var(--surface);
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

h2 {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 650;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

h3 {
  margin: 20px 0 10px;
  font-size: 1rem;
  font-weight: 600;
}

p {
  margin: 0 0 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 12px 0 16px;
}

th,
td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}

th {
  background: var(--code-bg);
  font-weight: 600;
}

.mermaid {
  margin: 16px 0;
  overflow-x: auto;
  text-align: center;
}

.mermaid :deep(svg) {
  max-width: 100%;
  height: auto;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding-top: 16px;
}
</style>
