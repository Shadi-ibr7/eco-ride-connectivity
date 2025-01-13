import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rideCost: number;
}

export const BookRideDialog = ({ isOpen, onClose, onConfirm, rideCost }: BookRideDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la réservation</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir réserver ce trajet ? Cette action utilisera {rideCost} crédit{rideCost > 1 ? 's' : ''}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};