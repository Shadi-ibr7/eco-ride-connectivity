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

  // Query to fetch all upcoming rides
  const { data: upcomingRides = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["upcoming-rides"],
    queryFn: async () => {
      console.log("Fetching upcoming rides..."); // Debug log
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // First, let's check if we have any rides at all
      const { count: totalRides } = await supabase
        .from("rides")
        .select("*", { count: "exact", head: true });

      console.log("Total rides in database:", totalRides);

      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profile: profiles(name, id)
        `)
        .gte("departure_date", today.toISOString())
        .gt("seats_available", 0)
        .order("departure_date", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching rides:", error);
        throw error;
      }

      console.log("Fetched rides:", data); // Debug log
      console.log("Today's date for comparison:", today.toISOString());
      if (data && data.length === 0) {
        console.log("No rides found matching criteria. Checking conditions:");
        console.log("- Departure date >=", today.toISOString());
        console.log("- Seats available > 0");
      }

      return data || [];
    },
  });

  // Search query
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["rides", searchParams],
    queryFn: async () => {
      if (!searchParams) return [];

      console.log("Searching rides with params:", searchParams); // Debug log

      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profile: profiles(name, id)
        `)
        .eq("departure_city", searchParams.departure)
        .eq("arrival_city", searchParams.destination)
        .gte("departure_date", searchParams.date)
        .lt("departure_date", new Date(new Date(searchParams.date).setDate(new Date(searchParams.date).getDate() + 1)).toISOString())
        .gt("seats_available", 0)
        .order("departure_date", { ascending: true });

      if (error) {
        console.error("Error searching rides:", error);
        throw error;
      }

      console.log("Search results:", data); // Debug log
      return data || [];
    },
    enabled: !!searchParams,
  });

  const { data: nextAvailableRide } = useQuery({
    queryKey: ["next-available-ride", searchParams?.departure, searchParams?.destination],
    queryFn: async () => {
      if (!searchParams) return null;

      console.log("Fetching next available ride..."); // Debug log

      const { data, error } = await supabase
        .from("rides")
        .select("departure_date")
        .eq("departure_city", searchParams.departure)
        .eq("arrival_city", searchParams.destination)
        .gt("seats_available", 0)
        .gt("departure_date", new Date().toISOString())
        .order("departure_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching next available ride:", error);
        return null;
      }

      console.log("Next available ride:", data); // Debug log
      return data;
    },
    enabled: !!searchParams && searchResults.length === 0,
  });

  const handleSearch = (departure: string, destination: string, date: string) => {
    console.log("Search initiated with:", { departure, destination, date }); // Debug log
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
              <h1 className="text-4xl font-bold">Trouvez votre covoiturage</h1>
              <p className="mt-2 text-xl">Recherchez parmi les trajets disponibles</p>
            </div>
            <SearchForm onSearch={handleSearch} />
          </div>
        </section>

        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {isLoadingUpcoming || isLoadingSearch ? (
            <div className="text-center py-8">
              <p>Chargement des trajets...</p>
            </div>
          ) : searchParams ? (
            <SearchResults 
              rides={searchResults}
              showNoResults={!!searchParams}
              nextAvailableDate={nextAvailableRide ? new Date(nextAvailableRide.departure_date) : undefined}
              onDateChange={handleDateChange}
            />
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6">Prochains trajets disponibles</h2>
              <SearchResults 
                rides={upcomingRides}
                showNoResults={false}
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Rides;