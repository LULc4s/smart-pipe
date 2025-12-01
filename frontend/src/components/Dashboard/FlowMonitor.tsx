import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";

interface FlowMonitorProps {
  currentFlow: number;
}

export const FlowMonitor = ({ currentFlow }: FlowMonitorProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Vazão Atual</CardTitle>
        <Droplets className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{currentFlow.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground mt-1">Litros por minuto</p>
        <div className="mt-4">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((currentFlow / 30) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0 L/min</span>
            <span>30 L/min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
