/**
 * 语音房「APP 专享」上麦：H5 尝试唤起客户端，失败则跳转超级签安装页。
 * 上线前请将 scheme 与下载页替换为业务真实地址。
 */
export const APP_JOIN_MIC = {
  /** 客户端注册的 URL Scheme，例如 kkvibe:// */
  scheme: 'kkvibe://',
  /** 唤起路径（不含 scheme），由客户端解析 roomId、seat */
  buildPath: (roomId: string, seatIndex: number) =>
    `voice/join?roomId=${encodeURIComponent(roomId)}&seat=${seatIndex}`,
  /**
   * 超级签 / 企业签安装引导页（H5）。
   * 请替换为你们超级签分发域名下的真实落地页。
   */
  downloadPageUrl: 'https://example.com/your-super-sign-landing',
  /** 若此时间内页面未进入后台/隐藏，判定为未唤起 App，则跳转下载页 */
  appOpenProbeMs: 2200,
} as const
