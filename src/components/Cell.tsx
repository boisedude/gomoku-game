/**
 * Gomoku Cell Component
 * Represents a single intersection on the Gomoku board
 * Features realistic Go stones, grid lines, star points, and animations
 */

import { useState, useEffect, useRef, memo } from 'react'
import type React from 'react'
import type { Player } from '@/types/gomoku.types'
import { BOARD_LAST_INDEX } from '@/constants/gameConstants'

/** Animation duration for stone placement in milliseconds */
const STONE_ANIMATION_DURATION_MS = 350

interface CellProps {
  row: number
  col: number
  player: Player | null
  onClick: (row: number, col: number) => void
  isLastPlaced: boolean
  isWinning: boolean
  winningIndex?: number
  isStarPoint?: boolean
  currentPlayer?: 1 | 2
  disabled?: boolean
}

export const Cell = memo(function Cell({
  row,
  col,
  player,
  onClick,
  isLastPlaced,
  isWinning,
  winningIndex = -1,
  isStarPoint = false,
  currentPlayer = 1,
  disabled = false,
}: CellProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const prevPlayerRef = useRef<Player | null>(player)

  // Trigger animation when a stone is newly placed
  // Using queueMicrotask to defer setState and avoid cascading renders
  useEffect(() => {
    const prevPlayer = prevPlayerRef.current
    let timer: ReturnType<typeof setTimeout> | null = null

    // Stone was just placed (changed from null to a player)
    if (player !== null && prevPlayer === null) {
      queueMicrotask(() => {
        setIsAnimating(true)
      })
      timer = setTimeout(() => setIsAnimating(false), STONE_ANIMATION_DURATION_MS)
    }

    // Stone was removed (game reset)
    if (player === null && prevPlayer !== null) {
      queueMicrotask(() => {
        setIsAnimating(false)
      })
    }

    prevPlayerRef.current = player

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [player])

  // Derive showStone directly from player prop - no need for separate state
  const showStone = player !== null

  const handleClick = () => {
    if (!disabled && player === null) {
      onClick(row, col)
    }
  }

  // Generate accessible label for the cell
  const colLetter = String.fromCharCode(65 + col) // A-O
  const rowNumber = row + 1 // 1-15
  const cellNotation = `${colLetter}${rowNumber}`
  const cellState = player === null ? 'empty' : player === 1 ? 'black stone' : 'white stone'
  const ariaLabel = `Cell ${cellNotation}, ${cellState}${isLastPlaced ? ', last move' : ''}${isWinning ? ', winning position' : ''}`

  // Calculate grid line positions
  // Lines extend from center to edges, creating intersection pattern
  const isTopEdge = row === 0
  const isBottomEdge = row === BOARD_LAST_INDEX
  const isLeftEdge = col === 0
  const isRightEdge = col === BOARD_LAST_INDEX

  return (
    <div
      className={`
        aspect-square
        relative
        ${player === null && !disabled ? 'go-cell' : 'go-cell-occupied'}
        focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none
      `}
      onClick={handleClick}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={player === null && !disabled ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={player !== null}
      data-row={row}
      data-col={col}
    >
      {/* Grid lines - drawn as pseudo elements extending from center */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal line */}
        <div
          className="absolute bg-stone-800/80"
          style={{
            height: '1px',
            top: '50%',
            left: isLeftEdge ? '50%' : '0',
            right: isRightEdge ? '50%' : '0',
            transform: 'translateY(-0.5px)',
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute bg-stone-800/80"
          style={{
            width: '1px',
            left: '50%',
            top: isTopEdge ? '50%' : '0',
            bottom: isBottomEdge ? '50%' : '0',
            transform: 'translateX(-0.5px)',
          }}
        />
      </div>

      {/* Star point (hoshi) */}
      {isStarPoint && player === null && (
        <div
          className="absolute bg-stone-800 rounded-full pointer-events-none z-10"
          style={{
            width: '8px',
            height: '8px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Hover preview stone (ghost stone) */}
      {player === null && !disabled && (
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[75%] h-[75%] rounded-full
            go-stone-preview
            ${currentPlayer === 1 ? 'go-stone-black' : 'go-stone-white'}
            pointer-events-none
          `}
        />
      )}

      {/* Placed stone */}
      {showStone && player !== null && (
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[80%] h-[80%] rounded-full
            go-stone
            ${player === 1 ? 'go-stone-black' : 'go-stone-white'}
            ${isAnimating ? 'animate-stone-place' : ''}
            ${isWinning ? `animate-winning-glow winning-stone-${winningIndex >= 0 ? winningIndex : 0}` : ''}
            ${isLastPlaced && !isWinning ? 'animate-last-move' : ''}
          `}
        >
          {/* Last placed indicator dot */}
          {isLastPlaced && !isWinning && (
            <div
              className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[20%] h-[20%] rounded-full
                ${player === 1 ? 'bg-white/70' : 'bg-black/50'}
              `}
            />
          )}
        </div>
      )}
    </div>
  )
})
