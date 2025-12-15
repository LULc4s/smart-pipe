import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";

interface FlowMonitorProps {
  currentFlow: number;
}

type FlowStatus = "low" | "normal" | "high";

const getFlowStatus = (flow: number): FlowStatus => {
  if (flow < 10) return "low";
  if (flow > 20) return "high";
  return "normal";
};

const statusLabels: Record<FlowStatus, string> = {
  low: "Abaixo do normal",
  normal: "Normal",
  high: "Acima do normal",
};

export const FlowMonitor = ({ currentFlow }: FlowMonitorProps) => {
  const status = getFlowStatus(currentFlow);

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

        {/* Status Indicators */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Status da Vazão</p>
          <div className="flex justify-between gap-2">
            <div 
              className={`flex-1 py-2 rounded text-center text-xs font-medium transition-all ${
                status === "low" 
                  ? "bg-red-500 text-white" 
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              Baixa
            </div>
            <div 
              className={`flex-1 py-2 rounded text-center text-xs font-medium transition-all ${
                status === "normal" 
                  ? "bg-green-500 text-white" 
                  : "bg-green-500/20 text-green-500"
              }`}
            >
              Normal
            </div>
            <div 
              className={`flex-1 py-2 rounded text-center text-xs font-medium transition-all ${
                status === "high" 
                  ? "bg-yellow-500 text-white" 
                  : "bg-yellow-500/20 text-yellow-500"
              }`}
            >
              Alta
            </div>
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {statusLabels[status]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

