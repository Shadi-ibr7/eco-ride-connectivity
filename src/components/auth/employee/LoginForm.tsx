import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoginFormProps {
  onLoginSuccess: (password: string, isTemporary: boolean) => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, check if the email is authorized
      const { data: employee, error: employeeError } = await supabase
        .from("authorized_employees")
        .select("email")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (employeeError) {
        console.error("Error checking employee authorization:", employeeError);
        toast.error("Erreur lors de la vérification de l'autorisation");
        setIsLoading(false);
        return;
      }

      if (!employee) {
        toast.error("Cet email n'est pas autorisé à accéder à l'espace employé");
        setIsLoading(false);
        return;
      }

      // Proceed with login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Email ou mot de passe incorrect");
        } else {
          toast.error("Erreur lors de la connexion");
        }
        console.error("Login error:", error);
        return;
      }

      // Check if this is a temporary password login
      const { data: metadata } = await supabase.auth.getUser();
      const isTemporary = metadata.user?.user_metadata?.is_temporary_password;

      onLoginSuccess(password, isTemporary);
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
};