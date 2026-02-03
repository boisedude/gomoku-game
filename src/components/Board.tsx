/**
 * Gomoku Board Component
 * Renders the 15x15 Gomoku board with traditional Go board aesthetics
 * Features wood grain texture, star points (hoshi), and elegant grid lines
 */

import { memo, useCallback } from 'react'
import type { Board as BoardType, Position } from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'
import { Cell } from './Cell'

interface BoardProps {
  board: BoardType
  onSquareClick: (row: number, col: number) => void
  isLastPlaced: (row: number, col: number) => boolean
  isWinningPosition: (row: number, col: number) => boolean
  winningLine?: Position[]
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
  winningLine,
  disabled = false,
  currentPlayer = 1,
}: BoardProps) {
  const columnLabels = Array.from({ length: BOARD_SIZE }, (_, i) =>
    String.fromCharCode(65 + i)
  ) // A-O

  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1) // 1-15

  // Get the winning stone index for animation sequencing
  const getWinningIndex = useCallback((row: number, col: number): number => {
    if (!winningLine) return -1
    return winningLine.findIndex(pos => pos.row === row && pos.col === col)
  }, [winningLine])

  // Check if a position is a star point
  const isStarPoint = (row: number, col: number): boolean => {
    return STAR_POINTS.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      {/* Board container with row labels */}
      <div className="flex gap-2">
        {/* Left row labels */}
        <div className="flex flex-col text-sm text-amber-900 font-semibold opacity-80">
          {rowLabels.map(label => (
            <div key={label} className="flex-1 flex items-center justify-center min-h-0">
              {label}
            </div>
          ))}
        </div>

        {/* Main board with wood texture and frame */}
        <div className="flex-1">
          <div className="go-board-frame go-board-wood p-1 sm:p-2">
            <div
              className="grid gap-0 relative"
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
              role="grid"
              aria-label="Gomoku game board, 15 by 15 grid"
            >
              {/* Render grid lines using CSS (grid lines are part of cells) */}
              {board.map((row, rowIndex) => (
                <div key={rowIndex} role="row" className="contents">
                  {row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} role="gridcell">
                      <Cell
                        row={rowIndex}
                        col={colIndex}
                        player={cell}
                        onClick={disabled ? () => {} : onSquareClick}
                        isLastPlaced={!disabled && isLastPlaced(rowIndex, colIndex)}
                        isWinning={!disabled && isWinningPosition(rowIndex, colIndex)}
                        winningIndex={getWinningIndex(rowIndex, colIndex)}
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

          {/* Column labels (A-O) */}
          <div
            className="grid gap-0 mt-2 text-center text-sm text-amber-900 font-semibold opacity-80"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
          >
            {columnLabels.map(label => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </div>

        {/* Right row labels */}
        <div className="flex flex-col text-sm text-amber-900 font-semibold opacity-80">
          {rowLabels.map(label => (
            <div key={label} className="flex-1 flex items-center justify-center min-h-0">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
