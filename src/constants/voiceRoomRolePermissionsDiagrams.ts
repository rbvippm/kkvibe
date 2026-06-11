/** 语聊房角色权限文档 · Mermaid 图源（与 docs/语聊房角色权限.html 一致） */
export const voiceRoomRolePermissionsDiagrams = {
  gift: `flowchart TD
  G[任意角色点击礼物] --> L[展示在麦用户列表]
  L --> F{目标是否为自己?}
  F -->|是| X[禁用 / ERR_GIFT_SELF]
  F -->|否| P[选择礼物并支付]
  P --> S[校验：目标在麦且非本人]
  S --> OK[打赏成功]`,

  hierarchy: `flowchart TB
  subgraph 权限层级["权限层级（高 → 低）"]
    H[房主 / 1号麦]
    A[房管]
    M[其他麦]
    V[普通观众]
  end
  H -->|包含房管级麦控 + 独有管理权| A
  A -->|麦上自控 + 有限他人麦控| M
  M --> V

  subgraph 房主独有["房主独有"]
    o1[1号麦不可换]
    o2[任命 / 撤销房管]
    o3[踢房管下麦]
    o4[对任意麦位禁麦 / 关位 / 踢麦]
  end
  H --- o1
  H --- o2
  H --- o3
  H --- o4

  subgraph 房管独有["房管独有（相对其他麦/观众）"]
    a1[踢麦：仅普通在麦用户]
    a2[关位 / 换位：不含1号]
    a3[全体禁麦 / 单麦禁麦]
    a4[对其它房管：仅禁麦不可踢]
  end
  A --- a1
  A --- a2
  A --- a3
  A --- a4`,

  control: `flowchart LR
  subgraph 操作者
    H[房主]
    A[房管]
    M[其他麦]
    V[观众]
  end
  subgraph 目标
    S1[1号麦/房主]
    S2[普通在麦用户]
    SA[其它房管]
    SE[空麦位]
    AU[观众]
  end
  H -->|踢/禁麦/关位| S2
  H -->|踢/禁麦| SA
  H -->|设/撤房管| AU
  A -->|踢/禁麦/关位| S2
  A -->|仅禁麦| SA
  A -.->|不可踢/不可任免| SA
  A -.->|不可操作| S1
  M -->|自控下麦换位| S2
  subgraph 打赏["礼物打赏（全角色）"]
    MIC[所有在麦用户]
  end
  H -->|打赏 不可对自己| MIC
  A -->|打赏 不可对自己| MIC
  M -->|打赏 不可对自己| MIC
  V -->|打赏 不可对自己| MIC`,

  joinRole: `flowchart TD
  A[用户进入语聊房] --> B{是否创建者?}
  B -->|是| C[绑定房主]
  C --> D[占1号麦 不可换]
  B -->|否| E{是否房管?}
  E -->|是| F[房管身份]
  E -->|否| G[观众身份]
  F --> H{是否在麦?}
  G --> H
  H -->|是| I[其他麦能力]
  H -->|否| J[观众能力]`,

  kickMic: `sequenceDiagram
  participant O as 操作者
  participant S as 房间服务
  participant T as 目标
  alt 房主踢房管
    O->>S: kickMic, role=owner
    S-->>T: 下麦成功
  else 房管踢普通用户
    O->>S: kickMic, role=admin
    S-->>T: 下麦成功
  else 房管踢房管
    O->>S: kickMic, role=admin
    S-->>O: ERR_NO_PERMISSION
  else 房管对房管禁麦
    O->>S: muteMic
    S-->>T: voiceOn=false
  end`,

  setAdmin: `sequenceDiagram
  participant H as 房主
  participant A as 房管
  participant S as 房间服务
  H->>S: setAdmin
  S-->>H: 成功
  A->>S: setAdmin
  S-->>A: ERR_NO_PERMISSION`,

  muteMic: `flowchart TD
  Start[房主或房管发起] --> Type{类型}
  Type -->|全体禁麦| R1[在麦闭麦 + 新上麦默认闭麦]
  Type -->|单麦禁麦| R2[指定麦位闭麦]
  R1 --> B[广播 mic 状态]
  R2 --> B
  B --> UI[更新麦位 UI]`,

  sendGift: `sequenceDiagram
  participant U as 打赏方任意角色
  participant C as 客户端
  participant S as 房间服务
  participant T as 收礼方在麦
  U->>C: 打开礼物面板
  C->>S: listGiftTargets
  S-->>C: 在麦列表排除本人
  U->>C: 选择目标与礼物
  C->>S: sendGift
  alt 目标为自己
    S-->>C: ERR_GIFT_SELF
  else 目标不在麦
    S-->>C: ERR_GIFT_TARGET_NOT_ON_MIC
  else 通过
    S-->>C: 成功
  end`,
} as const

export type VoiceRoomRoleDiagramKey = keyof typeof voiceRoomRolePermissionsDiagrams
