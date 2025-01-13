import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Zap, User, Calendar, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SearchResultsProps {
  rides: any[];
  showNoResults: boolean;
  nextAvailableDate?: Date;
  onDateChange?: (date: Date) => void;
}

export const SearchResults = ({ rides, showNoResults, nextAvailableDate, onDateChange }: SearchResultsProps) => {
  if (!showNoResults && (!rides || rides.length === 0)) return null;

  if (showNoResults && rides.length === 0 && nextAvailableDate) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-center text-gray-600 mb-4">
            Aucun trajet disponible à cette date. Le prochain trajet disponible est le :
          </p>
          <div className="text-center">
            <Button 
              onClick={() => onDateChange?.(nextAvailableDate)}
              className="bg-ecogreen hover:bg-ecogreen-light"
            >
              Voir les trajets pour le {format(new Date(nextAvailableDate), "d MMMM yyyy", { locale: fr })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {rides.map((ride) => (
        <Card key={ride.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Driver Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <User className="h-6 w-6" />
                </Avatar>
                <div>
                  <p className="font-medium">{ride.profile?.name || "Anonyme"}</p>
                  <div className="flex items-center space-x-2">
                    {ride.is_electric_car && (
                      <div className="flex items-center text-green-600 text-sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Véhicule électrique
                      </div>
                    )}
                    {ride.driver_rating && (
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="h-4 w-4 mr-1" />
                        {ride.driver_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(ride.departure_date), "d MMMM yyyy", { locale: fr })}
                  </span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>
                    {format(new Date(ride.departure_date), "HH:mm")} - {format(new Date(ride.arrival_time), "HH:mm")}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="font-medium">{ride.departure_city}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium">{ride.arrival_city}</span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{ride.price}€</p>
                  <p className="text-sm text-gray-600">{ride.seats_available} place{ride.seats_available > 1 ? 's' : ''} disponible{ride.seats_available > 1 ? 's' : ''}</p>
                </div>
                <Button className="bg-ecogreen hover:bg-ecogreen-light">
                  Détails
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};