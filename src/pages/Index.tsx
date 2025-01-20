import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (searchParams: any) => {
    try {
      let query = supabase
        .from('rides')
        .select('*')
        .eq('status', 'pending');

      if (searchParams.departureCity) {
        query = query.ilike('departure_city', `%${searchParams.departureCity}%`);
      }
      if (searchParams.arrivalCity) {
        query = query.ilike('arrival_city', `%${searchParams.arrivalCity}%`);
      }
      if (searchParams.date) {
        const startDate = new Date(searchParams.date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(searchParams.date);
        endDate.setHours(23, 59, 59, 999);
        
        query = query.gte('departure_date', startDate.toISOString())
                    .lte('departure_date', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        toast.error("Une erreur est survenue lors de la recherche");
        setSearchResults([]);
        setShowNoResults(true);
        return;
      }

      setSearchResults(data || []);
      setShowNoResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Une erreur est survenue lors de la recherche");
      setSearchResults([]);
      setShowNoResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-grass-50">
      <Navbar />
      <main>
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-grass-900 sm:text-6xl">
                Covoiturage écologique et économique
              </h1>
              <p className="mt-6 text-lg leading-8 text-grass-700">
                Trouvez des trajets partagés respectueux de l'environnement.
                Voyagez de manière responsable tout en économisant.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  onClick={() => navigate("/rides")}
                  className="bg-grass-600 hover:bg-grass-700 text-white"
                >
                  Voir les trajets disponibles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/how-it-works")}
                  className="border-grass-600 text-grass-700 hover:bg-grass-50"
                >
                  Comment ça marche ?
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-12">
          <SearchForm onSearch={handleSearch} />
          {searchResults && (
            <SearchResults 
              rides={searchResults} 
              showNoResults={showNoResults}
            />
          )}
        </div>

        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;