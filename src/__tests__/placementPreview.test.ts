import { renderHook, act } from '@testing-library/react'
import { resolveTap } from '@/lib/placementPreview'
import { usePlacementPreview } from '@/hooks/usePlacementPreview'
import { createInitialGameState } from '@/lib/gomokuRules'

const a = { row: 7, col: 7 }
const b = { row: 3, col: 9 }

describe('resolveTap', () => {
  it('places at once for a mouse', () => {
    expect(resolveTap(null, a, false)).toEqual({ place: true, preview: null })
    expect(resolveTap(b, a, false)).toEqual({ place: true, preview: null })
  })

  it('first touch tap only previews', () => {
    expect(resolveTap(null, a, true)).toEqual({ place: false, preview: a })
  })

  it('second tap on the same intersection places and clears', () => {
    expect(resolveTap(a, { ...a }, true)).toEqual({ place: true, preview: null })
  })

  it('tapping elsewhere moves the preview without placing', () => {
    expect(resolveTap(a, b, true)).toEqual({ place: false, preview: b })
  })
})

describe('usePlacementPreview', () => {
  const setCoarse = (coarse: boolean) => {
    window.matchMedia = ((q: string) => ({ matches: coarse && q.includes('coarse') })) as unknown as typeof window.matchMedia
  }
  const board1 = createInitialGameState('pvc', 'easy').board
  const board2 = createInitialGameState('pvc', 'easy').board

  it('previews, then places on the second tap', () => {
    setCoarse(true)
    const place = jest.fn()
    const { result } = renderHook(() => usePlacementPreview(board1, true, place))
    act(() => result.current.handleTap(7, 7))
    expect(result.current.preview).toEqual(a)
    expect(place).not.toHaveBeenCalled()
    act(() => result.current.handleTap(7, 7))
    expect(place).toHaveBeenCalledWith(7, 7)
    expect(result.current.preview).toBeNull()
  })

  it('drops the preview when the board changes or play is locked', () => {
    setCoarse(true)
    const place = jest.fn()
    const { result, rerender } = renderHook(
      ({ board, canPlay }) => usePlacementPreview(board, canPlay, place),
      { initialProps: { board: board1, canPlay: true } }
    )
    act(() => result.current.handleTap(7, 7))
    rerender({ board: board1, canPlay: false })
    expect(result.current.preview).toBeNull()
    rerender({ board: board1, canPlay: true })
    expect(result.current.preview).toEqual(a)
    rerender({ board: board2, canPlay: true })
    expect(result.current.preview).toBeNull()
  })

  it('places immediately without a coarse pointer', () => {
    setCoarse(false)
    const place = jest.fn()
    const { result } = renderHook(() => usePlacementPreview(board1, true, place))
    act(() => result.current.handleTap(7, 7))
    expect(place).toHaveBeenCalledWith(7, 7)
    expect(result.current.preview).toBeNull()
  })
})
