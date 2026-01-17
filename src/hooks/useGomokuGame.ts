/**
 * Gomoku Game Hook
 * Main game state management for Gomoku (Five in a Row)
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, Position, Move } from '@/types/gomoku.types'
import {
  createInitialGameState,
  placeStone,
  checkGameOver,
  countPieces,
  isEmpty,
} from '@/lib/gomokuRules'
import { getAIMove } from '@/lib/aiStrategies'
import { AI_MOVE_DELAY_MS, MOVE_ANIMATION_DELAY_MS } from '@/constants/gameConstants'

export function useGomokuGame(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState('pvc', initialDifficulty)
  )
  const [lastPlacedPosition, setLastPlacedPosition] = useState<Position | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const aiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiMoveScheduledRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Handle AI move when it's AI's turn (Player 2 = White)
  useEffect(() => {
    if (
      gameState.currentPlayer === 2 &&
      gameState.status === 'playing' &&
      gameState.mode === 'pvc' &&
      !isAnimating &&
      !aiMoveScheduledRef.current
    ) {
      aiMoveScheduledRef.current = true

      aiMoveTimeoutRef.current = setTimeout(() => {
        try {
          const aiPosition = getAIMove(gameState.board, 2, gameState.difficulty)

          if (aiPosition) {
            setIsAnimating(true)
            setLastPlacedPosition(aiPosition)

            animationTimeoutRef.current = setTimeout(() => {
              setGameState(prevState => {
                try {
                  const newBoard = placeStone(prevState.board, aiPosition, 2)
                  const counts = countPieces(newBoard)

                  const move: Move = {
                    position: aiPosition,
                    player: 2,
                  }

                  const gameOver = checkGameOver(newBoard, move)
                  const nextPlayer = prevState.currentPlayer === 1 ? 2 : 1

                  return {
                    ...prevState,
                    board: newBoard,
                    currentPlayer: nextPlayer,
                    status: gameOver.isOver ? (gameOver.isDraw ? 'draw' : 'won') : 'playing',
                    winner: gameOver.winner,
                    winningLine: gameOver.winningLine,
                    moveHistory: [...prevState.moveHistory, move],
                    lastMove: move,
                    ...counts,
                  }
                } catch {
                  // AI move execution failed - return previous state to maintain game integrity
                  return prevState
                }
              })
              setIsAnimating(false)
              animationTimeoutRef.current = null
            }, MOVE_ANIMATION_DELAY_MS)
          }
        } catch {
          // AI move calculation failed - reset animation state
          setIsAnimating(false)
        } finally {
          aiMoveScheduledRef.current = false
        }
      }, AI_MOVE_DELAY_MS)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
      }
    }
  }, [
    gameState.currentPlayer,
    gameState.status,
    gameState.mode,
    gameState.board,
    gameState.difficulty,
    isAnimating,
  ])

  /**
   * Handles clicking on a square to place a stone
   */
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      // Can't place stone if not player's turn, game over, or animating
      if (
        isAnimating ||
        gameState.status !== 'playing' ||
        gameState.currentPlayer !== 1
      ) {
        return
      }

      const position = { row, col }

      // Can't place stone on occupied square
      if (!isEmpty(gameState.board, position)) {
        return
      }

      // Place the stone
      setIsAnimating(true)
      setLastPlacedPosition(position)

      animationTimeoutRef.current = setTimeout(() => {
        setGameState(prevState => {
          try {
            const newBoard = placeStone(prevState.board, position, 1)
            const counts = countPieces(newBoard)

            const move: Move = {
              position,
              player: 1,
            }

            const gameOver = checkGameOver(newBoard, move)
            const nextPlayer = prevState.currentPlayer === 1 ? 2 : 1

            return {
              ...prevState,
              board: newBoard,
              currentPlayer: nextPlayer,
              status: gameOver.isOver ? (gameOver.isDraw ? 'draw' : 'won') : 'playing',
              winner: gameOver.winner,
              winningLine: gameOver.winningLine,
              moveHistory: [...prevState.moveHistory, move],
              lastMove: move,
              ...counts,
            }
          } catch {
            // Move execution failed - return previous state to maintain game integrity
            return prevState
          }
        })
        setIsAnimating(false)
        animationTimeoutRef.current = null
      }, MOVE_ANIMATION_DELAY_MS)
    },
    [gameState.board, gameState.status, gameState.currentPlayer, isAnimating]
  )

  /**
   * Starts a new game
   */
  const startNewGame = useCallback(() => {
    setGameState(createInitialGameState('pvc', gameState.difficulty))
    setLastPlacedPosition(null)
    setIsAnimating(false)
  }, [gameState.difficulty])

  /**
   * Changes difficulty level
   */
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setGameState(prevState => ({
      ...prevState,
      difficulty: newDifficulty,
    }))
  }, [])

  /**
   * Checks if a position is the last placed stone
   */
  const isLastPlaced = useCallback(
    (row: number, col: number): boolean => {
      return (
        lastPlacedPosition !== null &&
        lastPlacedPosition.row === row &&
        lastPlacedPosition.col === col
      )
    },
    [lastPlacedPosition]
  )

  /**
   * Checks if a position is part of the winning line
   */
  const isWinningPosition = useCallback(
    (row: number, col: number): boolean => {
      return (
        gameState.winningLine?.some(pos => pos.row === row && pos.col === col) || false
      )
    },
    [gameState.winningLine]
  )

  return {
    gameState,
    isAnimating,
    handleSquareClick,
    startNewGame,
    changeDifficulty,
    isLastPlaced,
    isWinningPosition,
  }
}
