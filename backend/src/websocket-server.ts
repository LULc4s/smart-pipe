// backend/src/websocket-server.ts
// Alternativa: WebSocket para atualização em tempo real (mais eficiente que polling)

import express, { Express } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mqtt from "mqtt";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

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
  alerts: Array<{ type: string; message: string; time: string }>;
}

// ============== ESTADO ==============
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

// ============== MQTT CLIENT ==============
const mqttClient = mqtt.connect(mqttBroker, {
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

mqttClient.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT");
  systemStatus.isConnected = true;

  // Broadcast para todos os clientes conectados
  io.emit("status:connected", { isConnected: true });

  mqttClient.subscribe([
    "volume_real/volume_hidrometro/volume_acumulado_dia",
    "sensor/previsao",
    "alerta/agua",
    "status/esp32",
  ]);
});

mqttClient.on("message", (topic, message) => {
  const payload = message.toString();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  console.log(`📨 [${topic}] ${payload}`);

  if (topic === "volume_real/volume_hidrometro/volume_acumulado_dia") {
    const [flow, hydro, daily] = payload.split(",").map(Number);
    sensorData = {
      currentFlow: flow || 0,
      hydroVolume: hydro || 0,
      dailyVolume: daily || 0,
      timestamp: now.toISOString(),
    };

    flowHistory = [...flowHistory.slice(-19), { time: timeStr, flow: flow || 0 }];
    systemStatus.lastUpdate = now.toISOString();

    // Emit em tempo real via WebSocket
    io.emit("sensor:update", sensorData);
    io.emit("history:update", flowHistory);
  }

  if (topic === "sensor/previsao") {
    prediction = parseFloat(payload) || 0;
    io.emit("prediction:update", { prediction });
  }

  if (topic === "alerta/agua") {
    const alert = { type: "warning", message: "⚠️ " + payload, time: timeStr };
    systemStatus.alerts = [alert, ...systemStatus.alerts.slice(0, 4)];
    io.emit("alerts:update", systemStatus.alerts);
  }

  if (topic === "status/esp32") {
    const alert = { type: "info", message: "ℹ️ " + payload, time: timeStr };
    systemStatus.alerts = [alert, ...systemStatus.alerts.slice(0, 4)];
    io.emit("alerts:update", systemStatus.alerts);
  }
});

mqttClient.on("error", (err) => {
  console.error("❌ Erro MQTT:", err.message);
  systemStatus.isConnected = false;
  io.emit("status:connected", { isConnected: false });
});

// ============== SOCKET.IO EVENTS ==============
io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  // Enviar estado inicial
  socket.emit("initial:state", {
    sensor: sensorData,
    status: systemStatus,
    history: flowHistory,
    prediction,
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// ============== REST API (Fallback) ==============
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mqtt: systemStatus.isConnected,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", (_req, res) => {
  res.json({ sensor: sensorData, status: systemStatus, history: flowHistory, prediction });
});

// ============== INICIAR ==============
httpServer.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📡 MQTT Broker: ${mqttBroker}`);
  console.log(`🔌 WebSocket pronto para conexões`);
});
