// frontend/src/hooks/useDashboardSocket.ts
// Hook customizado para conectar com Backend via WebSocket

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface DashboardData {
  sensor: {
    currentFlow: number;
    hydroVolume: number;
    dailyVolume: number;
    timestamp: string;
  };
  status: {
    isConnected: boolean;
    lastUpdate: string;
    alerts: Array<{ type: string; message: string; time: string }>;
  };
  history: Array<{ time: string; flow: number }>;
  prediction: number;
}

export const useDashboardSocket = (serverUrl: string = "http://localhost:3000") => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: Socket;

    try {
      socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Conexão estabelecida
      socket.on("connect", () => {
        console.log("✅ Conectado ao servidor WebSocket");
        setIsConnected(true);
        setError(null);
      });

      // Estado inicial
      socket.on("initial:state", (initialData: DashboardData) => {
        console.log("📥 Estado inicial recebido");
        setData(initialData);
      });

      // Atualizações de sensor
      socket.on("sensor:update", (sensorData) => {
        setData((prev) => prev ? { ...prev, sensor: sensorData } : null);
      });

      // Atualizações de histórico
      socket.on("history:update", (history) => {
        setData((prev) => prev ? { ...prev, history } : null);
      });

      // Atualizações de previsão
      socket.on("prediction:update", (pred) => {
        setData((prev) => prev ? { ...prev, prediction: pred.prediction } : null);
      });

      // Atualizações de alertas
      socket.on("alerts:update", (alerts) => {
        setData((prev) => prev ? {
          ...prev,
          status: { ...prev.status, alerts }
        } : null);
      });

      // Status de conexão MQTT
      socket.on("status:connected", (status) => {
        setData((prev) => prev ? {
          ...prev,
          status: { ...prev.status, isConnected: status.isConnected }
        } : null);
      });

      // Erros
      socket.on("connect_error", (error) => {
        console.error("❌ Erro de conexão:", error);
        setError("Erro ao conectar com servidor");
        setIsConnected(false);
      });

      socket.on("disconnect", () => {
        console.warn("⚠️ Desconectado do servidor");
        setIsConnected(false);
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      console.error("❌ Erro ao criar socket:", err);
    }

    // Cleanup
    return () => {
      if (socket) socket.disconnect();
    };
  }, [serverUrl]);

  return { data, isConnected, error };
};
