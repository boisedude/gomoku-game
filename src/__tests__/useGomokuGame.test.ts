import { renderHook, act } from '@testing-library/react'
import { useGomokuGame } from '@/hooks/useGomokuGame'

describe('useGomokuGame opponent change', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('startNewGame(difficulty) discards the game in progress and switches opponent', () => {
    const { result } = renderHook(() => useGomokuGame('easy'))
    act(() => result.current.handleSquareClick(7, 7))
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(result.current.gameState.moveHistory.length).toBeGreaterThan(0)

    act(() => result.current.startNewGame('hard'))

    expect(result.current.gameState.difficulty).toBe('hard')
    expect(result.current.gameState.moveHistory).toHaveLength(0)
    expect(result.current.gameState.status).toBe('playing')
    expect(result.current.gameState.currentPlayer).toBe(1)
  })

  it('startNewGame() keeps the current opponent', () => {
    const { result } = renderHook(() => useGomokuGame('medium'))
    act(() => result.current.startNewGame())
    expect(result.current.gameState.difficulty).toBe('medium')
  })
})
