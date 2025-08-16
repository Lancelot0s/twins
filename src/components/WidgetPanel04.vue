<template>
  <LayoutPanel>
    <div class="container">
      <div
        class="item"
        v-for="(item, index) in source"
        :key="index"
        :class="{ error: item.status }"
      >
        <div class="icon" :class="item.icon"></div>
        <div class="label">{{ item.label }}</div>
        <div class="key">
          <span class="value">{{ item.value }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
        <i class="alert fa-solid fa-triangle-exclamation"></i>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel} from '@/layout'
import {Random} from 'mockjs'

// 为四个数据项分别设置不同图标
const source = [
  {
    icon: 'fa-solid fa-chart-line', // 折线图图标 - 适合趋势类数据
    label: '数据1',
    value: Random.integer(10, 100),
    unit: '',
    status: Random.pick([true, false]),
  },
  {
    icon: 'fa-solid fa-bar-chart', // 柱状图图标 - 适合对比类数据
    label: '数据2',
    value: Random.integer(10, 100),
    unit: '',
    status: Random.pick([true, false]),
  },
  {
    icon: 'fa-solid fa-database', // 数据库图标 - 适合存储类数据
    label: '数据3',
    value: Random.integer(10, 100),
    unit: '',
    status: Random.pick([true, false]),
  },
  {
    icon: 'fa-solid fa-server', // 服务器图标 - 适合负载类数据
    label: '数据4',
    value: Random.integer(10, 100),
    unit: '',
    status: Random.pick([true, false]),
  },
]
</script>

<style lang="scss" scoped>
// 保持之前调整的尺寸样式不变
$emphasize-color: #74f7fd;
$icon-size: 48px;
$label-font-size: 16px;
$value-font-size: 24px;
$unit-font-size: 16px;
.container {
  box-sizing: border-box;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;
  height: 100%;
  padding: 15px;
  .item {
    position: relative;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: $icon-size auto;
    grid-column-gap: 15px;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 15px;
    overflow: hidden;
    background-color: rgba(93, 101, 122, 20%);
    &.error {
      .icon {
        color: $emphasize-color;
        border: 1px solid $emphasize-color;
        border-radius: 50%;
      }
      .alert {
        color: #74fab022;
      }
      .label,
      .key {
        color: $emphasize-color;
      }
    }
    .icon {
      display: flex;
      grid-row: 1 /3;
      align-items: center;
      justify-content: center;
      width: $icon-size;
      height: $icon-size;
      font-size: 28px; // 图标字体大小
      border: 1px solid #fff;
      border-radius: 50%;
    }
    .label {
      margin-top: 15px;
      font-family: DouyuFont, sans-serif;
      font-size: $label-font-size;
      color: #999;
      text-align: right;
    }
    .key {
      margin-bottom: 10px;
      font-family: SarasaMonoSC, monospace;
      font-size: $unit-font-size;
      color: #fff;
      text-align: right;
      .value {
        margin-right: 8px;
        font-size: $value-font-size;
        font-weight: bold;
      }
      .unit {
        font-size: $unit-font-size;
      }
    }
    .alert {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 0;
      color: #ffffff09;
    }
  }
}
</style>