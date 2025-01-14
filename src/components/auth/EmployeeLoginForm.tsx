import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

export const EmployeeLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    try {
      passwordSchema.parse(password);
      setPasswordError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      }
      return false;
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword === password) {
      toast.error("Le nouveau mot de passe doit être différent de l'ancien mot de passe");
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          is_temporary_password: false
        }
      });

      if (error) throw error;

      toast.success("Mot de passe mis à jour avec succès");
      navigate("/employee", { replace: true });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, check if the email is authorized
      const { data: employee, error: employeeError } = await supabase
        .from("authorized_employees")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (employeeError) {
        throw employeeError;
      }

      if (!employee) {
        toast.error("Email non autorisé");
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

      if (isTemporary) {
        setIsChangingPassword(true);
        toast.info("Vous devez changer votre mot de passe");
        return;
      }

      toast.success("Connexion réussie !");
      navigate("/employee", { replace: true });
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChangingPassword) {
    return (
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {passwordError && (
          <p className="text-sm text-red-500">{passwordError}</p>
        )}
        <p className="text-sm text-gray-500">
          Le mot de passe doit contenir au moins 8 caractères, une majuscule,
          une minuscule, un chiffre et un caractère spécial.
        </p>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </form>
    );
  }

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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
};