import { Navbar } from "@/components/Navbar";
import { SearchForm } from "@/components/SearchForm";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
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
          
          <SearchForm />
        </div>
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