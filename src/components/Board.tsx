/**
 * Gomoku Board Component
 * Renders the 15x15 Gomoku board
 */

import type { Board as BoardType } from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'
import { Cell } from './Cell'

interface BoardProps {
  board: BoardType
  onSquareClick: (row: number, col: number) => void
  isLastPlaced: (row: number, col: number) => boolean
  isWinningPosition: (row: number, col: number) => boolean
  disabled?: boolean
}

export function Board({
  board,
  onSquareClick,
  isLastPlaced,
  isWinningPosition,
  disabled = false,
}: BoardProps) {
  const columnLabels = Array.from({ length: BOARD_SIZE }, (_, i) =>
    String.fromCharCode(65 + i)
  ) // A-O

  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1) // 1-15

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Board container with row labels */}
      <div className="flex gap-2">
        {/* Left row labels */}
        <div className="flex flex-col justify-around text-sm text-gray-600 font-semibold py-1">
          {rowLabels.map(label => (
            <div key={label} className="h-8 flex items-center justify-center">
              {label}
            </div>
          ))}
        </div>

        {/* Main board */}
        <div className="flex-1">
          <div
            className="grid gap-0 border-4 border-amber-950 rounded-lg overflow-hidden shadow-2xl bg-amber-100"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  player={cell}
                  onClick={disabled ? () => {} : onSquareClick}
                  isLastPlaced={!disabled && isLastPlaced(rowIndex, colIndex)}
                  isWinning={!disabled && isWinningPosition(rowIndex, colIndex)}
                />
              ))
            )}
          </div>

          {/* Column labels (A-O) */}
          <div
            className="grid gap-0 mt-2 text-center text-sm text-gray-600 font-semibold"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
          >
            {columnLabels.map(label => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </div>

        {/* Right row labels */}
        <div className="flex flex-col justify-around text-sm text-gray-600 font-semibold py-1">
          {rowLabels.map(label => (
            <div key={label} className="h-8 flex items-center justify-center">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
