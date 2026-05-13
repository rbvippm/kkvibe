import { APP_JOIN_MIC } from '../config/appJoinMic'

/**
 * 尝试通过自定义 Scheme 打开 App；若用户仍停留在当前页，则跳转超级签下载页。
 * 说明：H5 无法 100% 检测是否已安装，行业常用「visibility/pagehide + 延时兜底」。
 */
export function openJoinMicAppOrDownload(roomId: string, seatIndex: number): void {
  const deepLink = `${APP_JOIN_MIC.scheme}${APP_JOIN_MIC.buildPath(roomId, seatIndex)}`

  let likelyLeftPage = false
  const onPageHide = () => {
    likelyLeftPage = true
  }
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') likelyLeftPage = true
  }

  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', onVisibility)

  window.location.href = deepLink

  window.setTimeout(() => {
    window.removeEventListener('pagehide', onPageHide)
    document.removeEventListener('visibilitychange', onVisibility)
    if (likelyLeftPage) return
    if (document.visibilityState !== 'visible') return
    window.location.href = APP_JOIN_MIC.downloadPageUrl
  }, APP_JOIN_MIC.appOpenProbeMs)
}
