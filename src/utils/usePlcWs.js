import { ref, onUnmounted } from 'vue';

export function usePlcWs() {
    // 连接状态管理
    const isConnected = ref(false);
    const plcData = ref({});
    const errorMsg = ref('');
    let ws = null;
    let reconnectTimer = null;
    
    // WebSocket服务地址
    const WS_URL = 'ws://127.0.0.1:8081';

    // 初始化连接
    function initWs() {
        if (ws) ws.close();
        
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('[PLC-WS] 连接成功');
            isConnected.value = true;
            errorMsg.value = '';
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                plcData.value = data;
                console.log('[PLC-WS] 接收数据:', data);
            } catch (err) {
                errorMsg.value = '数据解析失败';
                console.error('[PLC-WS] 解析错误:', err);
            }
        };

        ws.onerror = (err) => {
            isConnected.value = false;
            errorMsg.value = '连接错误';
            console.error('[PLC-WS] 错误:', err);
            startReconnect();
        };

        ws.onclose = (event) => {
            isConnected.value = false;
            if (event.wasClean) {
                errorMsg.value = '连接已关闭';
            } else {
                errorMsg.value = '连接断开，正在重试...';
                startReconnect();
            }
        };
    }

    // 重连机制
    function startReconnect() {
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
            console.log('[PLC-WS] 正在重连...');
            initWs();
        }, 3000);
    }

    // 初始化连接
    initWs();

    // 组件销毁时清理
    onUnmounted(() => {
        if (ws) ws.close();
        if (reconnectTimer) clearTimeout(reconnectTimer);
    });

    return { isConnected, plcData, errorMsg };
}
