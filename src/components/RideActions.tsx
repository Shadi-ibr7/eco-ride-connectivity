import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CancelRideDialog } from "./CancelRideDialog";
import { useNavigate } from "react-router-dom";

interface RideActionsProps {
  rideId: string | undefined;
  isDriver: boolean;
  onCancelSuccess?: () => void;
  canBook?: boolean;
  onBookClick?: () => void;
}

export const RideActions = ({
  rideId,
  isDriver,
  onCancelSuccess,
  canBook,
  onBookClick,
}: RideActionsProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-x-4">
      {canBook && (
        <Button
          className="bg-ecogreen hover:bg-ecogreen-light"
          onClick={onBookClick}
        >
          Participer au trajet
        </Button>
      )}
      <Button
        variant="destructive"
        onClick={() => setShowCancelDialog(true)}
      >
        {isDriver ? "Annuler le covoiturage" : "Annuler ma participation"}
      </Button>

      <CancelRideDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        rideId={rideId}
        isDriver={isDriver}
        onSuccess={() => {
          onCancelSuccess?.();
          navigate("/profile");
        }}
      />
    </div>
  );
};