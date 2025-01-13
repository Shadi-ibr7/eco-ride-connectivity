import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function EmployeeLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifier si l'email est autorisé
      const { data: authorizedEmployees, error: authError } = await supabase
        .from("authorized_employees")
        .select("email")
        .eq("email", email)
        .single();

      if (authError || !authorizedEmployees) {
        toast.error("Vous n'êtes pas autorisé à accéder à cette interface");
        setLoading(false);
        return;
      }

      // Procéder à la connexion
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Mettre à jour le rôle de l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: "employee" })
          .eq("id", session.user.id);

        if (updateError) throw updateError;
      }

      navigate("/employee");
      toast.success("Connexion réussie");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
};