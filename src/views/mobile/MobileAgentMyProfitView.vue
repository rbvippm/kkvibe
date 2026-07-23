<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AGENT_MY_PROFIT_ASSETS,
  AGENT_MY_PROFIT_FOOTNOTE,
  AGENT_MY_PROFIT_PRESETS,
  AGENT_MY_PROFIT_PRODUCT_ROWS,
  AGENT_MY_PROFIT_SUMMARY_ROW,
  AGENT_MY_PROFIT_TOTAL,
  agentMyProfitDateRangeText,
  agentMyProfitDetailRows,
  agentMyProfitHasDetail,
  agentMyProfitToneClass,
  type AgentMyProfitProductRow,
  type RangePreset,
} from '../../constants/agentMyProfit'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const preset = ref<RangePreset>('today')
const detailProduct = ref<AgentMyProfitProductRow | null>(null)
const detailFormulaTipOpen = ref(false)

const dateRangeText = computed(() => agentMyProfitDateRangeText(preset.value))
const detailTitle = computed(() =>
  detailProduct.value ? `${detailProduct.value.name}盈亏明细` : '盈亏明细',
)
const detailRows = computed(() =>
  detailProduct.value ? agentMyProfitDetailRows(detailProduct.value.key) : [],
)
const detailFormulaText = computed(
  () => detailRows.value.find((row) => row.formulaTip)?.formulaTip ?? '',
)
const footnoteLines = AGENT_MY_PROFIT_FOOTNOTE.split('\n')

function closeDetail() {
  detailFormulaTipOpen.value = false
  detailProduct.value = null
}

function toggleDetailFormulaTip() {
  detailFormulaTipOpen.value = !detailFormulaTipOpen.value
}

function closeDetailFormulaTip() {
  detailFormulaTipOpen.value = false
}

/** 明确回到代理概况，避免 history.back 异常或 Teleport 遮罩残留导致首页空白 */
function goBack() {
  closeDetail()
  router.push({ name: 'mobile-agent' })
}

function openDetail(row: AgentMyProfitProductRow) {
  if (!agentMyProfitHasDetail(row.key)) return
  closeDetailFormulaTip()
  detailProduct.value = row
}

onBeforeUnmount(() => {
  closeDetail()
  closeDetailFormulaTip()
})
</script>

