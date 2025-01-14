import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformCreditsCardProps {
  totalCredits: number;
}

export const PlatformCreditsCard = ({ totalCredits }: PlatformCreditsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total des crédits de la plateforme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalCredits} crédits</div>
      </CardContent>
    </Card>
  );
};