#include <Arduino.h>
#include "TensorFlowLite_ESP32.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include <Wire.h>             
#include <RTClib.h>

#include "modelo_vazao.h"

RTC_DS3231 rtc;

volatile int contPulse = 0;
unsigned long beforeTimer = 0;
unsigned long lastWaterFlow = 0;  // Tempo da última detecção de fluxo
const float METRIC_FLOW = 450;
const unsigned long NO_WATER_THRESHOLD = 60000; // 1 minuto (o ideal seria mais tempo, mas coloquei 1 minuto pra testar) sem fluxo = possível falta de água
bool waterShortageAlerted = false;  // Controle para não repetir alerta

void IRAM_ATTR inpulse() {
  contPulse++;
}

tflite::ErrorReporter* error_reporter = nullptr;
const tflite::Model* model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* input = nullptr;
TfLiteTensor* output = nullptr;

constexpr int kTensorArenaSize = 5 * 1024;
uint8_t tensor_arena[kTensorArenaSize];

const int HISTORY_SIZE = 96; 
float vazao_history[HISTORY_SIZE] = {0.0};
int history_index = 0;

int current_hour = 0;
int current_minute = 0;
int current_day = 0; // 0=Domingo, 1=Segunda, etc.

const float X_min[5] = {0., 0., 0., 0., 0.};
const float X_scale[5] = {0.04347826, 0.16666667, 0.03798632, 0.03798632, 0.03798632};
const float y_min = 0.0;
const float y_scale = 0.03798632;

// Variáveis para simular hidrômetro 
float volume_real = 0.0;      
float volume_hidrometro = 0.0; 
float erro_hidrometro = 0.0;   

void setup() {
  Serial.begin(115200);

  if (!rtc.begin()) {
    Serial.println("ERRO: Não foi possível encontrar o RTC!");
    Serial.println("Verifique a conexão nos pinos SDA(21) e SCL(22).");
    while (1) delay(10); // Trava o código aqui se o RTC falhar
  }
  Serial.println("RTC DS3231 inicializado.");

  pinMode(15, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(15), inpulse, FALLING);
  Serial.println("Sensor de vazão configurado.");

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
  
  Serial.println("Modelo de predição carregado. Sistema pronto!");
}

void loop() {
  if (millis() - beforeTimer >= 1000) {
    
    int countCurrent = 0;
    noInterrupts(); 
    countCurrent = contPulse;
    contPulse = 0;
    interrupts();  

    float current_flow = ((float)countCurrent / METRIC_FLOW) * 60.0; // L/min

    // Verifica se há fluxo de água
    if (current_flow > 0.01) {
        lastWaterFlow = millis();
        waterShortageAlerted = false;  // Reseta o alerta quando detecta fluxo
    } else {
        // Verifica se passou do tempo limite sem fluxo
        if (!waterShortageAlerted && (millis() - lastWaterFlow) > NO_WATER_THRESHOLD) {
            Serial.println("\n!!!ALERTA!!!");
            Serial.println("POSSÍVEL FALTA DE ÁGUA DETECTADA!");
            Serial.println("Nenhum fluxo detectado no último minuto."); // Em um mundo real, seria ideal um tempo maior, como 12 hora
            Serial.println("!!!ALERTA!!!\n");
            waterShortageAlerted = true;  // Evita repetição do alerta
        }
    }

    Serial.println("\n-------------------------------------------");
    Serial.print("VAZÃO MEDIDA ATUALMENTE: ");
    Serial.print(current_flow, 2);
    Serial.println(" L/min");

    // Atualiza volumes 
    if (current_flow > 0.01) {  // considera fluxo mínimo para evitar ruídos
      volume_real += current_flow / 60.0; // L/min -> L/segundo (1s de loop)
      erro_hidrometro = random(-5, 6) / 100.0; // erro ±5%
      volume_hidrometro = volume_real * (1.0 + erro_hidrometro);
    } else {
      volume_real = 0;
      volume_hidrometro = 0;
    }

    // Verifica discrepância entre medidor real e hidrômetro
    float diferenca = fabs(volume_real - volume_hidrometro);
    float porcentagem_dif = (volume_real > 0) ? (diferenca / volume_real) * 100.0 : 0;

    Serial.print("Volume real (sensor): ");
    Serial.print(volume_real, 3);
    Serial.println(" L");

    Serial.print("Volume hidrômetro (simulado): ");
    Serial.print(volume_hidrometro, 3);
    Serial.println(" L");

    Serial.print("Diferença percentual: ");
    Serial.print(porcentagem_dif, 2);
    Serial.println(" %");

    if (porcentagem_dif > 10.0) {
      Serial.println("ALERTA: Medidor da residência pode estar impreciso!");
    } else {
      Serial.println("Hidrômetro condizente com a medição real.");
    }

    // Atualização do histórico para previsão 
    DateTime now = rtc.now();
    current_hour = now.hour();
    current_minute = now.minute();  
    int day_of_week_in_real_time = now.dayOfTheWeek();
    current_day = (day_of_week_in_real_time == 0) ? 6 : day_of_week_in_real_time - 1;   

    float vazao_lag_15m = vazao_history[(history_index - 15 + HISTORY_SIZE) % HISTORY_SIZE];
    float vazao_lag_1h = vazao_history[(history_index - 60 + HISTORY_SIZE) % HISTORY_SIZE];
    float vazao_lag_24h = vazao_history[history_index]; 
    
    float features[5] = {
      (float)current_hour,
      (float)current_day,
      vazao_lag_15m,
      vazao_lag_1h,
      vazao_lag_24h
    };

    for (int i = 0; i < 5; i++) {
        input->data.f[i] = (features[i] - X_min[i]) * X_scale[i];
    }
    
    if (interpreter->Invoke() != kTfLiteOk) {
        error_reporter->Report("A inferência falhou.");
        return;
    }

    float predicted_scaled = output->data.f[0];
    float predicted_real = (predicted_scaled / y_scale) + y_min;

    Serial.print("PREVISÃO PARA O PRÓXIMO PERÍODO: ");
    Serial.print(predicted_real, 2);
    Serial.println(" L/min");
    Serial.println("-------------------------------------------");

    vazao_history[history_index] = current_flow;
    history_index = (history_index + 1) % HISTORY_SIZE; 

    beforeTimer = millis(); 
  }
}
