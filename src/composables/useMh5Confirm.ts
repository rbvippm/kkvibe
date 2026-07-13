/** 移动端中间二次确认 / 提示弹框 */

import { reactive } from 'vue'

export type Mh5ConfirmOptions = {
  /** 主标题 */
  title: string
  /** 副文案，可选 */
  message?: string
  confirmText?: string
  cancelText?: string
  /** 是否展示取消按钮；提示类场景可设为 false，仅保留确定 */
  showCancel?: boolean
}

type Mh5ConfirmState = {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  showCancel: boolean
  resolve: ((value: boolean) => void) | null
}

export const mh5ConfirmState = reactive<Mh5ConfirmState>({
  open: false,
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  resolve: null,
})

function normalizeOptions(options: Mh5ConfirmOptions | string): Mh5ConfirmOptions {
  return typeof options === 'string' ? { title: options } : options
}

function openDialog(options: Mh5ConfirmOptions): Promise<boolean> {
  if (mh5ConfirmState.open && mh5ConfirmState.resolve) {
    mh5ConfirmState.resolve(false)
  }

  const next = normalizeOptions(options)

  return new Promise((resolve) => {
    mh5ConfirmState.title = next.title
    mh5ConfirmState.message = next.message ?? ''
    mh5ConfirmState.confirmText = next.confirmText ?? '确定'
    mh5ConfirmState.cancelText = next.cancelText ?? '取消'
    mh5ConfirmState.showCancel = next.showCancel ?? true
    mh5ConfirmState.resolve = resolve
    mh5ConfirmState.open = true
  })
}

/** 二次确认：点确定 resolve(true)，点取消/遮罩 resolve(false) */
export function mh5Confirm(options: Mh5ConfirmOptions | string) {
  const next = normalizeOptions(options)
  return openDialog({ ...next, showCancel: next.showCancel ?? true })
}

/** 中间提示：仅确定按钮，关闭后 resolve */
export async function mh5Alert(options: Mh5ConfirmOptions | string) {
  const next = normalizeOptions(options)
  await openDialog({ ...next, showCancel: false })
}

export function closeMh5Confirm(result: boolean) {
  const resolve = mh5ConfirmState.resolve
  mh5ConfirmState.open = false
  mh5ConfirmState.resolve = null
  resolve?.(result)
}
