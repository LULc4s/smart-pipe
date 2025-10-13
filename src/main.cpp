#include <Arduino.h>


volatile int contPulse = 0;
unsigned long beforeTimer = 0;
const float METRIC_FLOW = 450; 

void IRAM_ATTR inpulse() {
  contPulse++;
}

#include "TensorFlowLite_ESP32.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"

#include "modelo_vazao.h"

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


void setup() {
  Serial.begin(115220);

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
    
    if(countCurrent > 0) {
    float current_flow = ( (float)countCurrent / METRIC_FLOW) * 60.0;
    
    Serial.println("\n-------------------------------------------");
    Serial.print("VAZÃO MEDIDA ATUALMENTE: ");
    Serial.print(current_flow, 2);
    Serial.println(" L/min");

    current_minute++;
    if(current_minute >= 60) {
          current_minute = 0;
          current_hour++;
          if(current_hour >= 24) {
            current_hour = 0;
            current_day = (current_day + 1) % 7;
          }
        }

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
    } else{ 
      Serial.println("SEM vazão! ");
    }
}