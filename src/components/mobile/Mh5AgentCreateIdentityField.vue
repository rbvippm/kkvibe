<script setup lang="ts">
import { ref } from 'vue'
import {
  AGENT_CREATE_IDENTITY_DIAL_CODES,
  AGENT_CREATE_IDENTITY_METHODS,
  AGENT_CREATE_KINGKONG_HINT,
  type AgentCreateIdentityMethod,
} from '../../constants/agentCreateIdentity'

const method = defineModel<AgentCreateIdentityMethod>('method', { default: 'account' })
const account = defineModel<string>('account', { default: '' })
const phone = defineModel<string>('phone', { default: '' })
const email = defineModel<string>('email', { default: '' })
const dialCode = defineModel<string>('dialCode', { default: '+65' })

const dialPickerOpen = ref(false)

function pickMethod(next: AgentCreateIdentityMethod) {
  method.value = next
  dialPickerOpen.value = false
}

function pickDialCode(code: string) {
  dialCode.value = code
  dialPickerOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-create-identity">
    <div class="mh5-agent-create-identity__tabs" role="tablist" aria-label="账号方式">
      <button
        v-for="item in AGENT_CREATE_IDENTITY_METHODS"
        :key="item.key"
        type="button"
        role="tab"
        class="mh5-agent-create-identity__tab"
        :class="{ 'mh5-agent-create-identity__tab--active': method === item.key }"
        :aria-selected="method === item.key"
        @click="pickMethod(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="method === 'account'" class="mh5-agent-create-field">
      <input
        v-model="account"
        class="mh5-agent-create-field__input"
        type="text"
        autocomplete="username"
        placeholder="请输入金刚号"
        aria-label="金刚号"
      />
      <p class="mh5-agent-create-identity__hint">{{ AGENT_CREATE_KINGKONG_HINT }}</p>
    </div>

    <div v-else-if="method === 'phone'" class="mh5-agent-create-field">
      <div class="mh5-agent-create-field__combo">
        <button
          type="button"
          class="mh5-agent-create-field__dial"
          :aria-expanded="dialPickerOpen"
          aria-label="选择区号"
          @click="dialPickerOpen = !dialPickerOpen"
        >
          {{ dialCode }}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M3 4.5 6 7.5 9 4.5"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <input
          v-model="phone"
          class="mh5-agent-create-field__input mh5-agent-create-field__input--combo"
          type="text"
          inputmode="tel"
          autocomplete="tel"
          placeholder="请输入手机号"
          aria-label="手机号"
        />
      </div>
      <div v-if="dialPickerOpen" class="mh5-agent-create-dial-list" role="listbox" aria-label="区号">
        <button
          v-for="code in AGENT_CREATE_IDENTITY_DIAL_CODES"
          :key="code"
          type="button"
          class="mh5-agent-create-dial-list__item"
          :class="{ 'mh5-agent-create-dial-list__item--active': dialCode === code }"
          role="option"
          :aria-selected="dialCode === code"
          @click="pickDialCode(code)"
        >
          {{ code }}
        </button>
      </div>
    </div>

    <label v-else class="mh5-agent-create-field">
      <input
        v-model="email"
        class="mh5-agent-create-field__input"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="请输入邮箱"
        aria-label="邮箱"
      />
    </label>
  </div>
</template>
