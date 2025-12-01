import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PredictionCardProps {
  prediction: number;
}

export const PredictionCard = ({ prediction }: PredictionCardProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Predição IA</CardTitle>
        <TrendingUp className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{prediction.toFixed(1)}</div>
        <p className="text-xs text-muted-foreground mt-1">L/min previsto próxima hora</p>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-foreground font-medium">Modelo TensorFlow Lite</p>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado em 96 leituras históricas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
