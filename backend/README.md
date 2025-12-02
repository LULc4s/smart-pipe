# Smart Pipe - Backend API

> API Node.js para monitoramento e integração com ESP32 via MQTT

## 🎯 O que é

Backend intermediário que:
- Conecta ao broker MQTT do ESP32
- Recebe dados de vazão em tempo real
- Expõe REST API para o frontend
- Mantém histórico e alertas
- Opcional: WebSocket para atualização em tempo real

## 🚀 Quick Start

### Instalação
```bash
npm install
cp .env.example .env
npm run dev
```

### Esperado
```
✅ Conectado ao broker MQTT
🚀 Servidor rodando em http://localhost:3000
```

## 🔧 Configuração

### .env
```ini
MQTT_BROKER=mqtt://192.168.0.3:1883
API_PORT=3000
NODE_ENV=development
```

## 📡 Endpoints

| Rota | Descrição |
|------|-----------|
| `GET /health` | Health check |
| `GET /api/sensor` | Dados atuais |
| `GET /api/status` | Status + alertas |
| `GET /api/history` | Histórico (20 registros) |
| `GET /api/prediction` | Previsão NN |
| `GET /api/dashboard` | Tudo junto ⭐ |

## 📊 Exemplo de Resposta

```bash
curl http://localhost:3000/api/dashboard
```

```json
{
  "sensor": {
    "currentFlow": 12.45,
    "hydroVolume": 2345.67,
    "dailyVolume": 145.23,
    "timestamp": "2025-12-02T14:30:45Z"
  },
  "status": {
    "isConnected": true,
    "lastUpdate": "2025-12-02T14:30:45Z",
    "alerts": [...]
  },
  "history": [{...}],
  "prediction": 13.45
}
```

## 🔗 MQTT Topics

Backend se inscreve em:
- `volume_real/volume_hidrometro/volume_acumulado_dia` - Dados sensor
- `sensor/previsao` - Previsão da NN
- `alerta/agua` - Alertas de falta de água
- `status/esp32` - Status do sistema

## 🛠️ Desenvolvimento

```bash
npm run dev      # Modo desenvolvimento com recarregamento
npm run build    # Compilar TypeScript
npm start        # Rodar versão compilada
npm run lint     # Verificar código
```

## 🐳 Docker

```bash
docker build -t smart-pipe-backend .
docker run -e MQTT_BROKER=mqtt://mosquitto:1883 -p 3000:3000 smart-pipe-backend
```

## 📚 Stack

- **Framework:** Express.js
- **Linguagem:** TypeScript
- **MQTT:** mqtt.js
- **Servidor:** Node.js 18+

## 🔐 Segurança

⚠️ Antes de produção:
- [ ] Adicionar autenticação
- [ ] HTTPS em produção
- [ ] Validar entrada de dados
- [ ] Rate limiting
- [ ] CORS configurado

## 📞 Integração com Frontend

Frontend consome via:
```bash
const API_URL = "http://localhost:3000"
fetch(`${API_URL}/api/dashboard`)
```

## 🐛 Troubleshooting

**Backend não conecta MQTT?**
```bash
ping 192.168.0.3
mosquitto_sub -h 192.168.0.3 -t "#"
```

**Porta já em uso?**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📝 Licença

MIT
