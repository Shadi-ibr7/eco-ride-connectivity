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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  departure_city: z.string().min(2, "La ville de départ est requise"),
  arrival_city: z.string().min(2, "La ville d'arrivée est requise"),
  departure_date: z.string().min(2, "La date de départ est requise"),
  price: z.string().min(1, "Le prix est requis"),
  seats_available: z.string().min(1, "Le nombre de places est requis"),
  description: z.string().optional(),
});

interface EditRideFormProps {
  ride: {
    id: string;
    departure_city: string;
    arrival_city: string;
    departure_date: string;
    price: number;
    seats_available: number;
    description?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRideForm({ ride, isOpen, onClose, onSuccess }: EditRideFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departure_city: ride.departure_city,
      arrival_city: ride.arrival_city,
      departure_date: new Date(ride.departure_date).toISOString().slice(0, 16),
      price: ride.price.toString(),
      seats_available: ride.seats_available.toString(),
      description: ride.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase
      .from("rides")
      .update({
        departure_city: values.departure_city,
        arrival_city: values.arrival_city,
        departure_date: new Date(values.departure_date).toISOString(),
        price: parseFloat(values.price),
        seats_available: parseInt(values.seats_available),
        description: values.description,
      })
      .eq("id", ride.id);

    if (error) {
      toast.error("Erreur lors de la modification de l'annonce");
      console.error(error);
    } else {
      toast.success("Annonce modifiée avec succès");
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'annonce</DialogTitle>
        </DialogHeader>
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
              Modifier l'annonce
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}