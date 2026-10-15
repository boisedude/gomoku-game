/**
 * Reports a finished game to the arcade-wide Bentley record.
 * Only decisive games against Bentley (hard) count; draws post nothing.
 */

import { recordPlayerBeatBentley, recordBentleyBeatPlayer } from '@shared/arcadeRecord'
import type { Difficulty, Player } from '@/types/gomoku.types'

export function reportArcadeResult(difficulty: Difficulty, winner: Player | null): void {
  if (difficulty !== 'hard') return
  if (winner === 1) void recordPlayerBeatBentley()
  else if (winner === 2) void recordBentleyBeatPlayer()
}
