/**
 * Gomoku AI Strategies
 * Implements different difficulty levels with pattern-based evaluation
 */

import type { Board, Player, Position, Difficulty, ThreatEvaluation } from '@/types/gomoku.types'
import {
  placeStone,
  checkWin,
  evaluatePosition,
  getRelevantPositions,
} from '@/lib/gomokuRules'
import {
  AI_EASY_SEARCH_RANGE,
  AI_MEDIUM_HARD_SEARCH_RANGE,
  AI_HARD_MOVE_WEIGHTS,
  AI_HARD_TOP_MOVES_COUNT,
  BONUS_WINNING_MOVE,
  BONUS_BLOCK_WIN,
  BONUS_OPEN_FOUR_MULTIPLIER,
  BONUS_FOUR_MULTIPLIER,
  BONUS_OPEN_THREE_MULTIPLIER,
  BONUS_BLOCK_OPEN_FOUR,
  BONUS_BLOCK_FOUR,
  MEDIUM_AI_OPPONENT_PATTERN_MULTIPLIER,
  HARD_AI_OWN_PATTERN_MULTIPLIER,
  HARD_AI_OPPONENT_PATTERN_MULTIPLIER,
  SCORE_FIVE,
  MOVE_EVAL_OPPONENT_MULTIPLIER,
} from '@/constants/gameConstants'

/**
 * Easy AI: Random move from available positions
 */
function getEasyMove(board: Board): Position | null {
  const relevantPositions = getRelevantPositions(board, AI_EASY_SEARCH_RANGE)
  if (relevantPositions.length === 0) return null

  // Pick random position
  return relevantPositions[Math.floor(Math.random() * relevantPositions.length)]
}

/**
 * Medium AI: Basic threat detection and blocking
 */
function getMediumMove(board: Board, player: Player): Position | null {
  const opponent = player === 1 ? 2 : 1
  const relevantPositions = getRelevantPositions(board, AI_MEDIUM_HARD_SEARCH_RANGE)

  if (relevantPositions.length === 0) return null

  // Check for immediate winning move
  for (const pos of relevantPositions) {
    const testBoard = placeStone(board, pos, player)
    const winCheck = checkWin(testBoard, pos, player)
    if (winCheck.isWin) {
      return pos
    }
  }

  // Check for opponent's winning threat and block it
  for (const pos of relevantPositions) {
    const testBoard = placeStone(board, pos, opponent)
    const winCheck = checkWin(testBoard, pos, opponent)
    if (winCheck.isWin) {
      return pos
    }
  }

  // Evaluate positions and pick best one
  let bestScore = -Infinity
  let bestPosition: Position | null = null

  for (const pos of relevantPositions) {
    const myPatterns = evaluatePosition(board, pos, player)
    const opponentPatterns = evaluatePosition(board, pos, opponent)

    const myScore = myPatterns.reduce((sum, p) => sum + p.score, 0)
    const opponentScore = opponentPatterns.reduce((sum, p) => sum + p.score, 0)

    // Prioritize blocking opponent threats
    const totalScore = myScore + opponentScore * MEDIUM_AI_OPPONENT_PATTERN_MULTIPLIER

    if (totalScore > bestScore) {
      bestScore = totalScore
      bestPosition = pos
    }
  }

  return bestPosition
}

/**
 * Hard AI: Advanced threat detection with multi-step lookahead
 */
function getHardMove(board: Board, player: Player): Position | null {
  const opponent = player === 1 ? 2 : 1
  const relevantPositions = getRelevantPositions(board, AI_MEDIUM_HARD_SEARCH_RANGE)

  if (relevantPositions.length === 0) return null

  // Evaluate all positions
  const evaluations: ThreatEvaluation[] = []

  for (const pos of relevantPositions) {
    const myPatterns = evaluatePosition(board, pos, player)
    const opponentPatterns = evaluatePosition(board, pos, opponent)

    // Check for winning move
    const testBoard = placeStone(board, pos, player)
    const winCheck = checkWin(testBoard, pos, player)
    const isWinningMove = winCheck.isWin

    // Check if blocks opponent's winning move
    const opponentTestBoard = placeStone(board, pos, opponent)
    const opponentWinCheck = checkWin(opponentTestBoard, pos, opponent)
    const blocksWinningMove = opponentWinCheck.isWin

    const myScore = myPatterns.reduce((sum, p) => sum + p.score, 0)
    const opponentScore = opponentPatterns.reduce((sum, p) => sum + p.score, 0)

    // Advanced scoring:
    // - Prioritize winning moves
    // - Prioritize blocking opponent wins
    // - Consider creating multiple threats
    // - Consider opponent's potential threats
    let totalScore = myScore * HARD_AI_OWN_PATTERN_MULTIPLIER + opponentScore * HARD_AI_OPPONENT_PATTERN_MULTIPLIER

    if (isWinningMove) totalScore += BONUS_WINNING_MOVE
    if (blocksWinningMove) totalScore += BONUS_BLOCK_WIN

    // Bonus for creating multiple threats
    const openFours = myPatterns.filter(p => p.type === 'open-four').length
    const fours = myPatterns.filter(p => p.type === 'four').length
    const openThrees = myPatterns.filter(p => p.type === 'open-three').length

    totalScore += openFours * BONUS_OPEN_FOUR_MULTIPLIER
    totalScore += fours * BONUS_FOUR_MULTIPLIER
    totalScore += openThrees * BONUS_OPEN_THREE_MULTIPLIER

    // Penalty for allowing opponent to create threats
    const opponentOpenFours = opponentPatterns.filter(p => p.type === 'open-four').length
    const opponentFours = opponentPatterns.filter(p => p.type === 'four').length

    totalScore += opponentOpenFours * BONUS_BLOCK_OPEN_FOUR
    totalScore += opponentFours * BONUS_BLOCK_FOUR

    evaluations.push({
      position: pos,
      threats: [...myPatterns, ...opponentPatterns],
      totalScore,
      isWinningMove,
      blocksWinningMove,
    })
  }

  // Sort by score and pick best
  evaluations.sort((a, b) => b.totalScore - a.totalScore)

  // Add some randomness to top moves to make it less predictable
  const topMoves = evaluations.slice(0, AI_HARD_TOP_MOVES_COUNT)
  const random = Math.random()
  let cumulative = 0

  for (let i = 0; i < topMoves.length; i++) {
    cumulative += AI_HARD_MOVE_WEIGHTS[i]
    if (random <= cumulative) {
      return topMoves[i].position
    }
  }

  return evaluations[0]?.position || null
}

/**
 * Gets the next AI move based on difficulty
 */
export function getAIMove(board: Board, player: Player, difficulty: Difficulty): Position | null {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board)
    case 'medium':
      return getMediumMove(board, player)
    case 'hard':
      return getHardMove(board, player)
    default:
      return getMediumMove(board, player)
  }
}

/**
 * Simulates a move and evaluates the resulting position
 */
export function evaluateMove(
  board: Board,
  position: Position,
  player: Player
): number {
  const testBoard = placeStone(board, position, player)
  const winCheck = checkWin(testBoard, position, player)

  if (winCheck.isWin) {
    return SCORE_FIVE
  }

  const myPatterns = evaluatePosition(board, position, player)
  const opponent = player === 1 ? 2 : 1
  const opponentPatterns = evaluatePosition(board, position, opponent)

  const myScore = myPatterns.reduce((sum, p) => sum + p.score, 0)
  const opponentScore = opponentPatterns.reduce((sum, p) => sum + p.score, 0)

  return myScore - opponentScore * MOVE_EVAL_OPPONENT_MULTIPLIER
}
