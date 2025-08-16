<template>
  <LayoutPanel>
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import { LayoutPanel } from '@/layout'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'  // 导入onUnmounted
import { useEcharts } from '@/hooks'

const { container, echarts, setOption } = useEcharts()

// 模拟485通信接收的实时数据
const rawData = ref<number[]>([])
let updateInterval: number | undefined  // 声明定时器变量

// 生成模拟的485原始数据（修正变量命名）
const generate485RawData = () => {
  const count = 50
  return Array.from({ length: count }, (_, i) => {
    const base = 1024  // 基准值
    const fluctuation = Math.sin(i * 0.3) * 100  // 周期性波动（替换"波动"）
    const noise = (Math.random() - 0.5) * 50  // 随机噪声
    return Math.round(base + fluctuation + noise)
  })
}

// 生成图表配置
const generateOptions = (data: number[]) => {
  const xAxisData = data.map((_, index) => index + 1)
  
  return {
    legend: {
      show: true,
      right: 0,
      textStyle: {
        color: '#fff',
      },
      data: ['485原码值']
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000',
      borderColor: '#333',
      textStyle: {
        color: '#fff',
      },
      formatter: '采样点 {b}: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '采样点ID',
      nameTextStyle: {
        color: '#fff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#fff',
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '原码值',
      nameTextStyle: {
        color: '#fff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '485原码值',
        type: 'line',
        symbol: 'circle',
        symbolSize: 5,
        smooth: false,
        lineStyle: {
          normal: {
            width: 2,
            color: 'rgba(0, 254, 169, 1)',
          }
        },
        itemStyle: {
          color: 'rgba(0, 254, 169, 0.8)',
          borderColor: '#fff',
          borderWidth: 1
        },
        data: data.map((value, index) => [xAxisData[index], value])
      }
    ]
  }
}

onMounted(() => {
  nextTick(() => {
    rawData.value = generate485RawData()
    let options = generateOptions(rawData.value)
    setOption(options)

    // 模拟485实时数据更新
    updateInterval = window.setInterval(() => {  // 使用window.setInterval明确类型
      const lastIndex = rawData.value.length
      const base = 1024
      const fluctuation = Math.sin(lastIndex * 0.3) * 100  // 修正命名
      const noise = (Math.random() - 0.5) * 50
      rawData.value.push(Math.round(base + fluctuation + noise))
      
      if (rawData.value.length > 50) {
        rawData.value.shift()
      }
      
      options = generateOptions(rawData.value)
      setOption(options)
    }, 1000)
  })
})

// 修正onUnmounted使用方式（放在setup顶层）
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)  // 清理定时器
  }
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>