#include <Arduino.h>
#include "TensorFlowLite_ESP32.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include <Wire.h>             
#include <RTClib.h>
#include <WiFi.h>
#include <PubSubClient.h>

#include "modelo_vazao.h"

// --- CONFIGURAÇÕES WIFI E MQTT ---
const char* ssid = "brisa-4067358"; 
const char* password = "tuka6mku"; 
const char* mqtt_server = "192.168.0.3";

// Variavel que eviara os dados do sensor
char msg_dados_sensor[50];   // Buffer da mensagem que será enviada via MQTT

WiFiClient espClient;
PubSubClient client(espClient);

// --- OBJETOS GLOBAIS ---
RTC_DS3231 rtc;

// --- VARIÁVEIS DE FLUXO ---
volatile int contPulse = 0;
unsigned long beforeTimer = 0;
unsigned long lastWaterFlow = 0; 
const float METRIC_FLOW = 450; 
const unsigned long NO_WATER_THRESHOLD = 60000; 
bool waterShortageAlerted = false;  

// --- VARIÁVEIS DO MODELO TFLITE ---
tflite::ErrorReporter* error_reporter = nullptr;
const tflite::Model* model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* input = nullptr;
TfLiteTensor* output = nullptr;

constexpr int kTensorArenaSize = 5 * 1024;
uint8_t tensor_arena[kTensorArenaSize];

// --- NORMALIZAÇÃO (VALORES DO DATASET JÁ INCLUÍDOS) ---
// Baseado nas premissas:
// Hora (0-23), Dia (0-6), Vazão Max (~25 L/min), Volume Max Dia (~9000 L)
// Fórmula: Scale = 1.0 / (Max - Min)

const float X_min[4] =   {0.0, 0.0, 0.0, 0.0}; 

const float X_scale[4] = {
    0.043478,  // Hora: 1/23
    0.166667,  // Dia: 1/6
    0.040000,  // Vazão Atual: 1/25 (Considerando pico máx de 25 L/min)
    0.000111   // Volume Acumulado: 1/9000 (Considerando consumo máx dia de 9000L)
}; 

// Normalização do Alvo (Saída - Vazão Futura)
const float y_min = 0.0;
const float y_scale = 0.040000; // Mesma escala da Vazão Atual

// --- VARIÁVEIS DE ESTADO E ACUMULADORES ---
int current_hour = 0;
int current_minute = 0;
int current_day = 0; 

// Volumes
float volume_acumulado_dia = 0.0; // Zera à meia noite
float volume_total = 0.0;         // Nunca zera

// Simulação Hidrômetro
float volume_hidrometro = 0.0; 
float erro_hidrometro = 0.0;    

// Rastreamento de Menor Vazão
float menorVazaoRegistrada = 9999.0;
int horaMenorVazao = 0;
int minutoMenorVazao = 0;
int diaMenorVazao = 0; 

// Interrupção
void IRAM_ATTR inpulse() {
  contPulse++;
}

// --- FUNÇÕES AUXILIARES ---

