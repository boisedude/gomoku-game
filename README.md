# Gomoku - Five in a Row

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)

A browser-based Gomoku (Five in a Row) strategy game with personality-driven AI opponents. Challenge Bella, Coop, or Bentley - three unique characters with distinct playing styles and personalities!

![Screenshot](screenshot.png)

## Features

- **Classic Gomoku gameplay** - Connect 5 stones in a row to win on a 15x15 board
- **Three AI opponents** with unique personalities and difficulty levels:
  - **Bella 🐕** (Easy): Sweet, playful puppy who's still learning
  - **Coop 🎮** (Medium): Friendly arcade owner with solid strategy
  - **Bentley 🐺** (Hard): Ruthless mastermind with advanced threat detection
- **Character-driven experience** - Each opponent has unique catchphrases, reactions, and images
- **Smart AI patterns** - Pattern recognition, threat detection, and multi-step lookahead
- **Smooth animations** - Clean board rendering with visual feedback
- **Sound effects** - Web Audio API for stone placement and victory/defeat sounds
- **Leaderboard system** - Track your wins, losses, win streaks, and performance stats
- **Responsive UI** - Beautiful amber-themed board with character avatars
- **Keyboard controls** - Full accessibility support

## Tech Stack

- **React 19** with TypeScript - Latest React features with strict type safety
- **Vite 5** - Lightning-fast build tool and dev server
- **Tailwind CSS + shadcn/ui** - Beautiful, accessible UI components
- **React Router 7** - Client-side routing
- **Web Audio API** - Dynamic sound effects
- **Error Boundaries** - Graceful error handling

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

**Objective**: Get 5 stones in a row (horizontally, vertically, or diagonally) before your opponent.

**Gameplay**:
1. You play as Black, your opponent plays as White
2. Click any empty intersection to place your stone
3. First player to connect 5 stones in a row wins
4. If the board fills with no winner, the game is a draw

**Strategy Tips**:
- Control the center of the board early
- Create multiple threats simultaneously
- Watch for opponent patterns and block threats
- Open threes and fours are powerful attacking moves

## AI Difficulty Levels

### Bella - The Playful Pup (Easy)
Enthusiastic puppy who's still learning the game. Makes random moves and gets easily distracted. Perfect for beginners!

**Playing Style**: Random move selection from relevant positions

### Coop - The Casual Challenger (Medium)
Friendly arcade owner who knows his games. Plays solid strategy and blocks threats.

**Playing Style**:
- Detects immediate winning moves
- Blocks opponent's winning threats
- Evaluates patterns and creates strategic positions

### Bentley - The Mastermind (Hard)
Calculating, intense champion who thinks several moves ahead. Shows no mercy!

**Playing Style**:
- Advanced threat detection and blocking
- Multi-step pattern recognition
- Creates multiple simultaneous threats
- Evaluates open-fours, fours, and open-threes
- Strategic scoring with weighted randomness

## Project Structure

```
gomoku/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── Board.tsx              # 15x15 game board
│   │   ├── Square.tsx             # Individual square component
│   │   ├── GameControls.tsx       # Difficulty selector and controls
│   │   ├── VictoryDialog.tsx      # End game dialog with character reactions
│   │   └── LeaderboardDialog.tsx  # Stats and leaderboard
│   ├── hooks/
│   │   ├── useGomokuGame.ts       # Game state management
│   │   ├── useLeaderboard.ts      # Stats tracking
│   │   ├── useGameAudio.ts        # Sound effects
│   │   └── useCharacterSelection.ts # Character management
│   ├── lib/
│   │   ├── gomokuRules.ts         # Game rules engine
│   │   ├── aiStrategies.ts        # AI algorithms (easy, medium, hard)
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   └── GomokuGame.tsx         # Main game page
│   ├── types/
│   │   └── gomoku.types.ts        # TypeScript type definitions
│   ├── App.tsx                    # Main app with routing
│   └── main.tsx                   # Entry point
├── shared/
│   └── characters.ts              # Character definitions (Bella, Coop, Bentley)
├── public/
│   └── characters/                # Character images
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Deployment

Build the production bundle:

```bash
npm run build
```

The `dist/` folder contains all static assets ready to deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

The game is a single-page application (SPA) with no backend requirements - all game logic runs client-side.

## Development

### Code Quality Commands

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format code with Prettier
npm run type-check    # Run TypeScript compiler
```

### Character System

Characters are defined in `/shared/characters.ts` with:
- Unique personalities and backstories
- Custom avatars and reaction images
- Difficulty-specific catchphrases
- Theme colors and emojis

## Contributing

Contributions are welcome! This is an open-source project created for learning and portfolio purposes.

### Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- TypeScript strict mode compliance
- ESLint passes with no errors
- Code is formatted with Prettier
- Maintain the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by M. Cooper for [www.mcooper.com](https://www.mcooper.com)

---

**Challenge the dogs! Can you beat Bentley?**
