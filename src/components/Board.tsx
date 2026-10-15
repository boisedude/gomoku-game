/**
 * Gomoku Board Component
 * Renders the 15x15 Gomoku board with traditional Go board aesthetics
 * Features wood grain texture, star points (hoshi), and elegant grid lines
 */

import { memo } from 'react'
import type { Board as BoardType } from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'
import { Cell } from './Cell'

interface BoardProps {
  board: BoardType
  onSquareClick: (row: number, col: number) => void
  isLastPlaced: (row: number, col: number) => boolean
  isWinningPosition: (row: number, col: number) => boolean
  disabled?: boolean
  currentPlayer?: 1 | 2
}

// Star points (hoshi) positions for a 15x15 board
// Traditional positions: corners at 4-4, edges at 4-8, 8-4, 8-12, 12-8, center at 8-8
const STAR_POINTS: [number, number][] = [
  [3, 3], [3, 7], [3, 11],   // Top row
  [7, 3], [7, 7], [7, 11],   // Middle row
  [11, 3], [11, 7], [11, 11] // Bottom row
]

export const Board = memo(function Board({
  board,
  onSquareClick,
  isLastPlaced,
  isWinningPosition,
  disabled = false,
  currentPlayer = 1,
}: BoardProps) {
  const columnLabels = Array.from({ length: BOARD_SIZE }, (_, i) =>
    String.fromCharCode(65 + i)
  ) // A-O

  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1) // 1-15

  // Check if a position is a star point
  const isStarPoint = (row: number, col: number): boolean => {
    return STAR_POINTS.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="mx-auto w-full select-none" style={{ maxWidth: 'min(640px, calc(100dvw - 2rem))' }}>
      <div
        className="grid text-[10px] leading-none text-muted-foreground sm:text-xs"
        style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}
      >
        <div />
        {/* Column labels (A-O), top only */}
        <div
          className="grid pb-1"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`, padding: '0 7px 4px' }}
          aria-hidden="true"
        >
          {columnLabels.map(label => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
        </div>

        {/* Row labels (1-15), left only */}
        <div
          className="flex flex-col pr-1 sm:pr-1.5"
          style={{ padding: '7px 4px 7px 0' }}
          aria-hidden="true"
        >
          {rowLabels.map(label => (
            <div key={label} className="flex min-h-0 flex-1 items-center justify-end">
              {label}
            </div>
          ))}
        </div>

        {/* Wood board */}
        <div className="go-board-frame go-board-wood" style={{ padding: 6 }}>
          <div
            className="relative grid gap-0"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            role="grid"
            aria-label="Gomoku game board, 15 by 15 grid"
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} role="row" className="contents">
                {row.map((cell, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} role="gridcell">
                    <Cell
                      row={rowIndex}
                      col={colIndex}
                      player={cell}
                      onClick={disabled ? () => {} : onSquareClick}
                      isLastPlaced={isLastPlaced(rowIndex, colIndex)}
                      isWinning={isWinningPosition(rowIndex, colIndex)}
                      isStarPoint={isStarPoint(rowIndex, colIndex)}
                      currentPlayer={currentPlayer}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
