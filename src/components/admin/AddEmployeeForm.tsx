import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void;
}

export const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeePassword, setNewEmployeePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    if (!newEmployeeEmail) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    if (!newEmployeePassword) {
      toast.error("Veuillez entrer un mot de passe temporaire");
      return;
    }

    if (!validatePassword(newEmployeePassword)) {
      return;
    }

    try {
      // First check if the email is already in authorized_employees
      const { data: existingEmployee } = await supabase
        .from("authorized_employees")
        .select("email")
        .eq("email", newEmployeeEmail)
        .single();

      if (existingEmployee) {
        toast.error("Cet employé est déjà autorisé");
        return;
      }

      // Try to sign up the user, but don't error if they already exist
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newEmployeeEmail,
        password: newEmployeePassword,
        options: {
          data: {
            role: 'employee',
            is_temporary_password: true
          }
        }
      });

      // If there's an error that's not "user already exists", throw it
      if (signUpError && !signUpError.message.includes("User already registered")) {
        throw signUpError;
      }

      // Add to authorized_employees
      const { error: insertError } = await supabase
        .from("authorized_employees")
        .insert([{ email: newEmployeeEmail }]);

      if (insertError) throw insertError;

      // If we have a user (either new or existing), update their profile
      if (signUpData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            role: 'employee'
          });

        if (profileError) throw profileError;
      }

      toast.success("Employé autorisé ajouté avec succès");
      setNewEmployeeEmail("");
      setNewEmployeePassword("");
      onEmployeeAdded();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      toast.error(error.message || "Erreur lors de l'ajout de l'employé");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter un employé autorisé</h2>
      <form onSubmit={handleAddEmployee} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email de l'employé"
            value={newEmployeeEmail}
            onChange={(e) => setNewEmployeeEmail(e.target.value)}
            className="w-full"
          />
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
            className="w-full"
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          <p className="text-sm text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule,
            une minuscule, un chiffre et un caractère spécial.
          </p>
        </div>
        <Button type="submit" className="w-full">Ajouter</Button>
      </form>
    </div>
  );
};