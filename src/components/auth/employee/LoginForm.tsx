import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onLoginSuccess: (password: string, isTemporary: boolean) => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Checking authorization for email:", normalizedEmail);
      
      // First, check if the email exists in authorized_employees
      const { data: employeeData, error: employeeError } = await supabase
        .from("authorized_employees")
        .select("*")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      console.log("Employee data:", employeeData);
      console.log("Employee error:", employeeError);

      if (employeeError) {
        console.error("Error checking employee authorization:", employeeError);
        toast.error("Une erreur est survenue lors de la vérification de l'autorisation");
        setIsLoading(false);
        return;
      }

      if (!employeeData) {
        console.log("Email not authorized:", normalizedEmail);
        toast.error("Cet email n'est pas autorisé à accéder à l'espace employé");
        setIsLoading(false);
        return;
      }

      console.log("Email is authorized, proceeding with login");

      // If email is authorized, proceed with login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError) {
        console.error("Login error:", authError);
        toast.error("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      console.log("Login successful, checking temporary password status");

      // Check if this is a temporary password login
      const isTemporary = authData.user?.user_metadata?.is_temporary_password || false;

      // Update the user's role to 'employee' if not already set
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "employee" })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("Error updating user role:", updateError);
      }

      toast.success("Connexion réussie !");
      
      if (isTemporary) {
        onLoginSuccess(password, true);
      } else {
        navigate("/employee");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast.error("Une erreur inattendue s'est produite");
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