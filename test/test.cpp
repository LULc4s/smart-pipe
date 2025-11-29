#include <Arduino.h>
#include <Wire.h>             
#include <RTClib.h>
#include <WiFi.h>
#include <PubSubClient.h>

// CONFIGURAÇÕES

const char* ssid = ""; //nome_da_rede_wifi
const char* password = ""; //senha_da_rede_wifi

// IP do PC rodando Mosquitto
const char* mqtt_server = "";

WiFiClient espClient;
PubSubClient client(espClient);

// Conecta ao WiFi

void setupWifi() {
  Serial.println("");
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// Reconecta ao broker MQTT

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao Mosquitto... ");

    if (client.connect("ESP32_Client")) {
      Serial.println("Conectado!");

      // Envia "hello world"
      client.publish("test/topic", "hello world");
      Serial.println("hello world enviado!");
    } 
    else {
      Serial.print("Falhou rc=");
      Serial.println(client.state());
      Serial.println("");
      Serial.println("Tentando de novo em 3s...");
      delay(3000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  setupWifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

