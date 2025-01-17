import { Card } from "@/components/ui/card";
import { UserRideCard } from "./UserRideCard";

interface UserRidesProps {
  rides: any[];
  onEdit: (ride: any) => void;
  onDelete: (rideId: string) => void;
}

export const UserRides = ({ rides, onEdit, onDelete }: UserRidesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes Annonces</h2>
        {rides.length === 0 ? (
          <p className="text-muted-foreground">
            Vous n'avez pas encore publié d'annonces.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => (
              <UserRideCard
                key={ride.id}
                ride={ride}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};