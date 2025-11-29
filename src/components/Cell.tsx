/**
 * Gomoku Cell Component
 * Represents a single intersection on the Gomoku board
 */

import type { Player } from '@/types/gomoku.types'

interface CellProps {
  row: number
  col: number
  player: Player | null
  onClick: (row: number, col: number) => void
  isLastPlaced: boolean
  isWinning: boolean
}

export function Cell({
  row,
  col,
  player,
  onClick,
  isLastPlaced,
  isWinning,
}: CellProps) {
  const handleClick = () => {
    onClick(row, col)
  }

  const baseClasses = `
    aspect-square
    flex items-center justify-center
    transition-all duration-200
    relative
    bg-amber-100
  `

  const cursorClasses = player === null
    ? 'cursor-pointer hover:bg-amber-200'
    : ''

  // Grid lines (using border to create the grid effect)
  const borderClasses = 'border-gray-400'
  const topBorder = row === 0 ? 'border-t-2' : 'border-t'
  const leftBorder = col === 0 ? 'border-l-2' : 'border-l'
  const rightBorder = col === 14 ? 'border-r-2' : ''
  const bottomBorder = row === 14 ? 'border-b-2' : ''

  return (
    <div
      className={`${baseClasses} ${cursorClasses} ${borderClasses} ${topBorder} ${leftBorder} ${rightBorder} ${bottomBorder}`}
      onClick={handleClick}
      data-row={row}
      data-col={col}
    >
      {/* Stone (if placed) */}
      {player !== null && (
        <div
          className={`
            w-3/4 h-3/4 rounded-full
            flex items-center justify-center
            transition-all duration-300
            ${player === 1 ? 'bg-gradient-to-br from-gray-900 to-black shadow-lg' : 'bg-gradient-to-br from-gray-100 to-white shadow-lg'}
            ${isLastPlaced ? 'ring-4 ring-red-500 ring-opacity-70' : ''}
            ${isWinning ? 'ring-4 ring-yellow-400 ring-opacity-90 animate-pulse' : ''}
          `}
        >
          {/* Last placed indicator (small dot) */}
          {isLastPlaced && (
            <div className={`w-2 h-2 rounded-full ${player === 1 ? 'bg-white' : 'bg-black'}`} />
          )}
        </div>
      )}

      {/* Empty intersection hint on hover */}
      {player === null && (
        <div className="w-3/4 h-3/4 rounded-full border-2 border-gray-300 opacity-0 hover:opacity-30 transition-opacity" />
      )}
    </div>
  )
}
