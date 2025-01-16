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
import { Loader2 } from "lucide-react";

interface BookRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rideCost: number;
  isLoading?: boolean;
}

export const BookRideDialog = ({ isOpen, onClose, onConfirm, rideCost, isLoading }: BookRideDialogProps) => {
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
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isLoading}
            className="relative"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin absolute left-2" />
            )}
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};