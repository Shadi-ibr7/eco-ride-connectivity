import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  departure_city: z.string().min(2, "La ville de départ est requise"),
  arrival_city: z.string().min(2, "La ville d'arrivée est requise"),
  departure_date: z.string().min(2, "La date de départ est requise"),
  price: z.string().min(1, "Le prix est requis"),
  seats_available: z.string().min(1, "Le nombre de places est requis"),
  description: z.string().optional(),
});

export function CreateRideForm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departure_city: "",
      arrival_city: "",
      departure_date: "",
      price: "",
      seats_available: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Vous devez être connecté pour publier une annonce");
      navigate("/auth");
      return;
    }

    // First, check if the profile exists
    const { data: profile, error: profileQueryError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileQueryError) {
      toast.error("Erreur lors de la vérification du profil");
      console.error(profileQueryError);
      return;
    }

    // If no profile exists, create one
    if (!profile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: session.user.id });

      if (profileError) {
        toast.error("Erreur lors de la création du profil");
        console.error(profileError);
        return;
      }
    }

    // Now create the ride
    const { error } = await supabase.from("rides").insert({
      departure_city: values.departure_city,
      arrival_city: values.arrival_city,
      departure_date: new Date(values.departure_date).toISOString(),
      price: parseFloat(values.price),
      seats_available: parseInt(values.seats_available),
      description: values.description,
      user_id: session.user.id,
    });

    if (error) {
      toast.error("Erreur lors de la publication de l'annonce");
      console.error(error);
    } else {
      toast.success("Annonce publiée avec succès");
      navigate("/profile");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="departure_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville de départ</FormLabel>
              <FormControl>
                <Input placeholder="Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arrival_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville d'arrivée</FormLabel>
              <FormControl>
                <Input placeholder="Lyon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departure_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de départ</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seats_available"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Places disponibles</FormLabel>
              <FormControl>
                <Input type="number" placeholder="3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations supplémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Publier l'annonce
        </Button>
      </form>
    </Form>
  );
}