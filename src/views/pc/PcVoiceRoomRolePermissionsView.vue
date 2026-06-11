<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useMermaidDiagrams } from '../../composables/useMermaidRender'
import { voiceRoomRolePermissionsDiagrams } from '../../constants/voiceRoomRolePermissionsDiagrams'
import '../../styles/pc-wireframe.css'

type MermaidMount = HTMLElement | null

const mermaidSlots = ref<Partial<Record<keyof typeof voiceRoomRolePermissionsDiagrams, MermaidMount>>>({})

function bindMermaidSlot(key: keyof typeof voiceRoomRolePermissionsDiagrams) {
  return (el: Element | ComponentPublicInstance | null) => {
    mermaidSlots.value[key] = el instanceof Element ? (el as HTMLElement) : null
  }
}

useMermaidDiagrams(mermaidSlots, voiceRoomRolePermissionsDiagrams)
</script>

<template>
  <div class="pc-wireframe-page vrrp-doc-page">
    <WfPagePathMenu />

    <div class="vrrp-doc">
      <div class="wrap">
        <header class="doc-header">
          <h1>语聊房 · 角色权限与麦控规范</h1>
          <div class="meta">
            <span class="badge">v1.1</span>
            <span>范围：禁音 / 禁麦（不含弹幕）</span>
            <span>更新：2026-05-28</span>
          </div>
          <div class="notice">
            <strong>说明：</strong>本文档中「禁言」均指 <strong>语音禁麦</strong>，不涉及公屏或弹幕文字禁言。房管
            <strong>不可</strong> 设置/撤销房管，<strong>不可</strong> 踢房管下麦；对其它房管
            <strong>仅可禁麦</strong>。任免房管、踢房管仅 <strong>房主</strong> 可操作。<br />
            <strong>礼物打赏：</strong><strong>房主、房管、其他麦、观众</strong> 均可打赏；对象为房间内
            <strong>所有在麦用户</strong>；<strong>不可打赏自己</strong>。
          </div>
        </header>

        <section id="scope">
          <h2>1. 适用范围</h2>
          <table>
            <thead>
              <tr><th>在范围内</th><th>不在范围内</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>开麦/闭麦、单麦禁麦、全体禁麦</td>
                <td>弹幕禁言、公屏文字管控</td>
              </tr>
              <tr>
                <td>踢麦、下麦、换位、关闭麦位</td>
                <td>聊天敏感词策略</td>
              </tr>
              <tr>
                <td>房管任免（仅房主）</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>礼物打赏</strong>（全角色、麦上全员、不可打赏自己）</td>
                <td>对未上麦观众打赏（若产品不做）</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="roles">
          <h2>2. 角色与身份来源</h2>
          <table>
            <thead>
              <tr><th>角色</th><th>来源</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>房主</strong></td><td>创建房间</td><td>1 号麦，不可换位</td></tr>
              <tr><td><strong>房管</strong></td><td>房主任命 / 后台</td><td>管理权 &lt; 房主</td></tr>
              <tr><td><strong>其他麦</strong></td><td>上麦后</td><td>自控 + 互动</td></tr>
              <tr><td><strong>普通观众</strong></td><td>进房</td><td>打赏、关注、申请上麦</td></tr>
            </tbody>
          </table>
          <p><strong>权限层级：</strong>房主 &gt; 房管 &gt; 其他麦 &gt; 普通观众</p>
        </section>

        <section id="capabilities">
          <h2>3. 角色能力清单</h2>

          <h3>3.1 房主</h3>
          <ul>
            <li>开麦/闭麦（自己及他人）</li>
            <li>踢麦（含踢房管）、关闭位子（2～N）、单麦禁麦、全体禁麦</li>
            <li><strong>设置 / 撤销房管</strong>（独有）</li>
            <li>1 号麦不可换位；礼物打赏 / 关注（<strong>麦上全员，不含自己</strong>）</li>
          </ul>

          <h3>3.2 房管</h3>
          <ul>
            <li>开麦/闭麦、踢麦（<strong>仅普通在麦用户</strong>）</li>
            <li>对其它房管：<strong>仅单麦禁麦</strong>，不可踢、不可任免</li>
            <li>下麦、换位（不含 1 号）、关闭位子（2～N）、全体禁麦</li>
            <li class="cross">不可设置/撤销房管 · 不可踢房管</li>
            <li>礼物打赏 / 关注（<strong>麦上全员，不含自己</strong>）</li>
          </ul>

          <h3>3.3 其他麦</h3>
          <ul>
            <li>开麦/闭麦、下麦、换位（不可换入 1 号）</li>
            <li>礼物打赏 / 关注（<strong>麦上全员，不含自己</strong>）</li>
          </ul>

          <h3>3.4 普通观众</h3>
          <ul>
            <li>礼物打赏 / 关注（<strong>麦上全员，不含自己</strong>）；满足条件可申请上麦</li>
          </ul>

          <h3>3.5 礼物打赏（全角色通用）</h3>
          <table>
            <thead>
              <tr><th>规则</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td>可操作角色</td><td>房主、房管、其他麦、观众 <strong>均可</strong></td></tr>
              <tr><td>可打赏对象</td><td>房间内 <strong>所有在麦用户</strong></td></tr>
              <tr><td>禁止</td><td><strong>不可打赏自己</strong></td></tr>
              <tr><td>空麦位</td><td>不可作为打赏目标</td></tr>
            </tbody>
          </table>
          <div class="mermaid" :ref="bindMermaidSlot('gift')" />
        </section>

        <section id="hierarchy">
          <h2>4. 权限层级与继承</h2>
          <div class="mermaid" :ref="bindMermaidSlot('hierarchy')" />
          <ul>
            <li>冲突时：<strong>房主 &gt; 房管 &gt; 本人</strong></li>
            <li>房管对房管：仅 <code>muteMic</code>，拒绝 <code>kickMic</code>、<code>setAdmin</code></li>
          </ul>
        </section>

        <section id="control">
          <h2>5. 控制范围总览</h2>
          <div class="mermaid" :ref="bindMermaidSlot('control')" />
        </section>

        <section id="flows">
          <h2>6. 核心流程</h2>

          <h3>6.1 进房与角色判定</h3>
          <div class="mermaid" :ref="bindMermaidSlot('joinRole')" />

          <h3>6.2 踢麦权限校验</h3>
          <div class="mermaid" :ref="bindMermaidSlot('kickMic')" />

          <h3>6.3 任免房管（仅房主）</h3>
          <div class="mermaid" :ref="bindMermaidSlot('setAdmin')" />

          <h3>6.4 全体禁麦 / 单麦禁麦</h3>
          <div class="mermaid" :ref="bindMermaidSlot('muteMic')" />

          <h3>6.5 礼物打赏</h3>
          <div class="mermaid" :ref="bindMermaidSlot('sendGift')" />
        </section>

        <section id="matrix">
          <h2>7. 能力对照表</h2>
          <table>
            <thead>
              <tr>
                <th>能力</th>
                <th>房主</th>
                <th>房管</th>
                <th>其他麦</th>
                <th>观众</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>开麦/闭麦（自己）</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td><td class="muted">—</td></tr>
              <tr><td>开麦/闭麦（他人）</td><td class="check">✓</td><td class="check">✓*</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>踢麦（普通在麦）</td><td class="check">✓</td><td class="check">✓</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>踢麦（房管）</td><td class="check">✓</td><td class="cross">✗</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>对房管：仅禁麦</td><td class="check">✓</td><td class="check">✓</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>下麦（自己）</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td><td class="muted">—</td></tr>
              <tr><td>全体禁麦</td><td class="check">✓</td><td class="check">✓</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>单麦禁麦</td><td class="check">✓</td><td class="check">✓*</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>关闭位子</td><td class="check">✓</td><td class="check">✓*</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>换位子</td><td class="muted">—**</td><td class="check">✓*</td><td class="check">✓*</td><td class="muted">—</td></tr>
              <tr><td>设置/撤销房管</td><td class="check">✓</td><td class="cross">✗</td><td class="cross">—</td><td class="muted">—</td></tr>
              <tr><td>礼物打赏</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
              <tr><td>打赏对象</td><td colspan="4">麦上所有用户（<strong>不可打赏自己</strong>）</td></tr>
              <tr><td>关注</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
              <tr><td>1号麦不可换</td><td>锁定</td><td>不可占</td><td>不可换入</td><td>不可申请</td></tr>
            </tbody>
          </table>
          <p class="muted">* 不对 1 号麦/房主生效（建议） &nbsp;|&nbsp; ** 房主本人不可离 1 号换位 &nbsp;|&nbsp; 礼物：全角色可打赏麦上全员，不可对自己</p>
        </section>

        <section id="api">
          <h2>8. API 字段建议</h2>
          <table>
            <thead>
              <tr><th>接口 / 事件</th><th>字段</th></tr>
            </thead>
            <tbody>
              <tr><td>进房</td><td><code>role</code>: owner | admin | guest</td></tr>
              <tr><td>麦控</td><td><code>muteType</code>: none | self | single_mic | room_all_mic</td></tr>
              <tr><td>踢麦</td><td>房管踢 admin → <code>ERR_ADMIN_KICK_FORBIDDEN</code></td></tr>
              <tr><td>房管</td><td><code>setAdmin</code> 仅 <code>operatorRole=owner</code></td></tr>
              <tr><td>换位</td><td><code>allowSeat1</code>: false</td></tr>
              <tr><td>礼物</td><td><code>sendGift</code>；<code>listGiftTargets</code> 排除本人 uid</td></tr>
              <tr><td>错误码</td><td><code>ERR_GIFT_SELF</code>、<code>ERR_GIFT_TARGET_NOT_ON_MIC</code></td></tr>
            </tbody>
          </table>
        </section>

        <section id="edge">
          <h2>9. 边界与异常</h2>
          <table>
            <thead>
              <tr><th>场景</th><th>预期</th></tr>
            </thead>
            <tbody>
              <tr><td>房管任免房管</td><td><code>ERR_NO_PERMISSION</code></td></tr>
              <tr><td>房管踢房管</td><td>拒绝；可改用禁麦</td></tr>
              <tr><td>麦位已关闭</td><td><code>ERR_SEAT_CLOSED</code></td></tr>
              <tr><td>全体禁麦中开麦</td><td>按钮不可用</td></tr>
              <tr><td>打赏目标为自己</td><td><code>ERR_GIFT_SELF</code> 或入口置灰</td></tr>
              <tr><td>打赏目标已下麦</td><td><code>ERR_GIFT_TARGET_NOT_ON_MIC</code></td></tr>
            </tbody>
          </table>
        </section>

        <footer>
          KK Vibe 原型文档 · 配套 Markdown：<code>docs/语聊房角色权限.md</code>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vrrp-doc-page {
  background: #f5f5f7;
}

.vrrp-doc {
  --bg: #f5f5f7;
  --surface: #ffffff;
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --accent: #0071e3;
  --border: #d2d2d7;
  --code-bg: #f5f5f7;
  --success: #34c759;
  --danger: #ff3b30;
  --warn-bg: #fff8e6;
  --warn-border: #f5d565;

  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
}

.vrrp-doc * {
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
  color: var(--text);
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
  color: var(--text);
}

h3 {
  margin: 20px 0 10px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
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

.check {
  color: var(--success);
  font-weight: 700;
}

.cross {
  color: var(--danger);
  font-weight: 700;
}

.muted {
  color: var(--text-secondary);
}

ul {
  margin: 8px 0 16px;
  padding-left: 1.25rem;
}

li {
  margin-bottom: 6px;
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

.mermaid-fallback {
  margin: 0;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap;
  background: var(--code-bg);
  border-radius: 8px;
  color: var(--text);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text);
}

footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding-top: 16px;
}
</style>
