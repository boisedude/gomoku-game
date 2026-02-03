/**
 * Gomoku Game Hook
 * Main game state management for Gomoku (Five in a Row)
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, Position, Move, UndoState } from '@/types/gomoku.types'
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
  const [isAIThinking, setIsAIThinking] = useState(false)

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
      setIsAIThinking(true)

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
                    // Clear undo state on game over, keep it otherwise for player to undo
                    undoState: gameOver.isOver ? null : prevState.undoState,
                  }
                } catch {
                  // AI move execution failed - return previous state to maintain game integrity
                  return prevState
                }
              })
              setIsAnimating(false)
              setIsAIThinking(false)
              animationTimeoutRef.current = null
            }, MOVE_ANIMATION_DELAY_MS)
          } else {
            setIsAIThinking(false)
          }
        } catch {
          // AI move calculation failed - reset animation state
          setIsAnimating(false)
          setIsAIThinking(false)
        } finally {
          aiMoveScheduledRef.current = false
        }
      }, AI_MOVE_DELAY_MS)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
        setIsAIThinking(false)
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

            // Save undo state before player move (only in pvc mode)
            const newUndoState: UndoState | null =
              prevState.mode === 'pvc' && !gameOver.isOver
                ? {
                    board: prevState.board,
                    currentPlayer: prevState.currentPlayer,
                    lastMove: prevState.lastMove,
                    blackCount: prevState.blackCount,
                    whiteCount: prevState.whiteCount,
                  }
                : null

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
              undoState: newUndoState,
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
    // Clear any pending AI moves
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    aiMoveScheduledRef.current = false
    setGameState(createInitialGameState('pvc', gameState.difficulty))
    setLastPlacedPosition(null)
    setIsAnimating(false)
    setIsAIThinking(false)
  }, [gameState.difficulty])

  /**
   * Undo the last move(s)
   * In VS AI mode: Undoes both the AI's response and the player's move
   * In PvP mode: Undoes single move (not yet implemented for PvP)
   */
  const undoMove = useCallback(() => {
    // Can't undo during animation or AI thinking
    if (isAnimating || isAIThinking) return

    setGameState(prevState => {
      // Can't undo if no undo state available
      if (!prevState.undoState) return prevState
      // Can only undo during active play
      if (prevState.status !== 'playing') return prevState
      // In pvc mode, can only undo when it's player's turn (after AI moved)
      if (prevState.mode === 'pvc' && prevState.currentPlayer !== 1) return prevState

      const { undoState } = prevState

      // Calculate how many moves to remove from history
      // In pvc mode, we undo 2 moves (player + AI)
      const movesToRemove = prevState.mode === 'pvc' ? 2 : 1
      const newMoveHistory = prevState.moveHistory.slice(0, -movesToRemove)

      return {
        ...prevState,
        board: undoState.board,
        currentPlayer: undoState.currentPlayer,
        lastMove: undoState.lastMove,
        blackCount: undoState.blackCount,
        whiteCount: undoState.whiteCount,
        moveHistory: newMoveHistory,
        undoState: null, // Clear undo state after using it
      }
    })

    // Update lastPlacedPosition based on new state
    setLastPlacedPosition(null)
  }, [isAnimating, isAIThinking])

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

  /**
   * Check if undo is available
   */
  const canUndo =
    gameState.undoState !== null &&
    gameState.status === 'playing' &&
    !isAnimating &&
    !isAIThinking &&
    (gameState.mode === 'pvc' ? gameState.currentPlayer === 1 : true)

  return {
    gameState,
    isAnimating,
    isAIThinking,
    handleSquareClick,
    startNewGame,
    changeDifficulty,
    undoMove,
    canUndo,
    isLastPlaced,
    isWinningPosition,
  }
}
