import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("localhost", 1883, 60)

client.publish("teste/topico", "Olá, mundo!")
client.disconnect()

print("Mensagem enviada.")
