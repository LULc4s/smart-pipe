import { useState, useEffect } from "react";
import { FlowMonitor } from "@/components/dashboard/FlowMonitor";
import { VolumeStats } from "@/components/dashboard/VolumeStats";
import { SystemAlerts } from "@/components/dashboard/SystemAlerts";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentFlow, setCurrentFlow] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [hydroVolume, setHydroVolume] = useState(0);
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string; time: string }>>([]);
  const [flowHistory, setFlowHistory] = useState<Array<{ time: string; flow: number }>>([]);
  const [prediction, setPrediction] = useState(0);

  // Simulação de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula variação de vazão (0-30 L/min)
      const newFlow = Math.max(0, 15 + Math.random() * 10 - 5);
      setCurrentFlow(newFlow);

      // Atualiza volume total
      setTotalVolume(prev => prev + (newFlow / 60 / 60)); // L/s para L
      setHydroVolume(prev => prev + (newFlow / 60 / 60) * (1 + (Math.random() - 0.5) * 0.05)); // Simula erro

      // Atualiza histórico
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setFlowHistory(prev => [...prev.slice(-19), { time: timeStr, flow: newFlow }]);

      // Simula predição
      setPrediction(15 + Math.random() * 5);

      // Simula alertas ocasionais
      if (Math.random() < 0.05 && alerts.length < 5) {
        const alertTypes = [
          { type: "warning", message: "Pressão acima do normal detectada" },
          { type: "info", message: "Consumo acima da média para este horário" },
          { type: "success", message: "Sistema operando normalmente" }
        ];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        setAlerts(prev => [{ ...alert, time: timeStr }, ...prev.slice(0, 4)]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alerts.length]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Smart Pipe Dashboard</h1>
                <p className="text-sm text-muted-foreground">Monitoramento em Tempo Real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Sistema Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <FlowMonitor currentFlow={currentFlow} />
          <VolumeStats totalVolume={totalVolume} hydroVolume={hydroVolume} />
          <PredictionCard prediction={prediction} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
            <FlowChart data={flowHistory} />
          </div>
          <SystemAlerts alerts={alerts} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
