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
  opponentName: string
  onClose: () => void
  onComplete: () => void
}

interface TutorialStep {
  title: string
  description: string
  tip?: string
  image?: React.ReactNode
}

const stone = 'rounded-full bg-gradient-to-br from-neutral-700 to-black'
const whiteStone = 'rounded-full bg-gradient-to-br from-white to-neutral-300'

function getSteps(opponent: string): TutorialStep[] {
  return [
    {
      title: 'Welcome to gomoku',
      description:
        'Gomoku, also known as five in a row, is a classic strategy game with simple rules and deep tactics.',
      image: (
        <div className="flex items-center justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-8 w-8 ${stone}`} />
          ))}
        </div>
      ),
    },
    {
      title: 'The goal',
      description:
        'Be the first to get five of your stones in a row. You can win horizontally, vertically, or diagonally.',
      tip: 'Every stone should either advance your own line or block your opponent.',
    },
    {
      title: 'You play black',
      description: `You play black and ${opponent} plays white. Black always goes first, which gives you a slight advantage.`,
      image: (
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className={`mx-auto h-12 w-12 ${stone}`} />
            <div className="mt-2 text-sm font-semibold">You</div>
          </div>
          <div className="text-muted-foreground">vs</div>
          <div className="text-center">
            <div className={`mx-auto h-12 w-12 ${whiteStone}`} />
            <div className="mt-2 text-sm font-semibold">{opponent}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'How a turn works',
      description: `Click any empty intersection to place a stone. Stones never move once placed. Then ${opponent} takes a turn.`,
      tip: 'The centre of the board is a strong place to start.',
    },
    {
      title: 'Winning patterns',
      description:
        'Watch every direction: horizontal, vertical, and both diagonals. Five in a row wins, and the winning stones are ringed.',
      tip: 'Try to make two threats at once. Your opponent can only block one.',
    },
    {
      title: 'Strategy',
      description:
        'Build open lines with both ends free, since they are harder to block. A fork of two open threes forces your opponent into a corner.',
      tip: 'An open four, with both ends free, cannot be stopped.',
    },
    {
      title: 'Choose your opponent',
      description:
        'Start with Bella to learn the basics. Coop plays a tougher game, and Bentley thinks many moves ahead.',
      tip: 'Click the opponent chip at the top to switch at any time.',
    },
    {
      title: 'Ready to play',
      description:
        "Control the centre, think ahead, make several threats, and watch your opponent's moves.",
      tip: 'Click "How to play" any time to see this again.',
    },
  ]
}

export function Tutorial({ open, opponentName, onClose, onComplete }: TutorialProps) {
  const tutorialSteps = getSteps(opponentName)
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

        <div className="space-y-4 py-2">
          {step.image && <div className="py-2">{step.image}</div>}

          <p className="text-center text-muted-foreground">{step.description}</p>

          {step.tip && (
            <p className="rounded-md border bg-secondary p-3 text-sm text-muted-foreground">
              {step.tip}
            </p>
          )}

          <div className="flex justify-center gap-2 pt-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="ghost" onClick={handleSkip} className="h-11 sm:w-auto">
            Skip
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="h-11">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="h-11">
              {isLastStep ? 'Play' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
