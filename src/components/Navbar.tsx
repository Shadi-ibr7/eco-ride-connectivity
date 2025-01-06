import { Button } from "@/components/ui/button";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 text-ecogreen" />
            <span className="ml-2 text-xl font-bold text-ecogreen">EcoRide</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button variant="ghost">Comment ça marche</Button>
            <Button variant="ghost">Proposer un trajet</Button>
            <Button variant="ghost">Rechercher</Button>
            <Button 
              className="bg-ecogreen hover:bg-ecogreen-light"
              onClick={() => navigate("/auth")}
            >
              Connexion
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Button variant="ghost" className="w-full text-left">
              Comment ça marche
            </Button>
            <Button variant="ghost" className="w-full text-left">
              Proposer un trajet
            </Button>
            <Button variant="ghost" className="w-full text-left">
              Rechercher
            </Button>
            <Button 
              className="w-full bg-ecogreen hover:bg-ecogreen-light"
              onClick={() => navigate("/auth")}
            >
              Connexion
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};