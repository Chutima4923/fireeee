from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paho.mqtt.client as mqtt
import json
import time
import base64  # Import base64 for decoding

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key!'
socketio = SocketIO(app)

# MQTT Broker details
broker = "broker.emqx.io"
port = 1883
topic = "KukKukKai/DetectionStatus"
mqtt_client = None

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(topic)
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        socketio.emit('detection_data', payload) # ส่งข้อมูลไปยัง client ผ่าน Socket.IO
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def connect_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port)
    return client

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    mqtt_client = connect_mqtt()
    mqtt_client.loop_start()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)