<script setup lang="ts">
import { closeMh5Confirm, mh5ConfirmState } from '../../composables/useMh5Confirm'

function onConfirm() {
  closeMh5Confirm(true)
}

function onCancel() {
  closeMh5Confirm(false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="mh5-confirm">
      <div
        v-if="mh5ConfirmState.open"
        class="mh5-confirm-mask"
        role="presentation"
        @click.self="mh5ConfirmState.showCancel ? onCancel() : undefined"
      >
        <div
          class="mh5-confirm-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'mh5-confirm-title'"
          :aria-describedby="mh5ConfirmState.message ? 'mh5-confirm-message' : undefined"
        >
          <div class="mh5-confirm-dialog__icon" aria-hidden="true">
            <span class="mh5-confirm-dialog__icon-mark">!</span>
          </div>

          <h2 id="mh5-confirm-title" class="mh5-confirm-dialog__title">
            {{ mh5ConfirmState.title }}
          </h2>
          <p
            v-if="mh5ConfirmState.message"
            id="mh5-confirm-message"
            class="mh5-confirm-dialog__message"
          >
            {{ mh5ConfirmState.message }}
          </p>

          <div class="mh5-confirm-dialog__actions">
            <button
              type="button"
              class="mh5-confirm-dialog__btn mh5-confirm-dialog__btn--primary"
              @click="onConfirm"
            >
              {{ mh5ConfirmState.confirmText }}
            </button>
            <button
              v-if="mh5ConfirmState.showCancel"
              type="button"
              class="mh5-confirm-dialog__btn mh5-confirm-dialog__btn--ghost"
              @click="onCancel"
            >
              {{ mh5ConfirmState.cancelText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
