import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"Mensagem recebida: {msg.payload.decode()}")

client = mqtt.Client()
client.connect("localhost", 1883, 60)

client.subscribe("teste/topico")
client.on_message = on_message

print("Escutando tópico...")
client.loop_forever()
