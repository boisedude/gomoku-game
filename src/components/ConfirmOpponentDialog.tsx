/**
 * Confirm switching opponent while a game is in progress.
 * Switching always starts a new game, so the player must agree to abandon this one.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

interface ConfirmOpponentDialogProps {
  open: boolean
  opponentName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmOpponentDialog({
  open,
  opponentName,
  onConfirm,
  onCancel,
}: ConfirmOpponentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={next => !next && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Play {opponentName} instead?</DialogTitle>
          <DialogDescription>
            This ends your current game and starts a new one against {opponentName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button onClick={onCancel} variant="ghost" className="h-11">
            Keep playing
          </Button>
          <Button onClick={onConfirm} className="h-11">
            New game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
