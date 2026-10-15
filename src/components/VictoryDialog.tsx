/**
 * Victory Dialog Component
 * Shows game result with Gomoku-themed personality messages
 */

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import type { Player } from '@/types/gomoku.types'
import type { Character } from '@shared/characters'

interface VictoryDialogProps {
  open: boolean
  winner: Player | null
  blackCount: number
  whiteCount: number
  onPlayAgain: () => void
  onClose: () => void
  character: Character
}

export function VictoryDialog({
  open,
  winner,
  blackCount,
  whiteCount,
  onPlayAgain,
  onClose,
  character,
}: VictoryDialogProps) {
  const isDraw = winner === null
  const [victoryMessage, setVictoryMessage] = useState('')

  // Select random message when dialog opens (in effect to comply with React 19 purity rules)
  // Math.random() must be called in effect, not during render, to maintain purity
  // Using queueMicrotask to defer setState and avoid cascading renders
  useEffect(() => {
    if (open) {
      let message: string
      if (isDraw) {
        const drawMessages = [
          `A tie. You and ${character.name} are evenly matched.`,
          `A draw. ${character.name} is impressed with your balance.`,
          'Neither side prevails. Rematch?',
          `Dead even. ${character.name} wants a rematch.`,
          'A stalemate. Five in a row is harder than it looks.',
        ]
        message = drawMessages[Math.floor(Math.random() * drawMessages.length)]
      } else if (winner === 1) {
        // Player won - use character's playerWins catchphrases
        const messages = character.catchphrases.playerWins
        message = messages[Math.floor(Math.random() * messages.length)]
      } else {
        // Character won - use character's characterWins catchphrases
        const messages = character.catchphrases.characterWins
        message = messages[Math.floor(Math.random() * messages.length)]
      }
      queueMicrotask(() => {
        setVictoryMessage(message)
      })
    }
  }, [open, isDraw, winner, character])

  const art = winner === 1 ? character.loseImage : winner === 2 ? character.winImage : character.playAgainImage
  const result = isDraw ? 'Draw' : winner === 1 ? `You beat ${character.name}` : `${character.name} won`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" hideClose>
        <DialogHeader className="items-center text-center sm:text-center">
          <img
            src={art}
            alt={character.name}
            className="mb-2 max-h-44 w-auto object-contain"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = character.avatar
            }}
          />
          <DialogTitle className="text-xl">{result}</DialogTitle>
          <DialogDescription>{victoryMessage}</DialogDescription>
        </DialogHeader>

        <p className="text-balance text-center text-sm text-muted-foreground">
          Stones placed: you {blackCount}, {character.name} {whiteCount}.{' '}
          {isDraw
            ? 'The board is full.'
            : `${winner === 1 ? 'You' : character.name} won with five in a row.`}
        </p>

        <DialogFooter className="gap-2 sm:justify-center sm:space-x-0">
          <Button onClick={onPlayAgain} className="h-11">
            Play again
          </Button>
          <Button onClick={onClose} variant="ghost" className="h-11">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
