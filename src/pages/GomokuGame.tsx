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
import { OpponentChip } from '@/components/OpponentChip'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, VolumeIcon, VolumeOffIcon, HelpIcon } from '@shared/icons'
import { useGomokuGame } from '@/hooks/useGomokuGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'
import { getInitialDifficulty, hasCharacterParam } from '@/lib/characterUrl'
import { reportArcadeResult } from '@/lib/arcadeResult'
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
  } = useGomokuGame(getInitialDifficulty())

  const { character } = useCharacterSelection(gameState.difficulty)
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { playDiscPlace, playVictory, playDefeat, playDraw, isMuted, toggleMute } = useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TUTORIAL_COMPLETED) === 'true'
    } catch {
      return false
    }
  })
  // The arcade passes ?character=, so never greet those players with a tutorial
  const [openedFromArcade] = useState(() => hasCharacterParam())
  const prevStatusRef = useRef(gameState.status)

  // Show tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial && !openedFromArcade) {
      const timer = setTimeout(() => {
        setShowTutorial(true)
      }, TUTORIAL_SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedTutorial, openedFromArcade])

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
          reportArcadeResult(gameState.difficulty, 1)
        } else if (gameState.winner === 2) {
          // AI wins
          playDefeat()
          recordLoss(totalMoves)
          reportArcadeResult(gameState.difficulty, 2)
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
    gameState.difficulty,
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
    },
    [changeDifficulty]
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

  const opponent = character.name
  const turnText =
    gameState.status === 'won'
      ? gameState.winner === 1
        ? 'You won'
        : `${opponent} won`
      : gameState.status === 'draw'
        ? 'Draw'
        : gameState.currentPlayer === 1
          ? 'Your turn'
          : `${opponent} is thinking`
  const turnActive =
    gameState.status !== 'playing' ? 'over' : gameState.currentPlayer === 1 ? 'you' : 'opponent'

  return (
    <div className="arcade-page">
      <a
        href="#game-board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to game board
      </a>

      <header className="arcade-topbar">
        <div className="flex flex-1 items-center">
          <a
            href="https://www.mcooper.com/arcade/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={18} />
            Arcade
          </a>
        </div>
        <h1 className="arcade-display sr-only text-xl sm:not-sr-only">Gomoku</h1>
        <div className="flex flex-1 items-center justify-end gap-1">
          <OpponentChip
            character={character}
            difficulty={gameState.difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setShowTutorial(true)}
            aria-label="How to play"
          >
            <HelpIcon />
          </Button>
        </div>
      </header>

      <main className="arcade-stage">
        <div className="arcade-score" aria-live="polite">
          <div>
            <strong>{gameState.blackCount}</strong>
            You
          </div>
          <div className="arcade-turn" data-active={turnActive}>
            {turnText}
          </div>
          <div>
            <strong>{gameState.whiteCount}</strong>
            {opponent}
          </div>
        </div>

        <div id="game-board" className="flex w-full justify-center">
          <Board
            board={gameState.board}
            onSquareClick={handleSquareClick}
            isLastPlaced={isLastPlaced}
            isWinningPosition={isWinningPosition}
            disabled={isAnimating || gameState.status !== 'playing'}
            currentPlayer={gameState.currentPlayer}
          />
        </div>

        <GameControls
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowHelp={() => setShowTutorial(true)}
          onUndo={undoMove}
          canUndo={canUndo}
        />
      </main>

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

      {showLeaderboard && (
        <LeaderboardDialog
          open={showLeaderboard}
          stats={stats}
          onClose={() => setShowLeaderboard(false)}
          onUpdatePlayerName={updatePlayerName}
          onResetStats={resetStats}
        />
      )}

      <Tutorial
        open={showTutorial}
        opponentName={opponent}
        onClose={() => {
          setShowTutorial(false)
          handleTutorialComplete()
        }}
        onComplete={handleTutorialComplete}
      />
    </div>
  )
}
