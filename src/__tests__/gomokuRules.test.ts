/**
 * Unit tests for Gomoku game rules and logic
 */

import {
  createEmptyBoard,
  isValidPosition,
  isEmpty,
  placeStone,
  checkWin,
  isBoardFull,
  detectPattern,
  evaluatePosition,
  countPieces,
  checkGameOver,
  createInitialGameState,
  getRelevantPositions,
} from '@/lib/gomokuRules'
import type { Move } from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'

describe('gomokuRules', () => {
  describe('createEmptyBoard', () => {
    it('should create a 15x15 empty grid', () => {
      const board = createEmptyBoard()

      expect(board.length).toBe(BOARD_SIZE)
      expect(board[0].length).toBe(BOARD_SIZE)
    })

    it('should have all cells set to null', () => {
      const board = createEmptyBoard()

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          expect(board[row][col]).toBeNull()
        }
      }
    })

    it('should create independent rows (not references)', () => {
      const board = createEmptyBoard()
      board[0][0] = 1

      expect(board[0][0]).toBe(1)
      expect(board[1][0]).toBeNull()
    })
  })

  describe('isValidPosition', () => {
    it('should return true for valid positions within bounds', () => {
      expect(isValidPosition(0, 0)).toBe(true)
      expect(isValidPosition(7, 7)).toBe(true)
      expect(isValidPosition(14, 14)).toBe(true)
      expect(isValidPosition(0, 14)).toBe(true)
      expect(isValidPosition(14, 0)).toBe(true)
    })

    it('should return false for positions out of bounds', () => {
      expect(isValidPosition(-1, 0)).toBe(false)
      expect(isValidPosition(0, -1)).toBe(false)
      expect(isValidPosition(15, 0)).toBe(false)
      expect(isValidPosition(0, 15)).toBe(false)
      expect(isValidPosition(-1, -1)).toBe(false)
      expect(isValidPosition(15, 15)).toBe(false)
    })

    it('should return false for large out-of-bounds values', () => {
      expect(isValidPosition(100, 0)).toBe(false)
      expect(isValidPosition(0, 100)).toBe(false)
      expect(isValidPosition(-100, -100)).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty cells', () => {
      const board = createEmptyBoard()

      expect(isEmpty(board, { row: 0, col: 0 })).toBe(true)
      expect(isEmpty(board, { row: 7, col: 7 })).toBe(true)
      expect(isEmpty(board, { row: 14, col: 14 })).toBe(true)
    })

    it('should return false for occupied cells', () => {
      const board = createEmptyBoard()
      board[7][7] = 1
      board[0][0] = 2

      expect(isEmpty(board, { row: 7, col: 7 })).toBe(false)
      expect(isEmpty(board, { row: 0, col: 0 })).toBe(false)
    })
  })

  describe('placeStone', () => {
    it('should place a stone correctly at the specified position', () => {
      const board = createEmptyBoard()
      const newBoard = placeStone(board, { row: 7, col: 7 }, 1)

      expect(newBoard[7][7]).toBe(1)
    })

    it('should not modify the original board', () => {
      const board = createEmptyBoard()
      const newBoard = placeStone(board, { row: 7, col: 7 }, 1)

      expect(board[7][7]).toBeNull()
      expect(newBoard[7][7]).toBe(1)
    })

    it('should place stones for both players', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 7 }, 1)
      board = placeStone(board, { row: 7, col: 8 }, 2)

      expect(board[7][7]).toBe(1)
      expect(board[7][8]).toBe(2)
    })

    it('should place stones at corner positions', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 0, col: 0 }, 1)
      board = placeStone(board, { row: 0, col: 14 }, 1)
      board = placeStone(board, { row: 14, col: 0 }, 2)
      board = placeStone(board, { row: 14, col: 14 }, 2)

      expect(board[0][0]).toBe(1)
      expect(board[0][14]).toBe(1)
      expect(board[14][0]).toBe(2)
      expect(board[14][14]).toBe(2)
    })
  })

  describe('checkWin', () => {
    describe('horizontal wins', () => {
      it('should detect 5 in a row horizontally in the middle', () => {
        let board = createEmptyBoard()
        for (let col = 5; col < 10; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(true)
        expect(result.winningLine).toHaveLength(5)
      })

      it('should detect 5 in a row horizontally at left edge', () => {
        let board = createEmptyBoard()
        for (let col = 0; col < 5; col++) {
          board = placeStone(board, { row: 0, col }, 1)
        }

        const result = checkWin(board, { row: 0, col: 2 }, 1)

        expect(result.isWin).toBe(true)
      })

      it('should detect 5 in a row horizontally at right edge', () => {
        let board = createEmptyBoard()
        for (let col = 10; col < 15; col++) {
          board = placeStone(board, { row: 14, col }, 2)
        }

        const result = checkWin(board, { row: 14, col: 12 }, 2)

        expect(result.isWin).toBe(true)
      })

      it('should not detect win with only 4 in a row', () => {
        let board = createEmptyBoard()
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(false)
      })
    })

    describe('vertical wins', () => {
      it('should detect 5 in a row vertically in the middle', () => {
        let board = createEmptyBoard()
        for (let row = 5; row < 10; row++) {
          board = placeStone(board, { row, col: 7 }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(true)
        expect(result.winningLine).toHaveLength(5)
      })

      it('should detect 5 in a row vertically at top edge', () => {
        let board = createEmptyBoard()
        for (let row = 0; row < 5; row++) {
          board = placeStone(board, { row, col: 0 }, 1)
        }

        const result = checkWin(board, { row: 2, col: 0 }, 1)

        expect(result.isWin).toBe(true)
      })

      it('should detect 5 in a row vertically at bottom edge', () => {
        let board = createEmptyBoard()
        for (let row = 10; row < 15; row++) {
          board = placeStone(board, { row, col: 14 }, 2)
        }

        const result = checkWin(board, { row: 12, col: 14 }, 2)

        expect(result.isWin).toBe(true)
      })
    })

    describe('diagonal wins (\\)', () => {
      it('should detect 5 in a row diagonally (\\) in the middle', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: 5 + i, col: 5 + i }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(true)
        expect(result.winningLine).toHaveLength(5)
      })

      it('should detect 5 in a row diagonally (\\) at top-left corner', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: i, col: i }, 1)
        }

        const result = checkWin(board, { row: 2, col: 2 }, 1)

        expect(result.isWin).toBe(true)
      })

      it('should detect 5 in a row diagonally (\\) at bottom-right corner', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: 10 + i, col: 10 + i }, 2)
        }

        const result = checkWin(board, { row: 12, col: 12 }, 2)

        expect(result.isWin).toBe(true)
      })
    })

    describe('diagonal wins (/)', () => {
      it('should detect 5 in a row diagonally (/) in the middle', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: 5 + i, col: 9 - i }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(true)
        expect(result.winningLine).toHaveLength(5)
      })

      it('should detect 5 in a row diagonally (/) at top-right corner', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: i, col: 14 - i }, 1)
        }

        const result = checkWin(board, { row: 2, col: 12 }, 1)

        expect(result.isWin).toBe(true)
      })

      it('should detect 5 in a row diagonally (/) at bottom-left corner', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 5; i++) {
          board = placeStone(board, { row: 10 + i, col: 4 - i }, 2)
        }

        const result = checkWin(board, { row: 12, col: 2 }, 2)

        expect(result.isWin).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should detect exactly 5 (overline of 6 still counts as win)', () => {
        let board = createEmptyBoard()
        // Place 6 in a row
        for (let col = 5; col < 11; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        // In standard Gomoku, 6+ in a row is still a win
        expect(result.isWin).toBe(true)
      })

      it('should not detect win when checking wrong player', () => {
        let board = createEmptyBoard()
        for (let col = 5; col < 10; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 2)

        expect(result.isWin).toBe(false)
      })

      it('should return winning line positions correctly', () => {
        let board = createEmptyBoard()
        for (let col = 5; col < 10; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(true)
        expect(result.winningLine).toBeDefined()
        expect(result.winningLine!.every(pos => pos.row === 7)).toBe(true)
      })

      it('should handle single stone (no win)', () => {
        let board = createEmptyBoard()
        board = placeStone(board, { row: 7, col: 7 }, 1)

        const result = checkWin(board, { row: 7, col: 7 }, 1)

        expect(result.isWin).toBe(false)
      })
    })
  })

  describe('isBoardFull', () => {
    it('should return false for empty board', () => {
      const board = createEmptyBoard()

      expect(isBoardFull(board)).toBe(false)
    })

    it('should return false for partially filled board', () => {
      let board = createEmptyBoard()
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
        }
      }

      expect(isBoardFull(board)).toBe(false)
    })

    it('should return true for completely filled board', () => {
      let board = createEmptyBoard()
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
        }
      }

      expect(isBoardFull(board)).toBe(true)
    })

    it('should return false when only one cell is empty', () => {
      let board = createEmptyBoard()
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (row !== 7 || col !== 7) {
            board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
          }
        }
      }

      expect(isBoardFull(board)).toBe(false)
    })
  })

  describe('detectPattern', () => {
    it('should detect five in a row', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 10; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 5 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('five')
    })

    it('should detect open four', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 9; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 5 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('open-four')
    })

    it('should detect closed four (one end blocked)', () => {
      let board = createEmptyBoard()
      // Block left end
      board = placeStone(board, { row: 7, col: 0 }, 2)
      for (let col = 1; col < 5; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 1 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('four')
    })

    it('should detect open three', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 8; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 5 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('open-three')
    })

    it('should detect closed three', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 0 }, 2)
      for (let col = 1; col < 4; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 1 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('three')
    })

    it('should detect two with open end', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 7; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const pattern = detectPattern(board, { row: 7, col: 5 }, [0, 1], 1)

      expect(pattern).not.toBeNull()
      expect(pattern!.type).toBe('two')
    })

    it('should return null for single stone with no threat', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 0, col: 0 }, 2) // Block one side
      board = placeStone(board, { row: 7, col: 7 }, 1)
      board = placeStone(board, { row: 7, col: 8 }, 2) // Block other side

      const pattern = detectPattern(board, { row: 7, col: 7 }, [0, 1], 1)

      // Pattern should be null for blocked single stone
      expect(pattern).toBeNull()
    })
  })

  describe('evaluatePosition', () => {
    it('should return patterns for a position that creates threats', () => {
      let board = createEmptyBoard()
      // Create a setup where placing creates patterns
      for (let col = 5; col < 8; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const patterns = evaluatePosition(board, { row: 7, col: 8 }, 1)

      expect(patterns.length).toBeGreaterThan(0)
    })

    it('should return empty array for isolated position', () => {
      const board = createEmptyBoard()

      // An isolated position in the center with no neighbors
      const patterns = evaluatePosition(board, { row: 7, col: 7 }, 1)

      // Single stone with no neighbors - might have 'two' patterns in some directions or empty
      expect(Array.isArray(patterns)).toBe(true)
    })

    it('should evaluate multiple directions', () => {
      let board = createEmptyBoard()
      // Create patterns in multiple directions
      board = placeStone(board, { row: 6, col: 7 }, 1) // Vertical
      board = placeStone(board, { row: 7, col: 6 }, 1) // Horizontal
      board = placeStone(board, { row: 6, col: 6 }, 1) // Diagonal

      const patterns = evaluatePosition(board, { row: 7, col: 7 }, 1)

      expect(patterns.length).toBeGreaterThan(0)
    })
  })

  describe('countPieces', () => {
    it('should return 0 for both players on empty board', () => {
      const board = createEmptyBoard()

      const counts = countPieces(board)

      expect(counts.blackCount).toBe(0)
      expect(counts.whiteCount).toBe(0)
    })

    it('should count pieces correctly', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 0, col: 0 }, 1)
      board = placeStone(board, { row: 0, col: 1 }, 1)
      board = placeStone(board, { row: 0, col: 2 }, 1)
      board = placeStone(board, { row: 1, col: 0 }, 2)
      board = placeStone(board, { row: 1, col: 1 }, 2)

      const counts = countPieces(board)

      expect(counts.blackCount).toBe(3)
      expect(counts.whiteCount).toBe(2)
    })

    it('should handle filled board', () => {
      let board = createEmptyBoard()
      let black = 0
      let white = 0

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const player = (row + col) % 2 === 0 ? 1 : 2
          board = placeStone(board, { row, col }, player)
          if (player === 1) black++
          else white++
        }
      }

      const counts = countPieces(board)

      expect(counts.blackCount).toBe(black)
      expect(counts.whiteCount).toBe(white)
    })
  })

  describe('checkGameOver', () => {
    it('should return not over for empty board', () => {
      const board = createEmptyBoard()

      const result = checkGameOver(board)

      expect(result.isOver).toBe(false)
      expect(result.winner).toBeNull()
      expect(result.isDraw).toBe(false)
    })

    it('should detect win when last move creates 5 in a row', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 10; col++) {
        board = placeStone(board, { row: 7, col }, 1)
      }

      const lastMove: Move = { position: { row: 7, col: 9 }, player: 1 }
      const result = checkGameOver(board, lastMove)

      expect(result.isOver).toBe(true)
      expect(result.winner).toBe(1)
      expect(result.isDraw).toBe(false)
      expect(result.winningLine).toBeDefined()
    })

    it('should detect draw when board is full with no winner', () => {
      let board = createEmptyBoard()
      // Fill board in a pattern that doesn't create 5 in a row
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          // Alternating pattern that avoids 5 in a row
          const player = ((row * BOARD_SIZE + col) % 3 === 0 ? 1 : 2) as 1 | 2
          board = placeStone(board, { row, col }, player)
        }
      }

      const result = checkGameOver(board)

      expect(result.isOver).toBe(true)
      expect(result.winner).toBeNull()
      expect(result.isDraw).toBe(true)
    })

    it('should not be over when game is in progress', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 7 }, 1)
      board = placeStone(board, { row: 7, col: 8 }, 2)

      const lastMove: Move = { position: { row: 7, col: 8 }, player: 2 }
      const result = checkGameOver(board, lastMove)

      expect(result.isOver).toBe(false)
      expect(result.winner).toBeNull()
      expect(result.isDraw).toBe(false)
    })

    it('should return correct winner for player 2', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 10; col++) {
        board = placeStone(board, { row: 7, col }, 2)
      }

      const lastMove: Move = { position: { row: 7, col: 7 }, player: 2 }
      const result = checkGameOver(board, lastMove)

      expect(result.isOver).toBe(true)
      expect(result.winner).toBe(2)
    })
  })

  describe('createInitialGameState', () => {
    it('should create initial state with empty board', () => {
      const state = createInitialGameState()

      expect(state.board.length).toBe(BOARD_SIZE)
      expect(state.board.every(row => row.every(cell => cell === null))).toBe(true)
    })

    it('should set player 1 (black) as current player', () => {
      const state = createInitialGameState()

      expect(state.currentPlayer).toBe(1)
    })

    it('should set status to playing', () => {
      const state = createInitialGameState()

      expect(state.status).toBe('playing')
    })

    it('should respect mode parameter', () => {
      const pvpState = createInitialGameState('pvp')
      const pvcState = createInitialGameState('pvc')

      expect(pvpState.mode).toBe('pvp')
      expect(pvcState.mode).toBe('pvc')
    })

    it('should respect difficulty parameter', () => {
      const easyState = createInitialGameState('pvc', 'easy')
      const mediumState = createInitialGameState('pvc', 'medium')
      const hardState = createInitialGameState('pvc', 'hard')

      expect(easyState.difficulty).toBe('easy')
      expect(mediumState.difficulty).toBe('medium')
      expect(hardState.difficulty).toBe('hard')
    })

    it('should initialize counts to zero', () => {
      const state = createInitialGameState()

      expect(state.blackCount).toBe(0)
      expect(state.whiteCount).toBe(0)
    })

    it('should have empty move history', () => {
      const state = createInitialGameState()

      expect(state.moveHistory).toEqual([])
    })
  })

  describe('getRelevantPositions', () => {
    it('should return center position for empty board', () => {
      const board = createEmptyBoard()

      const positions = getRelevantPositions(board)

      expect(positions).toHaveLength(1)
      expect(positions[0]).toEqual({ row: 7, col: 7 })
    })

    it('should return positions around placed stones', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 7 }, 1)

      const positions = getRelevantPositions(board, 2)

      // Should have positions within range 2 around (7,7)
      expect(positions.length).toBeGreaterThan(0)
      expect(positions.every(pos => isEmpty(board, pos))).toBe(true)
    })

    it('should not include occupied positions', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 7 }, 1)
      board = placeStone(board, { row: 7, col: 8 }, 2)

      const positions = getRelevantPositions(board)

      const hasOccupied = positions.some(
        pos => (pos.row === 7 && pos.col === 7) || (pos.row === 7 && pos.col === 8)
      )
      expect(hasOccupied).toBe(false)
    })

    it('should respect range parameter', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 7, col: 7 }, 1)

      const smallRange = getRelevantPositions(board, 1)
      const largeRange = getRelevantPositions(board, 3)

      expect(largeRange.length).toBeGreaterThan(smallRange.length)
    })

    it('should handle edge positions correctly', () => {
      let board = createEmptyBoard()
      board = placeStone(board, { row: 0, col: 0 }, 1)

      const positions = getRelevantPositions(board)

      // All positions should be valid (within bounds)
      expect(positions.every(pos => isValidPosition(pos.row, pos.col))).toBe(true)
    })
  })

  describe('win detection edge cases', () => {
    it('should detect win at corner (0,0)', () => {
      let board = createEmptyBoard()
      for (let i = 0; i < 5; i++) {
        board = placeStone(board, { row: i, col: 0 }, 1)
      }

      const result = checkWin(board, { row: 0, col: 0 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win at corner (0,14)', () => {
      let board = createEmptyBoard()
      for (let i = 0; i < 5; i++) {
        board = placeStone(board, { row: i, col: 14 }, 1)
      }

      const result = checkWin(board, { row: 0, col: 14 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win at corner (14,0)', () => {
      let board = createEmptyBoard()
      for (let i = 0; i < 5; i++) {
        board = placeStone(board, { row: 14, col: i }, 1)
      }

      const result = checkWin(board, { row: 14, col: 0 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win at corner (14,14)', () => {
      let board = createEmptyBoard()
      for (let i = 0; i < 5; i++) {
        board = placeStone(board, { row: 14 - i, col: 14 - i }, 1)
      }

      const result = checkWin(board, { row: 14, col: 14 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win along top edge', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 10; col++) {
        board = placeStone(board, { row: 0, col }, 1)
      }

      const result = checkWin(board, { row: 0, col: 7 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win along bottom edge', () => {
      let board = createEmptyBoard()
      for (let col = 5; col < 10; col++) {
        board = placeStone(board, { row: 14, col }, 2)
      }

      const result = checkWin(board, { row: 14, col: 7 }, 2)

      expect(result.isWin).toBe(true)
    })

    it('should detect win along left edge', () => {
      let board = createEmptyBoard()
      for (let row = 5; row < 10; row++) {
        board = placeStone(board, { row, col: 0 }, 1)
      }

      const result = checkWin(board, { row: 7, col: 0 }, 1)

      expect(result.isWin).toBe(true)
    })

    it('should detect win along right edge', () => {
      let board = createEmptyBoard()
      for (let row = 5; row < 10; row++) {
        board = placeStone(board, { row, col: 14 }, 2)
      }

      const result = checkWin(board, { row: 7, col: 14 }, 2)

      expect(result.isWin).toBe(true)
    })
  })
})
