import asyncio
import json
from websockets import serve
from plc_client import PLC1500
from config import PLC_CONFIG, WS_CONFIG, READ_INTERVAL

# 初始化PLC客户端
plc = PLC1500(
    ip=PLC_CONFIG["ip"],
    rack=PLC_CONFIG["rack"],
    slot=PLC_CONFIG["slot"]
)

async def handle_client(websocket):
    """处理前端WebSocket连接"""
    print(f"🔗 前端已连接: {websocket.remote_address}")
    try:
        while True:
            # 读取PLC数据
            sensor_data = plc.read_sensor_data()
            
            if sensor_data:
                # 添加时间戳
                sensor_data["timestamp"] = asyncio.get_event_loop().time()
                # 推送数据给前端
                await websocket.send(json.dumps(sensor_data, ensure_ascii=False))
                print(f"📤 推送数据: {sensor_data}")
            else:
                print("⚠️ 未获取到数据，跳过推送")
            
            # 等待下一次读取
            await asyncio.sleep(READ_INTERVAL)
    except Exception as e:
        print(f"💥 连接异常: {str(e)}")
    finally:
        print(f"🔌 前端已断开: {websocket.remote_address}")

async def main():
    """启动WebSocket服务"""
    async with serve(handle_client, WS_CONFIG["host"], WS_CONFIG["port"]):
        print(f"📡 WebSocket服务启动: ws://{WS_CONFIG['host']}:{WS_CONFIG['port']}")
        await asyncio.Future()  # 保持服务运行

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 服务已停止")
        plc.disconnect()
