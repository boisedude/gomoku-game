import { getCharacterIdFromSearch, getDifficultyFromSearch } from '@/lib/characterUrl'

describe('character URL parameter', () => {
  it('maps characters to difficulty', () => {
    expect(getDifficultyFromSearch('?character=bentley')).toBe('hard')
    expect(getDifficultyFromSearch('?character=bella')).toBe('easy')
    expect(getDifficultyFromSearch('?character=coop')).toBe('medium')
  })

  it('defaults to medium when missing or invalid', () => {
    expect(getDifficultyFromSearch('')).toBe('medium')
    expect(getDifficultyFromSearch('?character=nobody')).toBe('medium')
    expect(getCharacterIdFromSearch('?character=toString')).toBeNull()
  })
})
