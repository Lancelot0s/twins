<template>
  <div class="layout-header">
    <div class="header-midden">
      <div class="cn">气液分离装置仿真系统</div>
      <div class="en">Gas-Liquid Separation Device Simulation System</div>
    </div>
    <div class="header-left">
      <!-- 吉林大学图标 -->
      <div class="jlu-icon">
        <img src="@/assets/images/jlu-logo.png" alt="吉林大学" />
      </div>
      <div
        class="message"
        content="吉林大学威海仿生研究院"
      ></div>
    </div>
    <div class="header-right">
      <span>{{ state.time }}</span>
      <span>{{ state.date }}</span>
      <span>{{ state.week }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const state = reactive({
  time: '--:--:--',
  date: '--/--/--',
  week: '--',
})

const updateState = () => {
  const today = dayjs()
  state.time = today.format('HH:mm:ss')
  state.date = today.format('MM/DD/YYYY')
  state.week = today.format('dddd')
}

let interval: any

onMounted(() => {
  updateState()
  interval = setInterval(updateState, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
<style lang="scss" scoped>
@mixin font-color() {
  background: linear-gradient(0deg, #b9cfff 0%, #fff 99%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
@keyframes text-roll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
@keyframes light-go {
  from {
    left: 500px;
  }
  to {
    left: 1100px;
    opacity: 0;
  }
}
.layout-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background-image: url(@/assets/images/title_bg.png);
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 100%;
  &::after {
    position: absolute;
    bottom: -55px;
    left: 500px;
    width: 500px;
    height: 100px;
    content: '';
    background-image: url(@/assets/images/light_bg.png);
    background-repeat: no-repeat;
    background-size: contain;
    animation: light-go 3s ease-in-out infinite forwards;
  }
  .header-midden {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow-x: hidden;
    font-family: DouyuFont;
    color: #fff;
    .cn {
      font-size: 30px;
      @include font-color;
    }
    .en {
      position: relative;
      font-size: 10px;
      @include font-color;
    }
  }
  .header-left {
    position: absolute;
    top: 10px;
    left: 30px;
    display: flex;
    gap: 10px; /* 图标和文字间距 */
    align-items: center;
    font-size: 18px;
    color: #fff;
    
    // 吉林大学图标样式
    .jlu-icon {
      width: 50px; /* 根据实际图标大小调整 */
      height: 50px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .message {
      display: flex;
      width: 400px;
      overflow: hidden;
      font-size: 25px;
      &::after {
        width: auto;
        text-wrap: nowrap;
        content: attr(content);
        @include font-color;
      }
    }
  }
  .header-right {
    position: absolute;
    top: 20px;
    right: 30px;
    display: flex;
    gap: 20px;
    font-size: 25px;
    color: #fff;
    span {
      position: relative;
      display: flex;
      align-items: center;
      text-shadow: 0 3px 2px #84a8f663;
      @include font-color;
      &:not(:last-child)::after {
        position: absolute;
        right: -10px;
        width: 2px;
        height: 10px;
        content: '';
        background-color: #fff;
        opacity: 0.2;
      }
    }
  }
}
</style>