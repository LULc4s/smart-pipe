#include <Arduino.h>
#include <Wire.h>             


void setup() {

}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

