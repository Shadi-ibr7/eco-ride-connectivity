import { Navbar } from "@/components/Navbar";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Comment ça marche ?</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">1. Inscription</h2>
            <p className="text-gray-600">
              Créez votre compte gratuitement en quelques clics pour commencer à utiliser EcoRide.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">2. Recherchez ou proposez</h2>
            <p className="text-gray-600">
              Trouvez un trajet qui vous convient ou proposez le vôtre pour partager vos frais.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">3. Voyagez ensemble</h2>
            <p className="text-gray-600">
              Rencontrez votre conducteur ou vos passagers et voyagez de manière économique et écologique.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-6">Pourquoi choisir EcoRide ?</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="p-4">
              <h3 className="text-xl font-medium mb-2">Économique</h3>
              <p className="text-gray-600">
                Partagez vos frais de transport et réduisez vos dépenses de voyage.
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-medium mb-2">Écologique</h3>
              <p className="text-gray-600">
                Réduisez votre empreinte carbone en partageant votre trajet.
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-medium mb-2">Communautaire</h3>
              <p className="text-gray-600">
                Rejoignez une communauté de voyageurs partageant les mêmes valeurs.
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-medium mb-2">Simple</h3>
              <p className="text-gray-600">
                Une interface intuitive pour trouver ou proposer un trajet facilement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;