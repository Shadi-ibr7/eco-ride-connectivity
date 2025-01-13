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

      // Essayer de se connecter d'abord
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Si la connexion échoue à cause d'identifiants invalides, créer le compte
      if (signInError && signInError.message.includes('Invalid login credentials')) {
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
        
        // Réessayer de se connecter après la création du compte
        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (retrySignInError) throw retrySignInError;
      } else if (signInError) {
        throw signInError;
      }

      // Utiliser upsert pour gérer l'insertion de manière atomique
      const { error: upsertError } = await supabase
        .from('authorized_admins')
        .upsert(
          { email },
          { onConflict: 'email', ignoreDuplicates: true }
        );

      if (upsertError) throw upsertError;

      // Vérifier si le profil existe et a le rôle admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getSession()).data.session?.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        // Si le profil n'existe pas, le créer avec le rôle admin
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: (await supabase.auth.getSession()).data.session?.user.id,
            role: 'admin'
          }]);
        
        if (insertError) throw insertError;
      } else if (profile.role !== 'admin') {
        // Si le profil existe mais n'a pas le rôle admin, le mettre à jour
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', (await supabase.auth.getSession()).data.session?.user.id);
        
        if (updateError) throw updateError;
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