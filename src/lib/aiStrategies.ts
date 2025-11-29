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

/**
 * Easy AI: Random move from available positions
 */
function getEasyMove(board: Board): Position | null {
  const relevantPositions = getRelevantPositions(board, 3)
  if (relevantPositions.length === 0) return null

  // Pick random position
  return relevantPositions[Math.floor(Math.random() * relevantPositions.length)]
}

/**
 * Medium AI: Basic threat detection and blocking
 */
function getMediumMove(board: Board, player: Player): Position | null {
  const opponent = player === 1 ? 2 : 1
  const relevantPositions = getRelevantPositions(board, 2)

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
    const totalScore = myScore + opponentScore * 1.2

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
  const relevantPositions = getRelevantPositions(board, 2)

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
    let totalScore = myScore * 1.5 + opponentScore * 1.3

    if (isWinningMove) totalScore += 10000000
    if (blocksWinningMove) totalScore += 5000000

    // Bonus for creating multiple threats
    const openFours = myPatterns.filter(p => p.type === 'open-four').length
    const fours = myPatterns.filter(p => p.type === 'four').length
    const openThrees = myPatterns.filter(p => p.type === 'open-three').length

    totalScore += openFours * 50000
    totalScore += fours * 10000
    totalScore += openThrees * 5000

    // Penalty for allowing opponent to create threats
    const opponentOpenFours = opponentPatterns.filter(p => p.type === 'open-four').length
    const opponentFours = opponentPatterns.filter(p => p.type === 'four').length

    totalScore += opponentOpenFours * 100000
    totalScore += opponentFours * 20000

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
  const topMoves = evaluations.slice(0, 3)
  const weights = [0.7, 0.2, 0.1]
  const random = Math.random()
  let cumulative = 0

  for (let i = 0; i < topMoves.length; i++) {
    cumulative += weights[i]
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
    return 1000000
  }

  const myPatterns = evaluatePosition(board, position, player)
  const opponent = player === 1 ? 2 : 1
  const opponentPatterns = evaluatePosition(board, position, opponent)

  const myScore = myPatterns.reduce((sum, p) => sum + p.score, 0)
  const opponentScore = opponentPatterns.reduce((sum, p) => sum + p.score, 0)

  return myScore - opponentScore * 0.9
}
