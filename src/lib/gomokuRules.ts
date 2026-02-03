/**
 * Gomoku (Five in a Row) Game Rules and Logic
 * Implements standard Gomoku rules on a 15x15 board
 */

import type {
  Board,
  Player,
  Position,
  Move,
  GameState,
  Pattern,
  Direction,
} from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'
import {
  SCORE_FIVE,
  SCORE_OPEN_FOUR,
  SCORE_FOUR,
  SCORE_OPEN_THREE,
  SCORE_THREE,
  SCORE_TWO,
  WIN_LENGTH,
} from '@/constants/gameConstants'

/**
 * Four main directions for checking patterns (horizontal, vertical, diagonals)
 * Each direction only needs to be checked once since we count both forward and backward
 */
const FOUR_DIRECTIONS: Direction[] = [
  [0, 1],   // Horizontal
  [1, 0],   // Vertical
  [1, 1],   // Diagonal \
  [1, -1],  // Diagonal /
]

/**
 * Creates an empty 15x15 board
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

/**
 * Checks if a position is on the board
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

/**
 * Checks if a position is empty
 */
export function isEmpty(board: Board, position: Position): boolean {
  return board[position.row][position.col] === null
}

/**
 * Places a stone on the board
 */
export function placeStone(board: Board, position: Position, player: Player): Board {
  const newBoard = board.map(row => [...row])
  newBoard[position.row][position.col] = player
  return newBoard
}

/**
 * Counts consecutive stones in a direction
 */
function countConsecutive(
  board: Board,
  position: Position,
  direction: Direction,
  player: Player
): { count: number; positions: Position[] } {
  const positions: Position[] = [position]
  let count = 1
  const [dr, dc] = direction

  // Count forward
  let row = position.row + dr
  let col = position.col + dc
  while (isValidPosition(row, col) && board[row][col] === player) {
    positions.push({ row, col })
    count++
    row += dr
    col += dc
  }

  // Count backward
  row = position.row - dr
  col = position.col - dc
  while (isValidPosition(row, col) && board[row][col] === player) {
    positions.unshift({ row, col })
    count++
    row -= dr
    col -= dc
  }

  return { count, positions }
}

/**
 * Checks if placing a stone at position creates 5 in a row
 */
export function checkWin(board: Board, position: Position, player: Player): {
  isWin: boolean
  winningLine?: Position[]
} {
  for (const direction of FOUR_DIRECTIONS) {
    const { count, positions } = countConsecutive(
      board,
      position,
      direction,
      player
    )

    if (count >= WIN_LENGTH) {
      return { isWin: true, winningLine: positions.slice(0, WIN_LENGTH) }
    }
  }

  return { isWin: false }
}

/**
 * Checks if the board is full (draw condition)
 */
export function isBoardFull(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        return false
      }
    }
  }
  return true
}

/**
 * Detects a pattern (open four, four, open three, etc.)
 */
export function detectPattern(
  board: Board,
  position: Position,
  direction: Direction,
  player: Player
): Pattern | null {
  const [dr, dc] = direction
  const positions: Position[] = []
  let consecutive = 0
  let openEnds = 0

  // Check forward
  let row = position.row
  let col = position.col
  while (isValidPosition(row, col) && board[row][col] === player) {
    positions.push({ row, col })
    consecutive++
    row += dr
    col += dc
  }

  // Check if forward end is open
  if (isValidPosition(row, col) && board[row][col] === null) {
    openEnds++
  }

  // Check backward
  row = position.row - dr
  col = position.col - dc
  while (isValidPosition(row, col) && board[row][col] === player) {
    positions.unshift({ row, col })
    consecutive++
    row -= dr
    col -= dc
  }

  // Check if backward end is open
  if (isValidPosition(row, col) && board[row][col] === null) {
    openEnds++
  }

  // Classify pattern
  if (consecutive >= WIN_LENGTH) {
    return { type: 'five', direction, positions, score: SCORE_FIVE }
  } else if (consecutive === 4) {
    if (openEnds === 2) {
      return { type: 'open-four', direction, positions, score: SCORE_OPEN_FOUR }
    } else if (openEnds === 1) {
      return { type: 'four', direction, positions, score: SCORE_FOUR }
    }
  } else if (consecutive === 3) {
    if (openEnds === 2) {
      return { type: 'open-three', direction, positions, score: SCORE_OPEN_THREE }
    } else if (openEnds === 1) {
      return { type: 'three', direction, positions, score: SCORE_THREE }
    }
  } else if (consecutive === 2 && openEnds > 0) {
    return { type: 'two', direction, positions, score: SCORE_TWO }
  }

  return null
}

/**
 * Evaluates all patterns from a position
 */
export function evaluatePosition(
  board: Board,
  position: Position,
  player: Player
): Pattern[] {
  const patterns: Pattern[] = []
  const testBoard = placeStone(board, position, player)

  for (const direction of FOUR_DIRECTIONS) {
    const pattern = detectPattern(
      testBoard,
      position,
      direction,
      player
    )
    if (pattern) {
      patterns.push(pattern)
    }
  }

  return patterns
}

/**
 * Counts pieces for each player
 */
export function countPieces(board: Board): {
  blackCount: number
  whiteCount: number
} {
  let blackCount = 0
  let whiteCount = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col]
      if (cell === 1) blackCount++
      else if (cell === 2) whiteCount++
    }
  }

  return { blackCount, whiteCount }
}

/**
 * Checks if the game is over
 */
export function checkGameOver(
  board: Board,
  lastMove?: Move
): { isOver: boolean; winner: Player | null; isDraw: boolean; winningLine?: Position[] } {
  // Check if last move created a winning line
  if (lastMove) {
    const winCheck = checkWin(board, lastMove.position, lastMove.player)
    if (winCheck.isWin) {
      return {
        isOver: true,
        winner: lastMove.player,
        isDraw: false,
        winningLine: winCheck.winningLine,
      }
    }
  }

  // Check for draw (board full)
  if (isBoardFull(board)) {
    return { isOver: true, winner: null, isDraw: true }
  }

  // Game continues
  return { isOver: false, winner: null, isDraw: false }
}

/**
 * Creates initial game state
 */
export function createInitialGameState(
  mode: 'pvp' | 'pvc' = 'pvc',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): GameState {
  const board = createEmptyBoard()

  return {
    board,
    currentPlayer: 1, // Black (player) goes first
    status: 'playing',
    winner: null,
    mode,
    difficulty,
    moveHistory: [],
    blackCount: 0,
    whiteCount: 0,
    undoState: null,
  }
}

/**
 * Gets positions around placed stones (for AI optimization)
 */
export function getRelevantPositions(board: Board, range: number = 2): Position[] {
  const relevant = new Set<string>()

  // If board is empty, return center position
  const counts = countPieces(board)
  if (counts.blackCount === 0 && counts.whiteCount === 0) {
    const center = Math.floor(BOARD_SIZE / 2)
    return [{ row: center, col: center }]
  }

  // Find all occupied positions
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        // Add positions within range
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const newRow = row + dr
            const newCol = col + dc
            if (
              isValidPosition(newRow, newCol) &&
              board[newRow][newCol] === null
            ) {
              relevant.add(`${newRow},${newCol}`)
            }
          }
        }
      }
    }
  }

  return Array.from(relevant).map(key => {
    const [row, col] = key.split(',').map(Number)
    return { row, col }
  })
}
