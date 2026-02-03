/**
 * Gomoku Game Page
 * Main game interface for Gomoku (Five in a Row)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { Tutorial } from '@/components/Tutorial'
import { useGomokuGame } from '@/hooks/useGomokuGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'
import { STORAGE_KEY_TUTORIAL_COMPLETED, TUTORIAL_SHOW_DELAY_MS } from '@/constants/gameConstants'

export function GomokuGame() {
  const {
    gameState,
    isAnimating,
    handleSquareClick,
    startNewGame,
    changeDifficulty,
    undoMove,
    canUndo,
    isLastPlaced,
    isWinningPosition,
  } = useGomokuGame()

  const { character, changeCharacter } = useCharacterSelection(gameState.difficulty)
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { playDiscPlace, playVictory, playDefeat, playDraw } = useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TUTORIAL_COMPLETED) === 'true'
  })
  const prevStatusRef = useRef(gameState.status)

  // Show tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true)
      }, TUTORIAL_SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedTutorial])

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    setHasCompletedTutorial(true)
    try {
      localStorage.setItem(STORAGE_KEY_TUTORIAL_COMPLETED, 'true')
    } catch {
      // localStorage may be unavailable or full - tutorial will show again on next visit
    }
  }, [])

  // Detect game end - using ref to track status changes
  // Sound effects and stats recording are side effects that sync with external systems
  // Dialog display is deferred using queueMicrotask to avoid cascading renders
  useEffect(() => {
    const prevStatus = prevStatusRef.current

    if (prevStatus === 'playing' && gameState.status !== 'playing') {
      const totalMoves = gameState.moveHistory.length

      if (gameState.status === 'won') {
        if (gameState.winner === 1) {
          // Player wins
          playVictory()
          recordWin(0, totalMoves, false)
        } else if (gameState.winner === 2) {
          // AI wins
          playDefeat()
          recordLoss(totalMoves)
        }
      } else if (gameState.status === 'draw') {
        playDraw()
        recordDraw(totalMoves)
      }

      // Defer dialog display to avoid synchronous setState in effect
      queueMicrotask(() => {
        setShowVictoryDialog(true)
      })
    }

    prevStatusRef.current = gameState.status
  }, [
    gameState.status,
    gameState.winner,
    gameState.moveHistory.length,
    playVictory,
    playDefeat,
    playDraw,
    recordWin,
    recordLoss,
    recordDraw,
  ])

  // Play sound when moves are made
  useEffect(() => {
    if (gameState.lastMove) {
      playDiscPlace()
    }
  }, [gameState.lastMove, playDiscPlace])

  const handleNewGame = useCallback(() => {
    setShowVictoryDialog(false)
    startNewGame()
  }, [startNewGame])

  const handleDifficultyChange = useCallback(
    (difficulty: 'easy' | 'medium' | 'hard') => {
      changeDifficulty(difficulty)
      changeCharacter(difficulty)
    },
    [changeDifficulty, changeCharacter]
  )

  // Keyboard shortcut for undo (U key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === 'u' || event.key === 'U') {
        if (canUndo) {
          undoMove()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, undoMove])

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-amber-50 to-amber-100 p-2 sm:p-4 sm:justify-center">
      {/* Return to Arcade Button */}
      <div className="w-full max-w-md mb-3 sm:mb-4">
        <a href="https://www.mcooper.com/arcade/" className="block">
          <button
            className="w-full sm:w-auto h-10 sm:h-11 px-4 text-sm sm:text-base font-semibold border-2 border-amber-300 rounded-lg bg-white hover:bg-amber-50 hover:border-amber-500 transition-colors"
          >
            ← Return to Arcade
          </button>
        </a>
      </div>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold text-amber-900">Gomoku</h1>
        <p className="text-lg text-amber-700">
          Five in a Row - Challenge {character.name}
        </p>
      </div>

      {/* Character Info */}
      <div className="mb-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow-lg">
        <img
          src={character.avatar}
          alt={character.name}
          className="h-16 w-16 rounded-full border-2 border-amber-500"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {character.name} {character.emoji}
          </h3>
          <p className="text-sm text-gray-600">{character.playingStyle}</p>
        </div>
      </div>

      {/* Game Info */}
      <div className="mb-4 flex gap-8 rounded-lg bg-white p-4 shadow-lg">
        <div className="text-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-gray-600" />
            <div className="text-2xl font-bold text-gray-900">{gameState.blackCount}</div>
          </div>
          <div className="text-sm text-gray-600">Your Stones</div>
        </div>
        <div className="border-l border-gray-300" />
        <div className="text-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-white border-2 border-gray-400" />
            <div className="text-2xl font-bold text-gray-800">{gameState.whiteCount}</div>
          </div>
          <div className="text-sm text-gray-600">{character.name}'s Stones</div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold text-gray-700">
          {gameState.currentPlayer === 1 ? '⚫ Your Turn (Black)' : `⚪ ${character.name}'s Turn (White)`}
        </p>
        <p className="text-sm text-gray-600">Get 5 in a row to win!</p>
      </div>

      {/* Aria-live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {gameState.status === 'playing'
          ? gameState.currentPlayer === 1
            ? 'Your turn. You are playing black stones.'
            : `${character.name}'s turn. They are playing white stones.`
          : gameState.status === 'won'
            ? gameState.winner === 1
              ? 'Congratulations! You won the game!'
              : `${character.name} won the game.`
            : 'The game ended in a draw.'}
      </div>

      {/* Board */}
      <Board
        board={gameState.board}
        onSquareClick={handleSquareClick}
        isLastPlaced={isLastPlaced}
        isWinningPosition={isWinningPosition}
        winningLine={gameState.winningLine}
        disabled={isAnimating || gameState.status !== 'playing'}
        currentPlayer={gameState.currentPlayer}
      />

      {/* Game Controls */}
      <div className="mt-8">
        <GameControls
          difficulty={gameState.difficulty}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowHelp={() => setShowTutorial(true)}
          onUndo={undoMove}
          canUndo={canUndo}
          gameMode={gameState.mode}
        />
      </div>

      {/* Victory Dialog */}
      {showVictoryDialog && (
        <VictoryDialog
          open={showVictoryDialog}
          winner={gameState.winner}
          character={character}
          onPlayAgain={handleNewGame}
          onClose={() => setShowVictoryDialog(false)}
          blackCount={gameState.blackCount}
          whiteCount={gameState.whiteCount}
        />
      )}

      {/* Leaderboard Dialog */}
      {showLeaderboard && (
        <LeaderboardDialog
          open={showLeaderboard}
          stats={stats}
          onClose={() => setShowLeaderboard(false)}
          onUpdatePlayerName={updatePlayerName}
          onResetStats={resetStats}
          characterName={character.name}
        />
      )}

      {/* Tutorial Dialog */}
      <Tutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  )
}
