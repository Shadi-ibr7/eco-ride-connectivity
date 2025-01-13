import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
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

const formSchema = z.object({
  license_plate: z.string().min(1, "La plaque d'immatriculation est requise"),
  first_registration_date: z.string().min(1, "La date de première immatriculation est requise"),
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  color: z.string().min(1, "La couleur est requise"),
  seats: z.string().min(1, "Le nombre de places est requis"),
});

export function VehicleForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      license_plate: "",
      first_registration_date: "",
      brand: "",
      model: "",
      color: "",
      seats: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Vous devez être connecté pour ajouter un véhicule");
      return;
    }

    const { error } = await supabase.from("vehicles").insert({
      license_plate: values.license_plate.toUpperCase(),
      first_registration_date: values.first_registration_date,
      brand: values.brand,
      model: values.model,
      color: values.color,
      seats: parseInt(values.seats),
      user_id: session.user.id,
    });

    if (error) {
      toast.error("Erreur lors de l'ajout du véhicule");
      console.error(error);
    } else {
      toast.success("Véhicule ajouté avec succès");
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plaque d'immatriculation</FormLabel>
              <FormControl>
                <Input placeholder="AB-123-CD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_registration_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de première immatriculation</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marque</FormLabel>
              <FormControl>
                <Input placeholder="Renault" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modèle</FormLabel>
              <FormControl>
                <Input placeholder="Clio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <FormControl>
                <Input placeholder="Rouge" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de places</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Ajouter le véhicule
        </Button>
      </form>
    </Form>
  );
}