<script setup lang="ts">
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { LIVE_PIP_SETTING_ITEMS } from '../../constants/livePip'
import { LIVE_PIP_SPEC } from '../../constants/livePipSpec'
import { useLivePip } from '../../composables/useLivePip'
import '../../styles/mobile-app-shell.css'

const pip = useLivePip()

function toggle(key: (typeof LIVE_PIP_SETTING_ITEMS)[number]['key']) {
  pip.setSetting(key, !pip.state.settings[key])
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('小窗设置')">
      <template #right>
        <Mh5SpecAnnot :spec="LIVE_PIP_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-settings-main">
      <section class="mh5-settings-group mh5-pip-settings">
        <div v-for="item in LIVE_PIP_SETTING_ITEMS" :key="item.key" class="mh5-pip-settings__row">
          <div class="mh5-pip-settings__copy">
            <p class="mh5-pip-settings__title">{{ $t(item.title) }}</p>
            <p class="mh5-pip-settings__desc">{{ $t(item.desc) }}</p>
          </div>
          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': pip.state.settings[item.key] }"
            :aria-pressed="pip.state.settings[item.key]"
            :aria-label="$t(item.title)"
            @click="toggle(item.key)"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
