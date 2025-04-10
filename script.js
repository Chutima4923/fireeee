// ตั้งค่า MQTT Broker
const brokerUrl = 'ws://broker.emqx.io:8083/mqtt'; // ใช้ WebSocket สำหรับเว็บเบราว์เซอร์
const topic = 'KukKukKai/DetectionStatus';
let client;

// ฟังก์ชันสำหรับแปลง base64 เป็น URL ของรูปภาพ
function base64ToImageUrl(base64String) {
    return `data:image/jpeg;base64,${base64String}`; // หรือ image/png ขึ้นอยู่กับประเภทภาพ
}

// ฟังก์ชันสำหรับจัดรูปแบบ Timestamp
function formatTimestamp(timestampString) {
    try {
        const date = new Date(timestampString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเริ่มที่ 0
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // กรณี 0 โมงให้แสดงเป็น 12

        return `${month}/${day}/${year}, ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return timestampString; // แสดง timestamp เดิมหากมีข้อผิดพลาด
    }
}

// ฟังก์ชันอัปเดต UI
function updateUI(data) {
    document.getElementById('fire-status').textContent = data.Fire ? 'Fire Detected' : 'No Fire Detected';
    document.getElementById('smoke-status').textContent = data.Smoke ? 'Smoke Detected' : 'No Smoke Detected';
    document.getElementById('timestamp').textContent = formatTimestamp(data.TimeStamp);
    document.getElementById('displayed-image').src = base64ToImageUrl(data.base64);
}

// ตั้งค่าข้อความเริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('smoke-status').textContent = 'Loading...';
    document.getElementById('timestamp').textContent = 'Loading...';
});

// เชื่อมต่อกับ MQTT Broker
function connectMQTT() {
    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        // อาจอัปเดตสถานะ "Connected" บนหน้าเว็บที่นี่
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${topic}`);
            } else {
                console.error('Error subscribing:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        try {
            const payloadString = message.toString();
            const data = JSON.parse(payloadString);
            console.log('Received message:', data);
            updateUI(data);
        } catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    });

    client.on('error', (err) => {
        console.error('MQTT Error:', err);
    });

    client.on('disconnect', () => {
        console.log('Disconnected from MQTT Broker');
        // คุณอาจต้องการให้มีการ reconnect อัตโนมัติที่นี่
        // และอัปเดตสถานะบนหน้าเว็บ
    });
}

// เริ่มการเชื่อมต่อ MQTT เมื่อหน้าเว็บโหลด
window.onload = connectMQTT;
