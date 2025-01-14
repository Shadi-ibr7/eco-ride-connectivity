import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RidesChartProps {
  data: any[];
}

export const RidesChart = ({ data }: RidesChartProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            fill="#3b82f6"
            name="rides"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const chartConfig = {
  rides: {
    label: "Covoiturages",
    theme: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
  },
  credits: {
    label: "Crédits",
    theme: {
      light: "#22c55e",
      dark: "#4ade80",
    },
  },
};