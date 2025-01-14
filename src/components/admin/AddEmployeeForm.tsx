import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

const emailSchema = z
  .string()
  .email("Veuillez entrer une adresse email valide")
  .min(1, "L'email est requis");

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void;
}

export const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeePassword, setNewEmployeePassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  };

  const validateEmail = (email: string) => {
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return false;
    }
  };

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const isEmailValid = validateEmail(newEmployeeEmail);
    const isPasswordValid = validatePassword(newEmployeePassword);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Vérifier si l'employé existe déjà
      const { data: existingEmployee } = await supabase
        .from("authorized_employees")
        .select("email")
        .eq("email", newEmployeeEmail)
        .maybeSingle();

      if (existingEmployee) {
        toast.error("Cet employé est déjà autorisé");
        return;
      }

      // Créer le compte utilisateur
      const { error: signUpError } = await supabase.auth.signUp({
        email: newEmployeeEmail,
        password: newEmployeePassword,
        options: {
          data: {
            role: 'employee',
            is_temporary_password: true
          }
        }
      });

      if (signUpError) {
        if (signUpError.message === "User already registered") {
          toast.error("Un compte existe déjà avec cet email");
        } else {
          throw signUpError;
        }
        return;
      }

      // Ajouter aux employés autorisés
      const { error: insertError } = await supabase
        .from("authorized_employees")
        .insert([{ email: newEmployeeEmail }]);

      if (insertError) throw insertError;

      toast.success("Employé ajouté avec succès");
      setNewEmployeeEmail("");
      setNewEmployeePassword("");
      onEmployeeAdded();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      toast.error("Erreur lors de l'ajout de l'employé");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter un employé autorisé</h2>
      <form onSubmit={handleAddEmployee} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email de l'employé"
            value={newEmployeeEmail}
            onChange={(e) => {
              setNewEmployeeEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            className={`w-full ${emailError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {emailError && (
            <p className="text-sm text-red-500">{emailError}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Mot de passe temporaire"
            value={newEmployeePassword}
            onChange={(e) => {
              setNewEmployeePassword(e.target.value);
              validatePassword(e.target.value);
            }}
            className={`w-full ${passwordError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          <p className="text-sm text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule,
            une minuscule, un chiffre et un caractère spécial.
          </p>
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Ajout en cours..." : "Ajouter"}
        </Button>
      </form>
    </div>
  );
};