/**
 * Character Selection Hook
 * The opponent shown on screen is derived from the game difficulty, so the
 * heading, selector and AI can never disagree.
 */

import { useMemo } from 'react'
import { getCharacterById } from '@shared/characters'
import type { Character } from '@shared/characters'
import type { Difficulty } from '@/types/gomoku.types'
import { difficultyToCharacterId } from '@/lib/characterUrl'

export function useCharacterSelection(difficulty: Difficulty): { character: Character } {
  const character = useMemo(
    () => getCharacterById(difficultyToCharacterId[difficulty]),
    [difficulty]
  )
  return { character }
}
