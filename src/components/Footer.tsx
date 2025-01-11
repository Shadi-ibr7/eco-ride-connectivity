import { Car, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Car className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">EcoRide</span>
            </div>
            <p className="text-gray-400">
              Voyagez de manière écologique et économique grâce au covoiturage.
            </p>
            <div className="mt-4 flex items-center text-gray-400">
              <Mail className="h-5 w-5 mr-2" />
              <a href="mailto:contact@ecoride.fr" className="hover:text-white">
                contact@ecoride.fr
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Aide</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/terms" className="text-gray-400 hover:text-white">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-gray-400 hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/legal/mentions" className="text-gray-400 hover:text-white">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EcoRide. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};