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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X } from "lucide-react";

const formSchema = z.object({
  smoking_allowed: z.boolean(),
  pets_allowed: z.boolean(),
});

export function DriverPreferences() {
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newPreference, setNewPreference] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smoking_allowed: false,
      pets_allowed: false,
    },
  });

  const addCustomPreference = () => {
    if (newPreference.trim()) {
      setCustomPreferences([...customPreferences, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const removeCustomPreference = (index: number) => {
    setCustomPreferences(customPreferences.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Vous devez être connecté pour définir vos préférences");
      return;
    }

    const { error } = await supabase.from("driver_preferences").upsert({
      user_id: session.user.id,
      smoking_allowed: values.smoking_allowed,
      pets_allowed: values.pets_allowed,
      custom_preferences: customPreferences,
    });

    if (error) {
      toast.error("Erreur lors de la sauvegarde des préférences");
      console.error(error);
    } else {
      toast.success("Préférences sauvegardées avec succès");
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="smoking_allowed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Autoriser les fumeurs
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pets_allowed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Autoriser les animaux
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Préférences personnalisées</h4>
            <div className="flex gap-2">
              <Input
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Ajouter une préférence..."
              />
              <Button type="button" onClick={addCustomPreference}>
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {customPreferences.map((pref, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <span>{pref}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomPreference(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sauvegarder les préférences
          </Button>
        </form>
      </Form>
    </div>
  );
}