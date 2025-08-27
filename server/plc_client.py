import snap7
from snap7.util import get_int, get_real
from typing import Union  # 导入Union类型用于注解

class PLC1500:
    def __init__(self, ip: str, rack: int = 0, slot: int = 1):
        """初始化PLC连接参数"""
        self.plc = snap7.client.Client()
        self.ip = ip
        self.rack = rack
        self.slot = slot
        self.connected = False
        self.DB_AREA = 0x84  # DB块区域固定标识

    def connect(self) -> bool:
        """连接到PLC"""
        try:
            if not self.connected:
                self.plc.connect(self.ip, self.rack, self.slot)
                self.connected = True
                print(f"✅ 成功连接到PLC: {self.ip}:102")
            return True
        except Exception as e:
            self.connected = False
            print(f"❌ PLC连接失败: {str(e)}")
            return False

    def disconnect(self):
        """断开PLC连接"""
        if self.connected:
            self.plc.disconnect()
            self.connected = False
            print("🔌 已断开PLC连接")

    def read_sensor_data(self) -> Union[dict, None]:  # 使用Union替代or
        """读取传感器数据"""
        if not self.connected:
            if not self.connect():
                return None

        try:
            # 读取DB1块，从地址0开始，长度12字节
            raw_data = self.plc.read_area(
                self.DB_AREA,  # DB区域
                1,             # DB块编号
                0,             # 起始地址
                12             # 读取长度
            )

            # 解析数据
            return {
                "发电机温度": get_int(raw_data, 0),
                "发电机转速": get_int(raw_data, 2),
                "齿轮箱温度": round(get_real(raw_data, 4), 1),
                "风速": round(get_real(raw_data, 8), 1)
            }
        except Exception as e:
            print(f"❌ 读取数据失败: {str(e)}")
            self.connected = False
            return None
