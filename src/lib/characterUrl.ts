/**
 * Maps the arcade's ?character= URL parameter to a character and difficulty.
 * The difficulty held in game state is the single source of truth; the
 * displayed character is always derived from it.
 */

import type { CharacterId } from '@shared/characters'
import type { Difficulty } from '@/types/gomoku.types'

export const difficultyToCharacterId: Record<Difficulty, CharacterId> = {
  easy: 'bella',
  medium: 'coop',
  hard: 'bentley',
}

const characterIdToDifficulty: Record<CharacterId, Difficulty> = {
  bella: 'easy',
  coop: 'medium',
  bentley: 'hard',
}

/** Returns the character id named in a query string, or null if absent or invalid. */
export function getCharacterIdFromSearch(search: string): CharacterId | null {
  const value = new URLSearchParams(search).get('character')?.toLowerCase() ?? null
  if (value && Object.prototype.hasOwnProperty.call(characterIdToDifficulty, value)) {
    return value as CharacterId
  }
  return null
}

/** Difficulty for a query string: bella easy, bentley hard, otherwise medium. */
export function getDifficultyFromSearch(search: string): Difficulty {
  const id = getCharacterIdFromSearch(search)
  return id ? characterIdToDifficulty[id] : 'medium'
}

export function getInitialDifficulty(): Difficulty {
  return getDifficultyFromSearch(typeof window === 'undefined' ? '' : window.location.search)
}

export function hasCharacterParam(): boolean {
  return (
    typeof window !== 'undefined' && getCharacterIdFromSearch(window.location.search) !== null
  )
}
