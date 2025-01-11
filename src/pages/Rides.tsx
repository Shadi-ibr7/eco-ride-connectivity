import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Rides = () => {
  const [searchParams, setSearchParams] = useState<{
    departure: string;
    destination: string;
    date: string;
  } | null>(null);

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ["rides", searchParams],
    queryFn: async () => {
      if (!searchParams) return [];

      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profile: profiles(name)
        `)
        .eq("departure_city", searchParams.departure)
        .eq("arrival_city", searchParams.destination)
        .gte("departure_date", searchParams.date)
        .lt("departure_date", new Date(new Date(searchParams.date).setDate(new Date(searchParams.date).getDate() + 1)).toISOString())
        .gt("seats_available", 0)
        .order("departure_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchParams,
  });

  const { data: nextAvailableRide } = useQuery({
    queryKey: ["next-available-ride", searchParams?.departure, searchParams?.destination],
    queryFn: async () => {
      if (!searchParams) return null;

      const { data, error } = await supabase
        .from("rides")
        .select("departure_date")
        .eq("departure_city", searchParams.departure)
        .eq("arrival_city", searchParams.destination)
        .gt("seats_available", 0)
        .gt("departure_date", new Date().toISOString())
        .order("departure_date", { ascending: true })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!searchParams && rides.length === 0,
  });

  const handleSearch = (departure: string, destination: string, date: string) => {
    setSearchParams({ departure, destination, date });
  };

  const handleDateChange = (newDate: Date) => {
    if (searchParams) {
      setSearchParams({
        ...searchParams,
        date: newDate.toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-ecogreen to-ecogreen-light py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white mb-8">
              <h1 className="text-3xl font-bold">Trouvez votre covoiturage</h1>
              <p className="mt-2">Recherchez parmi les trajets disponibles</p>
            </div>
            <SearchForm onSearch={handleSearch} />
          </div>
        </section>

        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <SearchResults 
            rides={rides}
            showNoResults={!!searchParams}
            nextAvailableDate={nextAvailableRide ? new Date(nextAvailableRide.departure_date) : undefined}
            onDateChange={handleDateChange}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Rides;