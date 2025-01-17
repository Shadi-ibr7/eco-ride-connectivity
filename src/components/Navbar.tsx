import { Button } from "@/components/ui/button";
import { Car, Home, Mail, Menu, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 text-grass-600" />
            <span className="ml-2 text-xl font-bold text-grass-600">EcoRide</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Accueil
            </Button>
            <Button variant="ghost" onClick={() => navigate("/rides")} className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Covoiturages
            </Button>
            <Button variant="ghost" onClick={() => navigate("/contact")} className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact
            </Button>
            <Button 
              className="bg-grass-600 hover:bg-grass-700 text-white flex items-center gap-2"
              onClick={handleAuthClick}
            >
              <Users className="h-5 w-5" />
              Mon Compte
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
            <Button 
              variant="ghost" 
              className="w-full text-left flex items-center gap-2"
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              <Home className="h-5 w-5" />
              Accueil
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-left flex items-center gap-2"
              onClick={() => {
                navigate("/rides");
                setIsMenuOpen(false);
              }}
            >
              <Car className="h-5 w-5" />
              Covoiturages
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-left flex items-center gap-2"
              onClick={() => {
                navigate("/contact");
                setIsMenuOpen(false);
              }}
            >
              <Mail className="h-5 w-5" />
              Contact
            </Button>
            <Button 
              className="w-full bg-grass-600 hover:bg-grass-700 text-white flex items-center gap-2"
              onClick={() => {
                handleAuthClick();
                setIsMenuOpen(false);
              }}
            >
              <Users className="h-5 w-5" />
              Mon Compte
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};