/**
 * Game Constants
 * Centralized constants for Gomoku game configuration
 */

// =============================================================================
// AI Configuration
// =============================================================================

/** Delay before AI makes a move (ms) */
export const AI_MOVE_DELAY_MS = 600

/** Delay for move animation (ms) */
export const MOVE_ANIMATION_DELAY_MS = 200

/** Search range for easy AI (cells around placed stones) */
export const AI_EASY_SEARCH_RANGE = 3

/** Search range for medium/hard AI (cells around placed stones) */
export const AI_MEDIUM_HARD_SEARCH_RANGE = 2

/** Probability weights for hard AI top moves selection [best, second, third] */
export const AI_HARD_MOVE_WEIGHTS = [0.7, 0.2, 0.1] as const

/** Number of top moves considered by hard AI */
export const AI_HARD_TOP_MOVES_COUNT = 3

// =============================================================================
// Scoring Values for AI Evaluation
// =============================================================================

/** Score for winning (5 in a row) */
export const SCORE_FIVE = 1000000

/** Score for an open four (can't be blocked) */
export const SCORE_OPEN_FOUR = 10000

/** Score for a closed four (one end blocked) */
export const SCORE_FOUR = 1000

/** Score for an open three */
export const SCORE_OPEN_THREE = 500

/** Score for a closed three */
export const SCORE_THREE = 100

/** Score for a two in a row with open end */
export const SCORE_TWO = 10

// =============================================================================
// Hard AI Strategic Bonuses
// =============================================================================

/** Bonus for immediate winning move */
export const BONUS_WINNING_MOVE = 10000000

/** Bonus for blocking opponent's winning move */
export const BONUS_BLOCK_WIN = 5000000

/** Bonus multiplier for creating open fours */
export const BONUS_OPEN_FOUR_MULTIPLIER = 50000

/** Bonus multiplier for creating fours */
export const BONUS_FOUR_MULTIPLIER = 10000

/** Bonus multiplier for creating open threes */
export const BONUS_OPEN_THREE_MULTIPLIER = 5000

/** Bonus for blocking opponent's open fours */
export const BONUS_BLOCK_OPEN_FOUR = 100000

/** Bonus for blocking opponent's fours */
export const BONUS_BLOCK_FOUR = 20000

// =============================================================================
// AI Score Multipliers
// =============================================================================

/** Multiplier for player's own patterns in medium AI */
export const MEDIUM_AI_OWN_PATTERN_MULTIPLIER = 1.0

/** Multiplier for opponent patterns in medium AI (blocking priority) */
export const MEDIUM_AI_OPPONENT_PATTERN_MULTIPLIER = 1.2

/** Multiplier for player's own patterns in hard AI */
export const HARD_AI_OWN_PATTERN_MULTIPLIER = 1.5

/** Multiplier for opponent patterns in hard AI */
export const HARD_AI_OPPONENT_PATTERN_MULTIPLIER = 1.3

/** Multiplier for opponent score in move evaluation */
export const MOVE_EVAL_OPPONENT_MULTIPLIER = 0.9

// =============================================================================
// Board Configuration
// =============================================================================

/** Number of stones in a row needed to win */
export const WIN_LENGTH = 5

/** Last row/column index (BOARD_SIZE - 1) */
export const BOARD_LAST_INDEX = 14

// =============================================================================
// Storage Keys
// =============================================================================

/** LocalStorage key for audio mute setting */
export const STORAGE_KEY_AUDIO_MUTED = 'gomoku-audio-muted'

/** LocalStorage key for leaderboard stats */
export const STORAGE_KEY_LEADERBOARD = 'gomoku-leaderboard'

/** LocalStorage key for tutorial completion */
export const STORAGE_KEY_TUTORIAL_COMPLETED = 'gomoku-tutorial-completed'

/** Delay before showing tutorial on first visit (ms) */
export const TUTORIAL_SHOW_DELAY_MS = 500
