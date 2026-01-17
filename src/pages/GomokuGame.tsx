/**
 * Gomoku Game Page
 * Main game interface for Gomoku (Five in a Row)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { useGomokuGame } from '@/hooks/useGomokuGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'

export function GomokuGame() {
  const {
    gameState,
    isAnimating,
    handleSquareClick,
    startNewGame,
    changeDifficulty,
    isLastPlaced,
    isWinningPosition,
  } = useGomokuGame()

  const { character, changeCharacter } = useCharacterSelection(gameState.difficulty)
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { playDiscPlace, playVictory, playDefeat, playDraw } = useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const prevStatusRef = useRef(gameState.status)

  // Detect game end - using ref to avoid setState in useEffect
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

      setShowVictoryDialog(true)
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
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

      {/* Board */}
      <Board
        board={gameState.board}
        onSquareClick={handleSquareClick}
        isLastPlaced={isLastPlaced}
        isWinningPosition={isWinningPosition}
        disabled={isAnimating || gameState.status !== 'playing'}
      />

      {/* Game Controls */}
      <div className="mt-8">
        <GameControls
          difficulty={gameState.difficulty}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          gameMode={gameState.mode}
          currentPlayer={gameState.currentPlayer}
          blackCount={gameState.blackCount}
          whiteCount={gameState.whiteCount}
          character={character}
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
        />
      )}
    </div>
  )
}
