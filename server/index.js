const ModbusRTU = require('modbus-serial');
const WebSocket = require('ws');

// 1. 初始化Modbus-RTU客户端
const client = new ModbusRTU();

// 配置485串口参数（请根据实际情况修改）
const serialConfig = {
  port: 'COM3',       // 串口号，Windows通常是COMx，Linux/Mac是/dev/ttyUSBx
  baudRate: 9600,     // 波特率
  dataBits: 8,        // 数据位
  stopBits: 1,        // 停止位
  parity: 'none'      // 校验位
};

const slaveId = 1;    // 从机地址

// 2. 连接485设备（带详细调试日志）
async function connect485Device() {
  console.log('\n[调试] 开始执行485设备连接流程');
  try {
    // 步骤1: 尝试打开串口
    console.log(`[调试] 尝试打开串口: ${serialConfig.port}`);
    console.log(`[调试] 波特率: ${serialConfig.baudRate}, 数据位: ${serialConfig.dataBits}`);
    
    // 设置连接超时（5秒）
    const connectPromise = client.connectRTU(serialConfig.port, {
      baudRate: serialConfig.baudRate,
      dataBits: serialConfig.dataBits,
      stopBits: serialConfig.stopBits,
      parity: serialConfig.parity
    });
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('串口连接超时（5秒）')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log(`[调试] 串口 ${serialConfig.port} 打开成功`);

    // 步骤2: 设置从机地址
    client.setID(slaveId);
    console.log(`[调试] 已设置从机地址: ${slaveId}`);

    // 步骤3: 验证设备响应
    console.log('[调试] 发送验证指令，检查设备是否响应...');
    const verifyPromise = client.readHoldingRegisters(0, 1);
    const verifyTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('设备响应超时（5秒）')), 5000)
    );
    
    await Promise.race([verifyPromise, verifyTimeout]);
    console.log('[调试] 设备响应验证成功');

    // 连接成功
    console.log(`\n✅ 485设备连接成功！`);
    console.log(`   端口: ${serialConfig.port}`);
    console.log(`   从机地址: ${slaveId}`);
    return true;

  } catch (error) {
    // 详细错误处理
    console.log(`\n[调试] 连接流程出错: ${error.message}`);
    
    if (error.message.includes('Cannot open') || error.message.includes('超时')) {
      console.error(`❌ 串口连接失败: ${serialConfig.port}`);
      console.error(`   可能原因: 端口不存在 / 被占用 / 驱动未安装`);
    } else if (error.message.includes('No response')) {
      console.error(`❌ 设备无响应`);
      console.error(`   可能原因: 设备未上电 / 接线错误 / 从机地址不匹配`);
      // 关闭已打开的空串口
      if (client.isOpen) {
        await client.close().catch(err => console.error('关闭串口失败:', err));
      }
    } else {
      console.error(`❌ 连接错误: ${error.message}`);
    }

    console.log('⏳ 3秒后重试连接...');
    return false;
  }
}

// 3. 创建WebSocket服务
const wss = new WebSocket.Server({ port: 8081 });
console.log('📡 WebSocket服务已启动，端口: 8081');

// 存储连接的客户端
const clients = new Set();

// 处理WebSocket连接
wss.on('connection', (ws) => {
  console.log('🔗 前端客户端已连接');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('🔌 前端客户端已断开');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 4. 读取并发送数据
async function readAndSendData() {
  if (!client.isOpen) {
    console.log('[数据] 等待设备连接，1秒后重试');
    setTimeout(readAndSendData, 1000);
    return;
  }
  
  try {
    // 读取寄存器数据
    console.log('[数据] 读取设备寄存器...');
    const result = await client.readHoldingRegisters(0, 8);
    
    // 解析数据
    const turbineData = {
      timestamp: new Date().toISOString(),
      发电机: {
        温度: result.data[0],
        转速: result.data[1]
      },
      齿轮箱: {
        温度: result.data[2],
        压力: result.data[3]
      },
      变桨系统: {
        角度: result.data[4],
        电压: result.data[5]
      },
      环境: {
        风速: result.data[6] / 10,
        风向: result.data[7]
      }
    };
    
    // 发送给前端
    const dataStr = JSON.stringify(turbineData);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(dataStr);
      }
    });
    
    console.log(`[数据] 已推送 (${new Date().toLocaleTimeString()})`);

  } catch (error) {
    console.error(`[数据] 读取失败: ${error.message}`);
    await client.close().catch(() => {});
    await connect485Device();
  }
  
  setTimeout(readAndSendData, 2000);
}

// 5. 启动服务流程
async function startServer() {
  console.log('[服务] 开始启动服务流程');
  
  // 循环重试连接直到成功
  const connectLoop = async () => {
    const isConnected = await connect485Device();
    if (!isConnected) {
      setTimeout(connectLoop, 3000);
    } else {
      readAndSendData();
    }
  };
  
  connectLoop();
}

// 启动服务
startServer();

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n[服务] 正在关闭...');
  await client.close().catch(err => console.error('关闭串口失败:', err));
  wss.close(() => {
    console.log('[服务] 已完全关闭');
    process.exit(0);
  });
});
