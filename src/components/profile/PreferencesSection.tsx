import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverPreferences } from "@/components/DriverPreferences";
import { VehicleForm } from "@/components/VehicleForm";

interface PreferencesSectionProps {
  isDriver: boolean;
}

export const PreferencesSection = ({ isDriver }: PreferencesSectionProps) => {
  if (!isDriver) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Véhicule</CardTitle>
          <CardDescription>
            Ajoutez les informations de votre véhicule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Définissez vos préférences pour les trajets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverPreferences />
        </CardContent>
      </Card>
    </>
  );
};