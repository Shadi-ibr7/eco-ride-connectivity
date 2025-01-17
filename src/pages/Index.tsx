import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (searchParams: any) => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.rides || []);
      setShowNoResults(true);
    } catch (error) {
      console.error('Search error:', error);
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