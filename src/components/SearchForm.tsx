import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search, Zap, Clock, Star, DollarSign } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SearchFormProps {
  onSearch?: (
    departure: string, 
    destination: string, 
    date: string,
    filters: {
      electricOnly: boolean;
      maxPrice: number | null;
      maxDuration: number | null;
      minRating: number | null;
    }
  ) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  
  // Filter states
  const [electricOnly, setElectricOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && departure && destination && date) {
      onSearch(departure, destination, date, {
        electricOnly,
        maxPrice,
        maxDuration,
        minRating
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Départ"
            className="pl-10"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            required
          />
        </div>
        
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Destination"
            className="pl-10"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="date"
            className="pl-10"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="mr-2"
        >
          {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
        </Button>
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Rechercher
        </Button>
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
          {/* Electric car filter */}
          <div className="flex items-center space-x-2">
            <Switch
              id="electric-mode"
              checked={electricOnly}
              onCheckedChange={setElectricOnly}
            />
            <Label htmlFor="electric-mode" className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Véhicules électriques uniquement
            </Label>
          </div>

          {/* Max price filter */}
          <div className="space-y-2">
            <Label htmlFor="max-price" className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Prix maximum: {maxPrice || "Non défini"}€
            </Label>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder="Prix maximum"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          {/* Max duration filter */}
          <div className="space-y-2">
            <Label htmlFor="max-duration" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Durée maximum: {maxDuration || "Non définie"} minutes
            </Label>
            <Input
              id="max-duration"
              type="number"
              min="0"
              placeholder="Durée maximum (minutes)"
              value={maxDuration || ""}
              onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          {/* Min rating filter */}
          <div className="space-y-2">
            <Label htmlFor="min-rating" className="flex items-center">
              <Star className="mr-2 h-4 w-4 text-yellow-400" />
              Note minimum: {minRating || "Non définie"}/5
            </Label>
            <Slider
              id="min-rating"
              min={0}
              max={5}
              step={0.5}
              value={minRating ? [minRating] : [0]}
              onValueChange={(value) => setMinRating(value[0])}
              className="w-full"
            />
          </div>
        </div>
      )}
    </form>
  );
};