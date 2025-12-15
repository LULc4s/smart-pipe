import { useEffect } from "react";
import { useDashboardSocket } from "@/hooks/useDashboardSocket";
import { FlowMonitor } from "@/components/dashboard/FlowMonitor";
import { VolumeStats } from "@/components/dashboard/VolumeStats";
import { SystemAlerts } from "@/components/dashboard/SystemAlerts";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isConnected, error } = useDashboardSocket();

  useEffect(() => {
    if (error) {
      toast({ title: "Erro de conexão", description: String(error) });
    }
  }, [error]);

  const currentFlow = data?.sensor?.currentFlow ?? 0;
  const totalVolume = data?.sensor?.dailyVolume ?? 0;
  const hydroVolume = data?.sensor?.hydroVolume ?? 0;
  const alerts = data?.status?.alerts ?? [];
  const flowHistory = data?.history ?? [];
  const prediction = data?.prediction ?? 0;

  const downloadCSV = () => {
    // Create CSV content
    const headers = ["Horário", "Vazão (L/min)", "Volume Total (L)", "Volume Hidrômetro (L)", "Predição (L/min)"];
    const rows = flowHistory.map((item, index) => [
      item.time,
      item.flow.toFixed(2),
      (totalVolume * (index + 1) / flowHistory.length).toFixed(2),
      (hydroVolume * (index + 1) / flowHistory.length).toFixed(2),
      prediction.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `smart-pipe-dados-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "Os dados foram exportados para CSV com sucesso.",
    });
  };

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
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">{isConnected ? 'Sistema Online' : 'Offline'}</span>
              </div>
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
