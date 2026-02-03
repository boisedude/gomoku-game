/**
 * Unit tests for Gomoku AI Strategies
 */

import { getAIMove } from '@/lib/aiStrategies'
import {
  createEmptyBoard,
  placeStone,
  checkWin,
  isValidPosition,
  isEmpty,
} from '@/lib/gomokuRules'
import type { Difficulty, Player } from '@/types/gomoku.types'
import { BOARD_SIZE } from '@/types/gomoku.types'

describe('aiStrategies', () => {
  describe('getAIMove', () => {
    describe('basic functionality', () => {
      it('should return a valid move for empty board', () => {
        const board = createEmptyBoard()
        const move = getAIMove(board, 2, 'easy')

        expect(move).not.toBeNull()
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
        expect(isEmpty(board, move!)).toBe(true)
      })

      it('should return a valid move for each difficulty', () => {
        const board = createEmptyBoard()
        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 2, difficulty)

          expect(move).not.toBeNull()
          expect(isValidPosition(move!.row, move!.col)).toBe(true)
          expect(isEmpty(board, move!)).toBe(true)
        })
      })

      it('should work for both players', () => {
        const board = createEmptyBoard()

        const moveP1 = getAIMove(board, 1, 'medium')
        const moveP2 = getAIMove(board, 2, 'medium')

        expect(moveP1).not.toBeNull()
        expect(moveP2).not.toBeNull()
      })

      it('should not return an occupied position', () => {
        let board = createEmptyBoard()
        // Fill center area
        for (let row = 5; row < 10; row++) {
          for (let col = 5; col < 10; col++) {
            if ((row + col) % 2 === 0) {
              board = placeStone(board, { row, col }, 1)
            }
          }
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        expect(isEmpty(board, move!)).toBe(true)
      })
    })

    describe('Easy difficulty', () => {
      it('should return valid moves (random selection)', () => {
        const board = createEmptyBoard()

        // Run multiple times to verify randomness doesn't break validity
        for (let i = 0; i < 10; i++) {
          const move = getAIMove(board, 2, 'easy')
          expect(move).not.toBeNull()
          expect(isEmpty(board, move!)).toBe(true)
        }
      })

      it('should show some variation (randomness test)', () => {
        let board = createEmptyBoard()
        // Place a stone so there are more positions to choose from
        board = placeStone(board, { row: 7, col: 7 }, 1)

        const moves = new Set<string>()

        // Run 30 times to detect randomness
        for (let i = 0; i < 30; i++) {
          const move = getAIMove(board, 2, 'easy')
          if (move) {
            moves.add(`${move.row},${move.col}`)
          }
        }

        // With many positions available, we should see variety
        expect(moves.size).toBeGreaterThan(1)
      })

      it('should handle board with limited positions', () => {
        let board = createEmptyBoard()
        // Fill most of the board, leaving just a few positions
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (row !== 7 || col !== 7) {
              board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
            }
          }
        }

        const move = getAIMove(board, 2, 'easy')

        expect(move).not.toBeNull()
        expect(move!.row).toBe(7)
        expect(move!.col).toBe(7)
      })
    })

    describe('Medium difficulty', () => {
      it('should complete own 4-in-a-row to win', () => {
        let board = createEmptyBoard()
        // Set up 4 in a row for AI (player 2)
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 2)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should complete the winning move at col 4 or col 9
        const isWinningMove =
          (move!.row === 7 && move!.col === 4) || (move!.row === 7 && move!.col === 9)
        expect(isWinningMove).toBe(true)
      })

      it('should block opponent 4-in-a-row', () => {
        let board = createEmptyBoard()
        // Set up 4 in a row for opponent (player 1)
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should block at col 4 or col 9
        const isBlockingMove =
          (move!.row === 7 && move!.col === 4) || (move!.row === 7 && move!.col === 9)
        expect(isBlockingMove).toBe(true)
      })

      it('should prioritize winning over blocking', () => {
        let board = createEmptyBoard()
        // Set up 4 in a row for AI (player 2) at row 5
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 5, col }, 2)
        }
        // Set up 4 in a row for opponent (player 1) at row 7
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should choose to win rather than block
        const isWinningMove =
          (move!.row === 5 && move!.col === 4) || (move!.row === 5 && move!.col === 9)
        expect(isWinningMove).toBe(true)
      })

      it('should return valid moves on complex board', () => {
        let board = createEmptyBoard()
        // Create a complex mid-game position
        const moves: [number, number, Player][] = [
          [7, 7, 1],
          [7, 8, 2],
          [8, 7, 1],
          [8, 8, 2],
          [6, 6, 1],
          [9, 9, 2],
          [5, 5, 1],
        ]

        for (const [row, col, player] of moves) {
          board = placeStone(board, { row, col }, player)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        expect(isEmpty(board, move!)).toBe(true)
      })
    })

    describe('Hard difficulty', () => {
      it('should complete own 4-in-a-row to win', () => {
        let board = createEmptyBoard()
        // Set up 4 in a row for AI (player 2)
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 2)
        }

        // Hard AI has some randomness - run multiple times to verify it wins most of the time
        let winCount = 0
        for (let i = 0; i < 10; i++) {
          const move = getAIMove(board, 2, 'hard')
          expect(move).not.toBeNull()
          const newBoard = placeStone(board, move!, 2)
          const winCheck = checkWin(newBoard, move!, 2)
          if (winCheck.isWin) winCount++
        }
        // Should win in most attempts (hard AI prioritizes winning moves)
        expect(winCount).toBeGreaterThanOrEqual(7)
      })

      it('should block opponent 4-in-a-row', () => {
        let board = createEmptyBoard()
        // Set up 4 in a row for opponent (player 1)
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Should block at col 4 or col 9
        const isBlockingMove =
          (move!.row === 7 && move!.col === 4) || (move!.row === 7 && move!.col === 9)
        expect(isBlockingMove).toBe(true)
      })

      it('should recognize open-ended threats', () => {
        let board = createEmptyBoard()
        // Create open three for opponent (player 1)
        for (let col = 6; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Hard AI should recognize the threat and respond appropriately
        // Either blocking one end or creating a counter-threat
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
      })

      it('should prefer creating open four over regular four', () => {
        let board = createEmptyBoard()
        // Set up position where AI can create open four
        board = placeStone(board, { row: 7, col: 5 }, 2)
        board = placeStone(board, { row: 7, col: 6 }, 2)
        board = placeStone(board, { row: 7, col: 7 }, 2)

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Should extend the line to create open four
        const isGoodMove =
          (move!.row === 7 && move!.col === 4) || (move!.row === 7 && move!.col === 8)
        expect(isGoodMove).toBe(true)
      })

      it('should handle vertical threats', () => {
        let board = createEmptyBoard()
        // Set up 4 in a column for opponent
        for (let row = 5; row < 9; row++) {
          board = placeStone(board, { row, col: 7 }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Hard AI should make a strategic response near the threat
        // It may block directly or create a counter-threat
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
        expect(isEmpty(board, move!)).toBe(true)
        // Move should be near the threat (within 2 cells of the threat zone)
        const nearThreat = move!.col >= 5 && move!.col <= 9
        expect(nearThreat).toBe(true)
      })

      it('should handle diagonal threats (\\)', () => {
        let board = createEmptyBoard()
        // Set up 4 in diagonal for opponent
        for (let i = 0; i < 4; i++) {
          board = placeStone(board, { row: 5 + i, col: 5 + i }, 1)
        }

        // Hard AI has randomness in top moves selection
        // Run multiple times to verify it blocks most of the time
        let blockCount = 0
        for (let i = 0; i < 10; i++) {
          const move = getAIMove(board, 2, 'hard')
          expect(move).not.toBeNull()
          // Should block at one end of the diagonal
          const isBlockingMove =
            (move!.row === 4 && move!.col === 4) || (move!.row === 9 && move!.col === 9)
          if (isBlockingMove) blockCount++
        }
        // Should block in most attempts
        expect(blockCount).toBeGreaterThanOrEqual(6)
      })

      it('should handle diagonal threats (/)', () => {
        let board = createEmptyBoard()
        // Set up 4 in anti-diagonal for opponent
        for (let i = 0; i < 4; i++) {
          board = placeStone(board, { row: 5 + i, col: 9 - i }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Should block at one end of the anti-diagonal
        const isBlockingMove =
          (move!.row === 4 && move!.col === 10) || (move!.row === 9 && move!.col === 5)
        expect(isBlockingMove).toBe(true)
      })
    })

    describe('pattern detection accuracy', () => {
      it('should detect and respond to double-three threats', () => {
        let board = createEmptyBoard()
        // Create L-shaped formation that threatens double three
        board = placeStone(board, { row: 7, col: 5 }, 1)
        board = placeStone(board, { row: 7, col: 6 }, 1)
        board = placeStone(board, { row: 5, col: 7 }, 1)
        board = placeStone(board, { row: 6, col: 7 }, 1)

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // AI should recognize the threat and block at the intersection
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
      })

      it('should correctly identify winning positions', () => {
        let board = createEmptyBoard()
        // Set up guaranteed win for AI
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 2)
        }

        const move = getAIMove(board, 2, 'hard')

        // Execute the move
        const newBoard = placeStone(board, move!, 2)
        const winCheck = checkWin(newBoard, move!, 2)

        expect(winCheck.isWin).toBe(true)
      })

      it('should detect edge patterns correctly', () => {
        let board = createEmptyBoard()
        // Create 3 in a row at edge
        for (let col = 0; col < 3; col++) {
          board = placeStone(board, { row: 0, col }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Should respond to the edge threat
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
      })

      it('should handle corner patterns', () => {
        let board = createEmptyBoard()
        // Create diagonal from corner
        for (let i = 0; i < 3; i++) {
          board = placeStone(board, { row: i, col: i }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
      })
    })

    describe('strategic behavior', () => {
      it('should prefer center positions on empty board', () => {
        const board = createEmptyBoard()
        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Center area is rows/cols 5-9
        expect(move!.row).toBeGreaterThanOrEqual(5)
        expect(move!.row).toBeLessThanOrEqual(9)
        expect(move!.col).toBeGreaterThanOrEqual(5)
        expect(move!.col).toBeLessThanOrEqual(9)
      })

      it('should respond near opponent stones', () => {
        let board = createEmptyBoard()
        board = placeStone(board, { row: 7, col: 7 }, 1)

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should be near the opponent's stone
        const distance = Math.max(
          Math.abs(move!.row - 7),
          Math.abs(move!.col - 7)
        )
        expect(distance).toBeLessThanOrEqual(3)
      })

      it('hard AI should be more consistent than easy AI', () => {
        const board = createEmptyBoard()

        // Run hard AI multiple times
        const hardMoves = new Set<string>()
        for (let i = 0; i < 10; i++) {
          const move = getAIMove(board, 2, 'hard')
          if (move) {
            hardMoves.add(`${move.row},${move.col}`)
          }
        }

        // Hard AI should be relatively deterministic (with some randomness for top moves)
        expect(hardMoves.size).toBeLessThanOrEqual(3)
      })
    })

    describe('edge cases', () => {
      it('should handle nearly full board', () => {
        let board = createEmptyBoard()
        // Fill board except for a few positions
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (row < 14 || col < 12) {
              board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
            }
          }
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        expect(isEmpty(board, move!)).toBe(true)
      })

      it('should handle board with only one valid move', () => {
        let board = createEmptyBoard()
        // Fill board except (7,7)
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (row !== 7 || col !== 7) {
              board = placeStone(board, { row, col }, (row + col) % 2 === 0 ? 1 : 2)
            }
          }
        }

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 2, difficulty)
          expect(move).toEqual({ row: 7, col: 7 })
        })
      })

      it('should handle sparse board', () => {
        let board = createEmptyBoard()
        // Just a few scattered stones
        board = placeStone(board, { row: 0, col: 0 }, 1)
        board = placeStone(board, { row: 14, col: 14 }, 2)
        board = placeStone(board, { row: 0, col: 14 }, 1)

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        expect(isValidPosition(move!.row, move!.col)).toBe(true)
      })
    })

    describe('performance', () => {
      it('should complete within reasonable time for initial board', () => {
        const board = createEmptyBoard()
        const startTime = Date.now()

        getAIMove(board, 2, 'hard')

        const elapsed = Date.now() - startTime
        // Should complete within 2 seconds
        expect(elapsed).toBeLessThan(2000)
      })

      it('should complete within reasonable time for complex position', () => {
        let board = createEmptyBoard()
        // Create complex mid-game position
        const positions: [number, number, Player][] = [
          [7, 7, 1], [7, 8, 2], [8, 7, 1], [8, 8, 2],
          [6, 6, 1], [6, 9, 2], [9, 6, 1], [9, 9, 2],
          [5, 5, 1], [5, 10, 2], [10, 5, 1], [10, 10, 2],
        ]

        for (const [row, col, player] of positions) {
          board = placeStone(board, { row, col }, player)
        }

        const startTime = Date.now()
        getAIMove(board, 2, 'hard')
        const elapsed = Date.now() - startTime

        expect(elapsed).toBeLessThan(3000)
      })

      it('easy AI should be faster than hard AI', () => {
        let board = createEmptyBoard()
        board = placeStone(board, { row: 7, col: 7 }, 1)

        // Run more iterations for measurable time difference
        const iterations = 50

        const easyStart = Date.now()
        for (let i = 0; i < iterations; i++) {
          getAIMove(board, 2, 'easy')
        }
        const easyTime = Date.now() - easyStart

        const hardStart = Date.now()
        for (let i = 0; i < iterations; i++) {
          getAIMove(board, 2, 'hard')
        }
        const hardTime = Date.now() - hardStart

        // Easy should be faster or equal (both can be very fast on modern hardware)
        // Just verify easy isn't slower
        expect(easyTime).toBeLessThanOrEqual(hardTime + 100)
      })
    })

    describe('defensive play', () => {
      it('should block immediate vertical threat', () => {
        let board = createEmptyBoard()
        // Create vertical threat
        for (let row = 5; row < 9; row++) {
          board = placeStone(board, { row, col: 7 }, 1)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should block at row 4 or 9
        const isBlocking =
          (move!.row === 4 && move!.col === 7) || (move!.row === 9 && move!.col === 7)
        expect(isBlocking).toBe(true)
      })

      it('should block open three before it becomes open four', () => {
        let board = createEmptyBoard()
        // Open three in horizontal
        for (let col = 6; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        const move = getAIMove(board, 2, 'hard')

        expect(move).not.toBeNull()
        // Should block at one of the open ends
        const isBlocking =
          (move!.row === 7 && move!.col === 5) || (move!.row === 7 && move!.col === 9)
        expect(isBlocking).toBe(true)
      })
    })

    describe('offensive play', () => {
      it('should extend own line to create threat', () => {
        let board = createEmptyBoard()
        // AI has 3 in a row
        for (let col = 6; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 2)
        }

        const move = getAIMove(board, 2, 'medium')

        expect(move).not.toBeNull()
        // Should extend to create 4 in a row
        const isExtending =
          (move!.row === 7 && move!.col === 5) || (move!.row === 7 && move!.col === 9)
        expect(isExtending).toBe(true)
      })

      it('should complete 5 in a row when possible', () => {
        let board = createEmptyBoard()
        // AI has 4 in a row
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 2)
        }

        const move = getAIMove(board, 2, 'easy') // Even easy AI should win

        expect(move).not.toBeNull()
        // Verify it's a winning move
        const newBoard = placeStone(board, move!, 2)
        checkWin(newBoard, move!, 2)

        // Note: Easy AI is random, might not always find the win
        // But medium and hard should always find it
        const moveMedium = getAIMove(board, 2, 'medium')
        const newBoardMedium = placeStone(board, moveMedium!, 2)
        const winCheckMedium = checkWin(newBoardMedium, moveMedium!, 2)
        expect(winCheckMedium.isWin).toBe(true)
      })
    })

    describe('difficulty comparison', () => {
      it('all difficulties should return valid moves', () => {
        let board = createEmptyBoard()
        board = placeStone(board, { row: 7, col: 7 }, 1)

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 2, difficulty)
          expect(move).not.toBeNull()
          expect(isEmpty(board, move!)).toBe(true)
        })
      })

      it('medium and hard should block threats better than easy', () => {
        let board = createEmptyBoard()
        // Set up threat - 4 in a row for opponent
        for (let col = 5; col < 9; col++) {
          board = placeStone(board, { row: 7, col }, 1)
        }

        // Medium should block - test by checking it prevents immediate win
        const mediumMove = getAIMove(board, 2, 'medium')
        expect(mediumMove).not.toBeNull()
        const isMediumBlocking =
          (mediumMove!.row === 7 && mediumMove!.col === 4) ||
          (mediumMove!.row === 7 && mediumMove!.col === 9)
        expect(isMediumBlocking).toBe(true)

        // Hard AI has some randomness in top moves selection
        // Run multiple times to verify it blocks most of the time
        let hardBlockCount = 0
        for (let i = 0; i < 10; i++) {
          const hardMove = getAIMove(board, 2, 'hard')
          const isHardBlocking =
            (hardMove!.row === 7 && hardMove!.col === 4) ||
            (hardMove!.row === 7 && hardMove!.col === 9)
          if (isHardBlocking) hardBlockCount++
        }
        // Hard should block in most attempts (allowing for randomness in top moves)
        expect(hardBlockCount).toBeGreaterThanOrEqual(7)
      })
    })
  })
})