void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao Mosquitto... ");
    if (client.connect("ESP32_Client_Vazao")) {
      Serial.println("Conectado!");
      client.publish("status/esp32", "Online e Monitorando");
    } else {
      Serial.print("Falhou rc=");
      Serial.print(client.state());
      Serial.println(" Tentando em 3s...");
      delay(3000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Inicializa Hardware
  if (!rtc.begin()) {
    Serial.println("ERRO: RTC não encontrado!");
    while (1) delay(10); 
  }
  Serial.println("RTC OK.");

  pinMode(15, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(15), inpulse, FALLING);
  Serial.println("Sensor OK.");

  // Inicializa WiFi/MQTT
  setupWifi();
  client.setServer(mqtt_server, 1883);

  // Inicializa TFLite
  static tflite::MicroErrorReporter micro_error_reporter;
  error_reporter = &micro_error_reporter;

  model = tflite::GetModel(modelo_vazao_tflite);
  if (model->version() != TFLITE_SCHEMA_VERSION) {
    error_reporter->Report("Versão do modelo incompatível!");
    return;
  }

  static tflite::AllOpsResolver resolver;
  static tflite::MicroInterpreter static_interpreter(model, resolver, tensor_arena, kTensorArenaSize, error_reporter);
  interpreter = &static_interpreter;

  if (interpreter->AllocateTensors() != kTfLiteOk) {
    error_reporter->Report("Falha ao alocar tensores.");
    return;
  }

  input = interpreter->input(0);
  output = interpreter->output(0);
  
  Serial.println("Modelo (4 inputs) carregado com parametros atualizados. Sistema pronto!");
}

void loop() {
  // Mantém MQTT conectado
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Loop principal de 1 segundo
  if (millis() - beforeTimer >= 1000) {
    
    // 1. ATUALIZAÇÃO DO TEMPO
    DateTime now = rtc.now();
    current_hour = now.hour();
    current_minute = now.minute();
    int day_week = now.dayOfTheWeek(); 
    current_day = (day_week == 0) ? 6 : day_week - 1; // Ajuste 0=Segunda

    // Zera o volume acumulado do dia à meia-noite
    if (current_hour == 0 && current_minute == 0 && now.second() < 2) {
        volume_acumulado_dia = 0.0;
        Serial.println("--- NOVO DIA: Volume Diário Resetado ---");
    }

    // 2. LEITURA DO SENSOR
    int countCurrent = 0;
    noInterrupts(); 
    countCurrent = contPulse;
    contPulse = 0;
    interrupts();    

    // Cálculo da vazão instantânea (L/min)
    float current_flow = ((float)countCurrent / METRIC_FLOW);
    
    // Cálculo do volume passado neste segundo (L)

    // Atualiza acumuladores
    volume_acumulado_dia += current_flow;

    // 3. MONITORAMENTO E ALERTAS
    Serial.println("-------------------------------------------");
    Serial.print("Hora: "); Serial.print(current_hour); Serial.print(":"); Serial.println(current_minute);
    Serial.print("Vazão Instantânea: "); Serial.print(current_flow, 3); Serial.println(" L/min");
    Serial.print("Volume Acumulado Hoje: "); Serial.print(volume_acumulado_dia, 3); Serial.println(" L");

    // Alerta de Falta de Água
    if (current_flow > 0.01) {
        lastWaterFlow = millis();
        waterShortageAlerted = false;
    } else {
        if (!waterShortageAlerted && (millis() - lastWaterFlow) > NO_WATER_THRESHOLD) {
            Serial.println("!!! ALERTA: POSSÍVEL FALTA DE ÁGUA !!!");
            client.publish("alerta/agua", "Falta de agua detectada");
            waterShortageAlerted = true;
        }
    }

    // Registro de Vazão Mínima (ignora zero)
    if (current_flow > 0.01 && current_flow < menorVazaoRegistrada) {
        menorVazaoRegistrada = current_flow;
        horaMenorVazao = current_hour;
        minutoMenorVazao = current_minute;
        diaMenorVazao = current_day;
        
        Serial.println("*** NOVO RECORDE DE VAZÃO MÍNIMA ***");
        Serial.print("Valor: "); Serial.println(menorVazaoRegistrada);
    }

    // Simulação e Comparação de Hidrômetro
    if (current_flow > 0.01) {
        erro_hidrometro = random(-5, 6) / 100.0; 
        volume_hidrometro += current_flow * (1.0 + erro_hidrometro);
    }
    
    // Comparação Volume Real vs Hidrômetro (usando volume total)
    float diferenca = fabs(volume_total - volume_hidrometro);
    float porcentagem_dif = (volume_total > 0) ? (diferenca / volume_total) * 100.0 : 0;
    
    if (porcentagem_dif > 10.0) {
        Serial.println("ALERTA: Divergência alta no hidrômetro!");
    }

    // 4. PREPARAÇÃO PARA REDE NEURAL (TFLITE)
    // O modelo agora espera 4 valores: [Hora, Dia, Vazão Atual, Volume Dia]
    float features[4] = {
      (float)current_hour,
      (float)current_day,
      current_flow,
      volume_acumulado_dia
    };

    // Normalização usando os valores calculados
    for (int i = 0; i < 4; i++) {
        input->data.f[i] = (features[i] - X_min[i]) * X_scale[i];
    }
    
    // 5. INFERÊNCIA (PREVISÃO)
    if (interpreter->Invoke() != kTfLiteOk) {
        error_reporter->Report("A inferência falhou.");
    } else {
        float predicted_scaled = output->data.f[0];
        // Desnormalização da saída
        float predicted_real = (predicted_scaled / y_scale) + y_min;

        Serial.print("PREVISÃO (próx 15m): ");
        Serial.print(predicted_real, 3);
        Serial.println(" L/min");
        
        // Enviar previsão via MQTT
        char msg[10];
        dtostrf(predicted_real, 4, 2, msg);
        client.publish("sensor/previsao", msg);
    }

    Serial.println("-------------------------------------------");
   
    // Testar se ocasiona atraso na próxima leitura do sensor
    // Caso haja incompatibilidade de dados, gerar uma interrupção:
    // Limpa o buffer ANTES de montar a nova mensagem
    //memset(msg_dados_sensor, 0, sizeof(msg_dados_sensor));
    // Monta a mensagem no formato desejado
    snprintf(msg_dados_sensor, sizeof(msg_dados_sensor), "%.3f,%.3f,%.3f", current_flow, volume_hidrometro, volume_acumulado_dia);

    // Publica com QoS 1 (garante entrega ao menos uma vez)
    client.publish("volume_real/volume_hidrometro/volume_acumulado_dia", (uint8_t*)msg_dados_sensor, strlen(msg_dados_sensor), true);  
    
    // Reset do timer do loop
    beforeTimer = millis(); 
  }
}