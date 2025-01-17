import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  onLogout: () => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  isDriver: boolean;
}

export const UserHeader = ({ onLogout, showForm, setShowForm, isDriver }: UserHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Mon Profil</h1>
      <div className="space-x-4">
        {isDriver && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant="outline"
          >
            {showForm ? "Voir mes annonces" : "Publier une annonce"}
          </Button>
        )}
        <Button onClick={onLogout} variant="outline">
          Déconnexion
        </Button>
      </div>
    </div>
  );
};