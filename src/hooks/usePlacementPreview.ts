/**
 * Holds the touch preview for the current board. The preview is tied to the board
 * object it was made on, so a new game, an undo, or any placed stone (the AI's
 * included) drops it without an effect.
 */

import { useCallback, useState } from 'react'
import type { Board, Position } from '@/types/gomoku.types'
import { isCoarsePointer, resolveTap } from '@/lib/placementPreview'

export function usePlacementPreview(
  board: Board,
  canPlay: boolean,
  place: (row: number, col: number) => void
) {
  const [made, setMade] = useState<{ board: Board; position: Position } | null>(null)
  const preview = canPlay && made && made.board === board ? made.position : null

  const handleTap = useCallback(
    (row: number, col: number) => {
      const result = resolveTap(preview, { row, col }, isCoarsePointer())
      setMade(result.preview ? { board, position: result.preview } : null)
      if (result.place) place(row, col)
    },
    [preview, board, place]
  )

  return { preview, handleTap }
}
