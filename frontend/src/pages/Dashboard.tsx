import { useState, useEffect } from "react";
import { FlowMonitor } from "@/components/dashboard/FlowMonitor";
import { VolumeStats } from "@/components/dashboard/VolumeStats";
import { SystemAlerts } from "@/components/dashboard/SystemAlerts";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentFlow, setCurrentFlow] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [hydroVolume, setHydroVolume] = useState(0);
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string; time: string }>>([]);
  const [flowHistory, setFlowHistory] = useState<Array<{ time: string; flow: number }>>([]);
  const [prediction, setPrediction] = useState(0);
  const [systemOnline, setSystemOnline] = useState(false);

  // Busca dados da API em tempo real
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard`);
        if (!response.ok) throw new Error("Erro ao conectar com servidor");

        const data = response.json();
        setCurrentFlow(data.sensor.currentFlow);
        setTotalVolume(data.sensor.dailyVolume);
        setHydroVolume(data.sensor.hydroVolume);
        setPrediction(data.prediction);
        setFlowHistory(data.history);
        setAlerts(data.status.alerts);
        setSystemOnline(data.status.isConnected);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setSystemOnline(false);
      }
    };

    // Busca inicial
    fetchData();

    // Atualização em tempo real (a cada 1 segundo)
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

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
              <div className={`h-3 w-3 rounded-full ${systemOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {systemOnline ? "Sistema Online" : "Desconectado"}
              </span>
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
