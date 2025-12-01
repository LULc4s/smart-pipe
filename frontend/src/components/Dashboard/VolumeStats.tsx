import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

interface VolumeStatsProps {
  totalVolume: number;
  hydroVolume: number;
}

export const VolumeStats = ({ totalVolume, hydroVolume }: VolumeStatsProps) => {
  const error = ((hydroVolume - totalVolume) / totalVolume) * 100;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Volume Consumido</CardTitle>
        <Gauge className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-foreground">{totalVolume.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Medição Real</p>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-lg font-semibold text-foreground">{hydroVolume.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Hidrômetro</p>
          </div>
          <div className="pt-2 border-t border-border">
            <div className={`text-sm font-medium ${Math.abs(error) > 5 ? 'text-destructive' : 'text-green-600'}`}>
              {error > 0 ? '+' : ''}{error.toFixed(2)}% erro
            </div>
            <p className="text-xs text-muted-foreground">Diferença detectada</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
