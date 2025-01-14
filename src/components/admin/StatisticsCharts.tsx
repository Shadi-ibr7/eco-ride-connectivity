import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RidesChart } from "./RidesChart";
import { CreditsChart } from "./CreditsChart";

interface StatisticsChartsProps {
  ridesData: any[];
  creditsData: any[];
}

export const StatisticsCharts = ({ ridesData, creditsData }: StatisticsChartsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Covoiturages par jour</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <RidesChart data={ridesData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crédits gagnés par jour</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <CreditsChart data={creditsData} />
        </CardContent>
      </Card>
    </div>
  );
};