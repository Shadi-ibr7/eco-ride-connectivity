import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Leaf, Users } from "lucide-react";

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
        date: newDate.toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Search */}
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

      {/* Company Presentation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Bienvenue chez EcoRide
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Votre partenaire de confiance pour des trajets écologiques et économiques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-ecogreen rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Écologique</h3>
              <p className="text-gray-600">
                Réduisez votre empreinte carbone en partageant vos trajets
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-ecogreen rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communautaire</h3>
              <p className="text-gray-600">
                Rejoignez une communauté de conducteurs responsables
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-ecogreen rounded-full flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Économique</h3>
              <p className="text-gray-600">
                Partagez les frais de transport et économisez sur vos déplacements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/photo-1721322800607-8c38375eef04"
                alt="Covoiturage écologique"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Notre Mission
              </h3>
              <p className="text-gray-600">
                Chez EcoRide, nous croyons en un avenir où les déplacements sont plus respectueux de l'environnement. 
                Notre plateforme met en relation des conducteurs et des passagers partageant les mêmes valeurs écologiques.
              </p>
              <p className="text-gray-600">
                En choisissant EcoRide, vous participez activement à la réduction des émissions de CO2 
                tout en profitant d'une solution de transport économique et conviviale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SearchResults 
          rides={rides}
          showNoResults={!!searchParams}
          nextAvailableDate={nextAvailableRide ? new Date(nextAvailableRide.departure_date) : undefined}
          onDateChange={handleDateChange}
        />
      </section>

      <HowItWorks />

      <Footer />
    </div>
  );
};

export default Index;