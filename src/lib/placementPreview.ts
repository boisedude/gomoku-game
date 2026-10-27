/**
 * Two-step placement for touch screens.
 * Cells are too small to tap reliably on a phone, so the first tap on an
 * intersection only previews the stone; tapping the same one again places it.
 */

import type { Position } from '@/types/gomoku.types'

export interface TapResult {
  /** True when the stone should be placed now */
  place: boolean
  /** The intersection to show as a preview afterwards (null for none) */
  preview: Position | null
}

export function resolveTap(preview: Position | null, tap: Position, coarse: boolean): TapResult {
  if (!coarse) return { place: true, preview: null }
  if (preview && preview.row === tap.row && preview.col === tap.col) {
    return { place: true, preview: null }
  }
  return { place: false, preview: tap }
}

/** True on touch-first devices; read at tap time so it follows the device state. */
export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
}
