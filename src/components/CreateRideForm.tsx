import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  departure_city: z.string().min(2, "La ville de départ est requise"),
  arrival_city: z.string().min(2, "La ville d'arrivée est requise"),
  departure_date: z.string().min(2, "La date de départ est requise"),
  price: z.string().min(1, "Le prix est requis"),
  seats_available: z.string().min(1, "Le nombre de places est requis"),
  description: z.string().optional(),
  vehicle_id: z.string().min(1, "Un véhicule doit être sélectionné"),
});

export function CreateRideForm() {
  const navigate = useNavigate();

  // Fetch user's vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departure_city: "",
      arrival_city: "",
      departure_date: "",
      price: "",
      seats_available: "",
      description: "",
      vehicle_id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Vous devez être connecté pour publier une annonce");
      navigate("/auth");
      return;
    }

    // Check if user is a driver
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, credits")
      .eq("id", session.user.id)
      .single();

    if (!profile || (profile.role !== "driver" && profile.role !== "both")) {
      toast.error("Vous devez être chauffeur pour publier une annonce");
      return;
    }

    if (profile.credits < 2) {
      toast.error("Vous n'avez pas assez de crédits (2 crédits requis)");
      return;
    }

    // Get selected vehicle details
    const selectedVehicle = vehicles.find(v => v.id === values.vehicle_id);
    if (!selectedVehicle) {
      toast.error("Véhicule non trouvé");
      return;
    }

    // Create the ride
    const { error: rideError } = await supabase.from("rides").insert({
      departure_city: values.departure_city,
      arrival_city: values.arrival_city,
      departure_date: new Date(values.departure_date).toISOString(),
      price: parseFloat(values.price),
      seats_available: parseInt(values.seats_available),
      description: values.description,
      user_id: session.user.id,
      vehicle_brand: selectedVehicle.brand,
      vehicle_model: selectedVehicle.model,
    });

    if (rideError) {
      toast.error("Erreur lors de la publication de l'annonce");
      console.error(rideError);
      return;
    }

    // Deduct platform fee (2 credits)
    const { error: creditError } = await supabase
      .from("profiles")
      .update({ credits: profile.credits - 2 })
      .eq("id", session.user.id);

    if (creditError) {
      toast.error("Erreur lors du prélèvement des crédits");
      console.error(creditError);
      return;
    }

    toast.success("Annonce publiée avec succès");
    navigate("/profile");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vehicle_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Véhicule</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Si vous n'avez pas encore ajouté de véhicule, faites-le depuis votre profil
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>
                2 crédits seront prélevés par la plateforme
              </FormDescription>
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