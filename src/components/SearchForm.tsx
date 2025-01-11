import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search } from "lucide-react";
import { useState } from "react";

interface SearchFormProps {
  onSearch?: (departure: string, destination: string, date: string) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && departure && destination && date) {
      onSearch(departure, destination, date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
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
        <Button type="submit" className="bg-ecogreen hover:bg-ecogreen-light px-8">
          <Search className="mr-2 h-4 w-4" />
          Rechercher
        </Button>
      </div>
    </form>
  );
};