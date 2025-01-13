import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Vérifier si l'email est admin@gmail.com et le mot de passe est "azerty"
      if (email.toLowerCase() !== 'admin@gmail.com' || password !== 'azerty') {
        toast.error("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Vérifier si le compte existe déjà
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      if (!user) {
        // Si l'utilisateur n'existe pas, on le crée
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });

        if (signUpError) throw signUpError;
        toast.success("Compte administrateur créé avec succès !");
      }

      // Connexion
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getSession()).data.session?.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error("Ce compte n'a pas les droits administrateur");
        return;
      }

      toast.success("Connexion réussie !");
      navigate('/admin');
    } catch (error) {
      console.error("Erreur:", error);
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