import express, { Express, Request, Response } from "express";
import cors from "cors";
import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.API_PORT || 3000;
const mqttBroker = process.env.MQTT_BROKER || "mqtt://192.168.0.6:1883";

// Middleware
app.use(cors());
app.use(express.json());

// ============== TIPOS ==============
interface SensorData {
  currentFlow: number;
  hydroVolume: number;
  dailyVolume: number;
  timestamp: string;
}

interface SystemStatus {
  isConnected: boolean;
  lastUpdate: string;
  alerts: Array<{
    type: string;
    message: string;
    time: string;
  }>;
}

// ============== ESTADO GLOBAL ==============
let sensorData: SensorData = {
  currentFlow: 0,
  hydroVolume: 0,
  dailyVolume: 0,
  timestamp: new Date().toISOString(),
};

let systemStatus: SystemStatus = {
  isConnected: false,
  lastUpdate: new Date().toISOString(),
  alerts: [],
};

let flowHistory: Array<{ time: string; flow: number }> = [];
let prediction: number = 0;

// ============== MQTT CLIENTE ==============
const client = mqtt.connect(mqttBroker, {
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

client.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT");
  systemStatus.isConnected = true;

  // Se inscrever nos tópicos do ESP32
  client.subscribe("volume_real/volume_hidrometro/volume_acumulado_dia", (err) => {
    if (err) console.error("Erro ao se inscrever:", err);
  });

  client.subscribe("sensor/previsao", (err) => {
    if (err) console.error("Erro ao se inscrever:", err);
  });

  client.subscribe("alerta/agua", (err) => {
    if (err) console.error("Erro ao se inscrever:", err);
  });

  client.subscribe("status/esp32", (err) => {
    if (err) console.error("Erro ao se inscrever:", err);
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  console.log(`📨 [${topic}] ${payload}`);

  if (topic === "volume_real/volume_hidrometro/volume_acumulado_dia") {
    // Formato: "vazao_atual,volume_hidrometro,volume_acumulado_dia"
    const [flow, hydro, daily] = payload.split(",").map(Number);
    sensorData = {
      currentFlow: flow || 0,
      hydroVolume: hydro || 0,
      dailyVolume: daily || 0,
      timestamp: now.toISOString(),
    };

    // Atualizar histórico (últimos 20 registros)
    flowHistory = [
      ...flowHistory.slice(-19),
      { time: timeStr, flow: flow || 0 },
    ];

    systemStatus.lastUpdate = now.toISOString();
  }

  if (topic === "sensor/previsao") {
    prediction = parseFloat(payload) || 0;
  }

  if (topic === "alerta/agua") {
    const alert = {
      type: "warning",
      message: "⚠️ " + payload,
      time: timeStr,
    };
    systemStatus.alerts = [alert, ...systemStatus.alerts.slice(0, 4)];
  }

  if (topic === "status/esp32") {
    const alert = {
      type: "info",
      message: "ℹ️ " + payload,
      time: timeStr,
    };
    systemStatus.alerts = [alert, ...systemStatus.alerts.slice(0, 4)];
  }
});

client.on("error", (err) => {
  console.error("❌ Erro MQTT:", err.message);
  systemStatus.isConnected = false;
});

client.on("disconnect", () => {
  console.warn("⚠️ Desconectado do MQTT");
  systemStatus.isConnected = false;
});

// ============== ROTAS API ==============

// GET /api/sensor - Dados do sensor em tempo real
app.get("/api/sensor", (_req: Request, res: Response) => {
  res.json(sensorData);
});

// GET /api/status - Status do sistema
app.get("/api/status", (_req: Request, res: Response) => {
  res.json(systemStatus);
});

// GET /api/history - Histórico de vazão
app.get("/api/history", (_req: Request, res: Response) => {
  res.json(flowHistory);
});

// GET /api/prediction - Previsão atual
app.get("/api/prediction", (_req: Request, res: Response) => {
  res.json({ prediction });
});

// GET /api/dashboard - Dados completos do dashboard
app.get("/api/dashboard", (_req: Request, res: Response) => {
  res.json({
    sensor: sensorData,
    status: systemStatus,
    history: flowHistory,
    prediction,
  });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    mqtt: systemStatus.isConnected,
    timestamp: new Date().toISOString(),
  });
});

// ============== INICIAR SERVIDOR ==============
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📡 MQTT Broker: ${mqttBroker}`);
});
