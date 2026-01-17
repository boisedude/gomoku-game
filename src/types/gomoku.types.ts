/**
 * Gomoku (Five in a Row) Game Type Definitions
 */

// Player identifiers
export type Player = 1 | 2 // 1 = Black (Player), 2 = White (AI)

// Cell value can be a player's stone or null
export type CellValue = Player | null

// Game board: 15x15 grid
export const BOARD_SIZE = 15

// Board state (15x15 grid)
export type Board = CellValue[][]

// Game status
export type GameStatus = 'playing' | 'won' | 'draw'

// Game mode
export type GameMode = 'pvp' | 'pvc' // Player vs Player or Player vs Computer

// AI difficulty levels with personality
export type Difficulty = 'easy' | 'medium' | 'hard'

// Position on the board
export interface Position {
  row: number
  col: number
}

// Move representation
export interface Move {
  position: Position
  player: Player
}

// Complete game state
export interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winner: Player | null
  mode: GameMode
  difficulty: Difficulty
  moveHistory: Move[]
  lastMove?: Move
  blackCount: number // Player's stone count
  whiteCount: number // AI's stone count
  winningLine?: Position[] // Positions that form the winning line
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerName: string
  wins: number
  losses: number
  draws: number
  winStreak: number
  longestWinStreak: number
  totalCaptures: number // Best winning margin (stones difference)
  kingsCreated: number // Total stones placed across all games
  perfectGames: number // Games won with no opponent threats
  totalGames: number
  multiJumps: number // Total moves made across all games
}

// Saved game state
export interface SavedGame extends GameState {
  savedAt: number
}

// Direction vectors for checking lines (8 directions)
export const DIRECTIONS = [
  [-1, -1], // NW
  [-1, 0],  // N
  [-1, 1],  // NE
  [0, -1],  // W
  [0, 1],   // E
  [1, -1],  // SW
  [1, 0],   // S
  [1, 1],   // SE
] as const

export type Direction = typeof DIRECTIONS[number]

// Pattern types for AI evaluation
export interface Pattern {
  type: 'five' | 'open-four' | 'four' | 'open-three' | 'three' | 'two'
  direction: Direction
  positions: Position[]
  score: number
}

// Threat evaluation
export interface ThreatEvaluation {
  position: Position
  threats: Pattern[]
  totalScore: number
  isWinningMove: boolean
  blocksWinningMove: boolean
}
