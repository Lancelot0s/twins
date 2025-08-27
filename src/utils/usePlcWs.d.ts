import { Ref } from 'vue';

// PLC数据类型定义
export interface PlcData {
  "发电机温度"?: number;
  "发电机转速"?: number;
  "齿轮箱温度"?: number;
  "风速"?: number;
  timestamp?: number;
  [key: string]: any; // 允许其他扩展字段
}

// WebSocket工具返回类型
export interface PlcWsResult {
  isConnected: Ref<boolean>;
  plcData: Ref<PlcData>;
  errorMsg: Ref<string>;
}

// 导出工具函数类型
export declare function usePlcWs(): PlcWsResult;
