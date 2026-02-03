/**
 * Tutorial Component
 * Interactive walkthrough for first-time Gomoku players
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

interface TutorialProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

interface TutorialStep {
  title: string
  description: string
  tip?: string
  image?: React.ReactNode
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Gomoku!',
    description:
      "Gomoku, also known as Five in a Row, is a classic strategy game with simple rules but deep tactics. Let's learn how to play!",
    image: (
      <div className="flex items-center justify-center py-4">
        <div className="grid grid-cols-5 gap-1">
          {[...Array(25)].map((_, i) => {
            const isBlack = [6, 7, 8, 9, 10].includes(i)
            return (
              <div
                key={i}
                className={`h-8 w-8 rounded-full border-2 ${
                  isBlack
                    ? 'bg-gradient-to-br from-gray-900 to-black border-gray-600'
                    : 'border-amber-300 bg-amber-100'
                }`}
              />
            )
          })}
        </div>
      </div>
    ),
  },
  {
    title: 'The Goal',
    description:
      'Your objective is simple: be the first to get FIVE of your stones in a row. You can win horizontally, vertically, or diagonally.',
    tip: 'Plan ahead! Every stone you place should either advance your winning line or block your opponent.',
  },
  {
    title: 'You Are Black',
    description:
      'You play as Black stones, and the AI plays as White. Black always goes first, giving you a slight advantage!',
    image: (
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-gray-600 shadow-lg" />
          <div className="mt-2 text-sm font-semibold">You (Black)</div>
        </div>
        <div className="text-3xl font-bold text-gray-400">vs</div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-white border-2 border-gray-400 shadow-lg" />
          <div className="mt-2 text-sm font-semibold">AI (White)</div>
        </div>
      </div>
    ),
  },
  {
    title: 'How to Play',
    description:
      'Click on any empty intersection on the board to place your stone. Once placed, stones cannot be moved. Then the AI takes its turn automatically.',
    tip: 'The center of the board is the most strategic position to start!',
  },
  {
    title: 'Winning Patterns',
    description:
      'You win by getting five stones in a row. Watch for all directions: horizontal (-), vertical (|), and both diagonal directions (/ and \\).',
    image: (
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        <div className="text-center">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-900 to-black border border-gray-600"
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-600">Horizontal</div>
        </div>
        <div className="text-center">
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-900 to-black border border-gray-600"
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-600">Vertical</div>
        </div>
        <div className="text-center">
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-900 to-black border border-gray-600"
                style={{ marginLeft: `${i * 8}px` }}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-600">Diagonal</div>
        </div>
      </div>
    ),
    tip: 'Try to create multiple threats at once. Your opponent can only block one direction at a time!',
  },
  {
    title: 'Strategy Tips',
    description:
      'Build "open" lines with both ends free - they are harder to block. Create forks with two open-ended threes, forcing your opponent into an impossible situation.',
    tip: 'An open-ended four (4 stones with both ends free) is an unstoppable winning move!',
  },
  {
    title: 'Choose Your Challenge',
    description:
      "Start on Easy mode to learn the basics. When you're ready, challenge yourself with Medium or Hard difficulty. The Hard AI thinks many moves ahead!",
    tip: 'Easy is great for practice. Medium teaches strategy. Hard is for experts!',
  },
  {
    title: 'Ready to Play!',
    description:
      "You're all set! Remember: control the center, think ahead, create multiple threats, and watch for your opponent's moves. Good luck!",
    tip: 'You can access this tutorial anytime by clicking "How to Play" in the game controls.',
  },
]

export function Tutorial({ open, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      onClose()
      setCurrentStep(0) // Reset for next time
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    onClose()
    setCurrentStep(0) // Reset for next time
  }

  const handleClose = () => {
    onClose()
    setCurrentStep(0) // Reset for next time
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Visual */}
          {step.image && <div>{step.image}</div>}

          {/* Description */}
          <p className="text-center text-muted-foreground">{step.description}</p>

          {/* Tip */}
          {step.tip && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <div className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
                Tip
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">{step.tip}</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-amber-600'
                    : index < currentStep
                      ? 'bg-amber-400'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="sm:w-auto">
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="bg-amber-600 hover:bg-amber-700">
              {isLastStep ? "Let's Play!" : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
