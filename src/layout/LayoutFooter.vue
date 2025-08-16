<!-- 修改 src/layout/LayoutFooter.vue -->
<template>
  <div class="layout-footer">
    <div class="item" :style="detectionStyle" @click="detectionHandle">
      {{ state.isDetecting ? '关闭检测' : '开始检测' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const state = reactive({
  isDetecting: false, // 检测状态
})

// 检测按钮点击事件
const detectionHandle = () => {
  state.isDetecting = !state.isDetecting
  // 具体检测逻辑待后续实现
  if (state.isDetecting) {
    // 开始检测逻辑
    console.log('开始检测')
  } else {
    // 关闭检测逻辑
    console.log('关闭检测')
  }
}

// 检测按钮样式
const detectionStyle = computed(() => {
  const style: any = {
    cursor: 'pointer'
  }
  
  if (state.isDetecting) {
    style.color = '#5bc7fa' // 激活状态颜色
  } else {
    style.color = '#fff' // 默认状态颜色
  }
  
  return style
})
</script>

<style lang="scss" scoped>
.layout-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  background-image: url('@/assets/images/footer_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    height: 50px;
    font-family: DouyuFont;
    color: #fff;
    cursor: pointer;
    background-image: url('@/assets/images/footer_item_bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}
</style>