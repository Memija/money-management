export type AppStep = 'country' | 'institution' | 'import' | 'review' | 'dashboard' | 'settings'

export interface CustomCategory {
  id: string
  icon?: string
  translations: Record<string, string>
}
