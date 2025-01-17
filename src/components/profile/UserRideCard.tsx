import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";

interface UserRideCardProps {
  ride: any;
  onEdit: (ride: any) => void;
  onDelete: (rideId: string) => void;
}

export const UserRideCard = ({ ride, onEdit, onDelete }: UserRideCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {ride.departure_city} → {ride.arrival_city}
        </CardTitle>
        <CardDescription>
          {new Date(ride.departure_date).toLocaleString("fr-FR")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Prix: {ride.price}€
          </p>
          <p className="text-muted-foreground">
            Places disponibles: {ride.seats_available}
          </p>
          {ride.description && (
            <p className="text-muted-foreground">
              {ride.description}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => onEdit(ride)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              onClick={() => onDelete(ride.id)}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};