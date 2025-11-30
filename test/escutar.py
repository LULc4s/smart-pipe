import csv
import paho.mqtt.client as mqtt
from datetime import datetime

BROKER = "localhost"     # ou IP do seu broker
PORT = 1883
TOPIC = "dados/sensor"

CSV_FILE = "dados_recebidos.csv"

try:
    with open(CSV_FILE, "r"):
        pass
except FileNotFoundError:
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "volume_real", "volume_hidrometro", "volume_total"])

def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker com código:", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
 
    partes = payload.split(",")

    timestamp = datetime.now().isoformat()

    linha = [timestamp, partes[0], partes[1], partes[2]]

    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(linha)

    print("Salvo no CSV:", linha)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_forever()
