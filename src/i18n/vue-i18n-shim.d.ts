export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (source: string, vars?: Record<string, string | number>) => string
  }
}
