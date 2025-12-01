import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface SystemAlertsProps {
  alerts: Array<{ type: string; message: string; time: string }>;
}

export const SystemAlerts = ({ alerts }: SystemAlertsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    return type === "warning" ? "destructive" : "default";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Alertas do Sistema</CardTitle>
        <p className="text-sm text-muted-foreground">Eventos recentes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum alerta no momento</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <Alert key={index} variant={getVariant(alert.type)} className="bg-background">
                <div className="flex items-start gap-2">
                  {getIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-xs">
                      {alert.message}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
