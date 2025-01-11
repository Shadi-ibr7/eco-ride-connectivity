import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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
        date: newDate.toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ecogreen to-ecogreen-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Voyagez écologique avec EcoRide
            </h1>
            <p className="text-xl md:text-2xl">
              Trouvez des covoiturages écologiques et économiques
            </p>
          </div>
          
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      {/* Search Results */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SearchResults 
          rides={rides}
          showNoResults={!!searchParams}
          nextAvailableDate={nextAvailableRide?.departure_date}
          onDateChange={handleDateChange}
        />
      </section>

      <HowItWorks />

      {/* Environmental Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Impact environnemental
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Réduction des émissions
              </h3>
              <p className="text-gray-600">
                En partageant votre trajet, vous contribuez à réduire les émissions de CO2.
                Chaque covoiturage permet d'économiser en moyenne 2,5kg de CO2.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Mobilité durable
              </h3>
              <p className="text-gray-600">
                Le covoiturage est une solution de mobilité durable qui permet de réduire
                le nombre de véhicules sur les routes et la pollution atmosphérique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;