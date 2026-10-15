import { reportArcadeResult } from '@/lib/arcadeResult'
import { getCharacterIdFromSearch, getDifficultyFromSearch } from '@/lib/characterUrl'
import { recordPlayerBeatBentley, recordBentleyBeatPlayer } from '@shared/arcadeRecord'

jest.mock('@shared/arcadeRecord', () => ({
  recordPlayerBeatBentley: jest.fn(() => Promise.resolve()),
  recordBentleyBeatPlayer: jest.fn(() => Promise.resolve()),
}))

describe('reportArcadeResult', () => {
  beforeEach(() => jest.clearAllMocks())

  it('records a player win against Bentley', () => {
    reportArcadeResult('hard', 1)
    expect(recordPlayerBeatBentley).toHaveBeenCalledTimes(1)
    expect(recordBentleyBeatPlayer).not.toHaveBeenCalled()
  })

  it('records a Bentley win', () => {
    reportArcadeResult('hard', 2)
    expect(recordBentleyBeatPlayer).toHaveBeenCalledTimes(1)
    expect(recordPlayerBeatBentley).not.toHaveBeenCalled()
  })

  it('posts nothing for a draw', () => {
    reportArcadeResult('hard', null)
    expect(recordPlayerBeatBentley).not.toHaveBeenCalled()
    expect(recordBentleyBeatPlayer).not.toHaveBeenCalled()
  })

  it('posts nothing against Bella or Coop', () => {
    for (const d of ['easy', 'medium'] as const) {
      reportArcadeResult(d, 1)
      reportArcadeResult(d, 2)
    }
    expect(recordPlayerBeatBentley).not.toHaveBeenCalled()
    expect(recordBentleyBeatPlayer).not.toHaveBeenCalled()
  })
})

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
