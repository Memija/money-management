import { describe, expect, it } from 'vitest'

import { APP_CONFIG } from './app-config'

describe('APP_CONFIG', () => {
  it('defines the application version as 1.0.0', () => {
    expect(APP_CONFIG.version).toBe('1.0.0')
  })
})
