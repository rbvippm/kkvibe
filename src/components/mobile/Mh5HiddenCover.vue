<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import Mh5DigitPad from './Mh5DigitPad.vue'
import Mh5GesturePad from './Mh5GesturePad.vue'
import { appLock, submitAppGesture, submitAppPin, unlockReal } from '../../constants/appLock'

const coverTitle = computed(() => {
  if (appLock.calculator) return '计算器'
  return appLock.mode === 'gesture' ? '绘制手势密码' : '输入密码'
})
const showGesture = computed(() => appLock.locked && appLock.mode === 'gesture')
const accumulator = ref<number | null>(null)
const operator = ref<string | null>(null)
const fresh = ref(true)

const pinError = ref('')
const gestureError = ref('')
const display = ref('0')

async function onPin(pin: string) {
  const result = submitAppPin(pin)
  if (result === 'decoy') {
    pinError.value = ''
    resetCalc()
    return
  }
  if (result === 'wrong') {
    pinError.value = ''
    await nextTick()
    pinError.value = '密码错误'
  }
}

async function onGesture(pattern: string) {
  if (pattern.split('-').filter(Boolean).length < 4) {
    gestureError.value = ''
    await nextTick()
    gestureError.value = '至少连接 4 个点'
    return
  }
  const result = submitAppGesture(pattern)
  if (result === 'decoy') {
    gestureError.value = ''
    resetCalc()
    return
  }
  if (result === 'wrong') {
    gestureError.value = ''
    await nextTick()
    gestureError.value = '手势错误'
  }
}

function resetCalc() {
  display.value = '0'
  accumulator.value = null
  operator.value = null
  fresh.value = true
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '错误'
  const text = String(Number(value.toPrecision(10)))
  return text.length > 12 ? value.toExponential(4) : text
}

function compute(left: number, right: number, op: string) {
  if (op === '+') return left + right
  if (op === '−') return left - right
  if (op === '×') return left * right
  if (op === '÷') return right === 0 ? Number.NaN : left / right
  return right
}

function inputDigit(digit: string) {
  if (display.value === '错误') resetCalc()
  if (fresh.value) {
    display.value = digit
    fresh.value = false
    return
  }
  if (display.value.replace('-', '').replace('.', '').length >= 9) return
  display.value = display.value === '0' ? digit : `${display.value}${digit}`
}

function inputDot() {
  if (display.value === '错误') resetCalc()
  if (fresh.value) {
    display.value = '0.'
    fresh.value = false
    return
  }
  if (!display.value.includes('.')) display.value += '.'
}

function applyOperator(next: string) {
  if (display.value === '错误') return
  const current = Number(display.value)
  if (accumulator.value != null && operator.value && !fresh.value) {
    accumulator.value = compute(accumulator.value, current, operator.value)
    display.value = formatNumber(accumulator.value)
  } else {
    accumulator.value = current
  }
  operator.value = next
  fresh.value = true
}

function equals() {
  if (operator.value == null && !fresh.value && display.value === '666888') {
    unlockReal()
    return
  }
  if (operator.value == null || accumulator.value == null || display.value === '错误') return
  const current = fresh.value ? accumulator.value : Number(display.value)
  accumulator.value = compute(accumulator.value, current, operator.value)
  display.value = formatNumber(accumulator.value)
  operator.value = null
  fresh.value = true
}

function toggleSign() {
  if (display.value === '错误' || display.value === '0') return
  display.value = display.value.startsWith('-') ? display.value.slice(1) : `-${display.value}`
}

function percent() {
  if (display.value === '错误') return
  display.value = formatNumber(Number(display.value) / 100)
  fresh.value = true
}

function onCalcKey(key: string) {
  if (key === 'AC') resetCalc()
  else if (key === '+/−') toggleSign()
  else if (key === '%') percent()
  else if (key === '.') inputDot()
  else if (key === '=') equals()
  else if ('÷×−+'.includes(key)) applyOperator(key)
  else inputDigit(key)
}

const calcKeys = ['AC', '+/−', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '=']
</script>

<template>
  <div class="mh5-hidden-cover" :aria-label="coverTitle">
    <template v-if="appLock.locked">
      <button v-if="appLock.faceId" type="button" class="mh5-lock-face" @click="unlockReal">
        {{ $t('使用 Face ID') }}
      </button>
      <Mh5GesturePad v-if="showGesture" title="绘制手势密码" :error="gestureError" @submit="onGesture" />
      <Mh5DigitPad v-else title="输入密码" :error="pinError" @submit="onPin" />
    </template>

    <section v-else class="mh5-calc" aria-label="计算器">
      <p class="mh5-calc__display">{{ display }}</p>
      <div class="mh5-calc__keys">
        <button
          v-for="key in calcKeys"
          :key="key"
          type="button"
          :class="{
            'is-func': ['AC', '+/−', '%'].includes(key),
            'is-op': '÷×−+='.includes(key),
            'is-zero': key === '0',
          }"
          @click="onCalcKey(key)"
        >
          {{ key }}
        </button>
      </div>
    </section>
  </div>
</template>