<template>
  <!-- Figma 1433:17568 · 代理中心-首页-我的盈亏 -->
  <div class="mh5-agent-my-profit-page" data-name="代理中心-首页-我的盈亏">
    <div class="mh5-agent-my-profit-hero">
      <header class="mh5-agent-my-profit-nav">
        <button type="button" class="mh5-agent-my-profit-nav__back" aria-label="返回" @click="goBack">
          <img :src="AGENT_MY_PROFIT_ASSETS.backIcon" alt="" width="24" height="24" />
        </button>
        <h1 class="mh5-agent-my-profit-nav__title">我的盈亏</h1>
        <!-- 占位，与左侧返回对称，保证标题居中 -->
        <div class="mh5-agent-my-profit-nav__right" aria-hidden="true" />
      </header>

      <section class="mh5-agent-my-profit-total" aria-label="总盈亏">
        <img
          class="mh5-agent-my-profit-total__deco"
          :src="AGENT_MY_PROFIT_ASSETS.decoCoin"
          alt=""
          aria-hidden="true"
        />
        <p class="mh5-agent-my-profit-total__label">{{ AGENT_MY_PROFIT_TOTAL.label }}</p>
        <p
          class="mh5-agent-my-profit-total__value"
          :class="agentMyProfitToneClass(AGENT_MY_PROFIT_TOTAL.tone)"
        >
          {{ AGENT_MY_PROFIT_TOTAL.valueText }}
        </p>
      </section>

      <div class="mh5-agent-my-profit-date">
        <div class="mh5-agent-my-profit-date__row">
          <p class="mh5-agent-my-profit-date__label">数据时间段</p>
          <div class="mh5-agent-my-profit-date__picker">
            <div class="mh5-agent-my-profit-date__range">
              <p>{{ dateRangeText }}</p>
            </div>
            <span class="mh5-agent-my-profit-date__icon" aria-hidden="true">
              <img :src="AGENT_MY_PROFIT_ASSETS.calendarIcon" alt="" width="34" height="34" />
            </span>
          </div>
        </div>
        <div class="mh5-agent-my-profit-date__presets" role="tablist" aria-label="快捷时间">
          <button
            v-for="item in AGENT_MY_PROFIT_PRESETS"
            :key="item.key"
            type="button"
            role="tab"
            class="mh5-agent-my-profit-date__preset"
            :class="{ 'mh5-agent-my-profit-date__preset--active': preset === item.key }"
            :aria-selected="preset === item.key"
            @click="preset = item.key"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <main class="mh5-agent-my-profit-main">
      <section class="mh5-agent-my-profit-table" aria-label="占成项盈亏">
        <div class="mh5-agent-my-profit-table__head">
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">占成项</span>
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">盈亏</span>
        </div>
        <component
          :is="agentMyProfitHasDetail(row.key) ? 'button' : 'div'"
          v-for="(row, index) in AGENT_MY_PROFIT_PRODUCT_ROWS"
          :key="row.key"
          :type="agentMyProfitHasDetail(row.key) ? 'button' : undefined"
          class="mh5-agent-my-profit-table__row"
          :class="{
            'mh5-agent-my-profit-table__row--alt': index % 2 === 1,
            'mh5-agent-my-profit-table__row--static': !agentMyProfitHasDetail(row.key),
          }"
          @click="openDetail(row)"
        >
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ row.name }}
          </span>
          <span
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
            :class="[
              agentMyProfitToneClass(row.tone),
              { 'mh5-agent-my-profit-table__link': agentMyProfitHasDetail(row.key) },
            ]"
          >
            {{ row.amountText }}
          </span>
        </component>
      </section>

      <button
        type="button"
        class="mh5-agent-my-profit-summary"
        aria-label="查看总计盈亏明细"
        @click="openDetail(AGENT_MY_PROFIT_SUMMARY_ROW)"
      >
        <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
          {{ AGENT_MY_PROFIT_SUMMARY_ROW.name }}
        </span>
        <span
          class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount mh5-agent-my-profit-table__link"
          :class="agentMyProfitToneClass(AGENT_MY_PROFIT_SUMMARY_ROW.tone)"
        >
          {{ AGENT_MY_PROFIT_SUMMARY_ROW.amountText }}
        </span>
      </button>

      <p class="mh5-agent-my-profit-footnote">
        <span v-for="(line, i) in footnoteLines" :key="i">
          {{ line }}<br v-if="i < footnoteLines.length - 1" />
        </span>
      </p>
    </main>

    <!-- 弹层挂在页面内，避免路由切换时 body Teleport 与 out-in 冲突导致白屏 -->
    <Transition name="mh5-agent-my-profit-dialog">
      <div
        v-if="detailProduct"
        class="mh5-agent-my-profit-dialog-mask"
        @click.self="closeDetail"
      >
        <div
          class="mh5-agent-my-profit-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="detailTitle"
          @click="closeDetailFormulaTip"
        >
          <h2 class="mh5-agent-my-profit-dialog__title">{{ detailTitle }}</h2>
          <div class="mh5-agent-my-profit-dialog__table">
            <div class="mh5-agent-my-profit-dialog__head">
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                实占细项
              </span>
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value">
                金额
              </span>
            </div>
            <div
              v-for="row in detailRows"
              :key="row.label"
              class="mh5-agent-my-profit-dialog__row"
              :class="{ 'mh5-agent-my-profit-dialog__row--emphasize': row.emphasize }"
            >
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                <span class="mh5-agent-my-profit-dialog__label-wrap">
                  <span>{{ row.label }}</span>
                  <button
                    v-if="row.formulaTip"
                    type="button"
                    class="mh5-agent-my-profit-dialog__tip-btn"
                    :aria-label="`查看${row.label}计算公式`"
                    :aria-expanded="detailFormulaTipOpen"
                    @click.stop="toggleDetailFormulaTip"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                      <path
                        d="M8 4.6v5.2M8 11.6h.01"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </span>
                <small v-if="row.labelHint">{{ row.labelHint }}</small>
              </span>
              <span
                class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value"
                :class="agentMyProfitToneClass(row.tone)"
              >
                {{ row.amountText }}
              </span>
            </div>
          </div>
          <div
            v-if="detailFormulaTipOpen && detailFormulaText"
            class="mh5-agent-my-profit-dialog__tip-panel"
            role="tooltip"
            @click.stop
          >
            {{ detailFormulaText }}
          </div>
          <button type="button" class="mh5-agent-my-profit-dialog__btn" @click="closeDetail">
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
