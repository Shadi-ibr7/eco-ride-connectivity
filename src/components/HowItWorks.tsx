import { MapPin, Car, Users } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Trouvez votre trajet",
    description: "Indiquez votre point de départ et d'arrivée",
  },
  {
    icon: Car,
    title: "Choisissez votre covoiturage",
    description: "Sélectionnez le trajet qui vous convient le mieux",
  },
  {
    icon: Users,
    title: "Voyagez ensemble",
    description: "Rencontrez votre conducteur et partagez le trajet",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-grass-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-grass-900 mb-12">
          Comment ça marche ?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm"
            >
              <div className="h-12 w-12 bg-grass-600 rounded-full flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-grass-900 mb-2">
                {step.title}
              </h3>
              <p className="text-grass-700">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};