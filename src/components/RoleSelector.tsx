import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Car, User, UserRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Role = Database['public']['Enums']['user_role'];

interface RoleSelectorProps {
  currentRole?: Role | null;
  onRoleChange: (role: Role) => void;
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (role: Role) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", (await supabase.auth.getSession()).data.session?.user.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
      console.error(error);
    } else {
      onRoleChange(role);
      toast.success("Rôle mis à jour avec succès");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choisissez votre rôle</h3>
      <ToggleGroup
        type="single"
        value={currentRole || undefined}
        onValueChange={(value: Role) => value && handleRoleChange(value)}
        disabled={loading}
      >
        <ToggleGroupItem value="passenger" aria-label="Passager">
          <User className="h-4 w-4 mr-2" />
          Passager
        </ToggleGroupItem>
        <ToggleGroupItem value="driver" aria-label="Chauffeur">
          <Car className="h-4 w-4 mr-2" />
          Chauffeur
        </ToggleGroupItem>
        <ToggleGroupItem value="both" aria-label="Les deux">
          <UserRound className="h-4 w-4 mr-2" />
          Les deux
        </ToggleGroupItem>
        <ToggleGroupItem value="employee" aria-label="Employé">
          <Shield className="h-4 w-4 mr-2" />
          Employé
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}