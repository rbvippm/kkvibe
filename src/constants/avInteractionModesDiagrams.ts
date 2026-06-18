/** 音视频互动三种模式 · Mermaid 图源（与 docs/音视频互动三种模式需求调研.md 一致） */
export const avInteractionModesDiagrams = {
  framework: `flowchart LR
  subgraph dims [四维度分析框架]
    R[关系链]
    P[权限控制]
    G[核心目的]
    T[技术侧重点]
  end
  R --> P --> G --> T
  T --> D[产品选型决策]`,

  meetJourney: `flowchart LR
  A[发起人创建会议] --> B[生成 URL]
  B --> C[分享链接]
  C --> D[参与者点击加入]
  D --> E{等候室?}
  E -->|是| F[Host 审批]
  E -->|否| G[进入会议]
  F --> G`,

  friendJourney: `flowchart LR
  A[选择好友/群] --> B[发起呼叫]
  B --> C[响铃/震动]
  C --> D{接听?}
  D -->|是| E[双向通话]
  D -->|否| F[未接/拒绝]`,

  liveJourney: `flowchart LR
  A[进入直播间] --> B[围观 + 公屏]
  B --> C[申请/被邀请连麦]
  C --> D{主播审批}
  D -->|通过| E[上麦互动]
  D -->|拒绝| B
  E --> F[下麦/被切断]`,

  permission: `flowchart TB
  subgraph meet [链接分享 · 主客制]
    H[Host] --> P1[与会者]
    H --> C1[控屏/踢人/审批]
  end
  subgraph friend [好友通话 · 平等制]
    M1[成员 A] --- M2[成员 B]
    M1 --> S1[自管麦/摄]
    M2 --> S2[自管麦/摄]
  end
  subgraph live [直播连麦 · 中心化]
    AN[主播] --> G[连麦嘉宾]
    AN --> V[观众 × N]
    AN --> C2[切麦/禁言/PK]
  end`,

  meetTech: `flowchart TB
  U1[用户 A] --> SFU[SFU 媒体服务器]
  U2[用户 B] --> SFU
  U3[用户 C] --> SFU
  SFU --> SS[屏幕共享 / 录制]
  SIG[信令服务器] --> SFU`,

  friendTech: `flowchart LR
  A[手机 A] <-->|P2P / 小型 SFU| B[手机 B]
  A --> PUSH[APNs / FCM]
  B --> PUSH
  A --> DSP[回声消除 + 弱网 FEC]
  B --> DSP`,

  liveTech: `flowchart TB
  AN[主播 RTC] --> MIX[混流服务器]
  GU[嘉宾 RTC] --> MIX
  MIX --> CDN[CDN 推流]
  CDN --> V[万级观众 HLS/FLV]
  SIG[连麦信令] --> AN
  SIG --> GU
  GIFT[礼物/公屏] --> V`,

  kkvibePosition: `flowchart LR
  subgraph spectrum [互动模式光谱]
    M1[模式一<br>链接分享]
    M2[模式二<br>好友通话]
    M3[模式三<br>直播连麦]
  end
  M1 -->|半公开| KV[KK Vibe<br>语聊房]
  KV --> M3
  M2 -.->|未来扩展| KV`,
} as const
