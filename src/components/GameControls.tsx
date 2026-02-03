/**
 * Game Controls Component
 * Controls for difficulty selection, new game, leaderboard, undo, etc.
 */

import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { Difficulty, GameMode } from '@/types/gomoku.types'

interface GameControlsProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onNewGame: () => void
  onShowLeaderboard: () => void
  onShowHelp?: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
  gameMode: GameMode
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onShowLeaderboard,
  onShowHelp,
  onUndo,
  canUndo = false,
  disabled = false,
  gameMode,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Difficulty and Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {gameMode === 'pvc' && (
          <div className="flex items-center gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium">
              Your Opponent:
            </label>
            <Select
              value={difficulty}
              onValueChange={value => onDifficultyChange(value as Difficulty)}
            >
              <SelectTrigger id="difficulty" className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🐕 Bella - Playful Pup</SelectItem>
                <SelectItem value="medium">🎮 Coop - Casual Challenger</SelectItem>
                <SelectItem value="hard">🐺 Bentley - The Mastermind</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={onNewGame} disabled={disabled} variant="default" aria-label="Start a new game">
          New Game
        </Button>

        {onUndo && (
          <Button
            onClick={onUndo}
            disabled={disabled || !canUndo}
            variant="outline"
            aria-label="Undo last move (U)"
            title="Undo (U)"
          >
            Undo
          </Button>
        )}

        <Button onClick={onShowLeaderboard} disabled={disabled} variant="outline" aria-label="View game statistics">
          📊 Stats
        </Button>

        {onShowHelp && (
          <Button onClick={onShowHelp} disabled={disabled} variant="outline" aria-label="Learn how to play">
            ❓ How to Play
          </Button>
        )}
      </div>

    </div>
  )
}
