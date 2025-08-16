<template>
  <Layout :loading="loading">
    <template #left>
      <WidgetPanel04 title="参数监测" />
      <WidgetPanel02 title="气路数据" />
      <!-- <WidgetPanel03 title="日发电量监测 " /> -->
    </template>
    <template #right>
      <WidgetPanel07
        v-show="current"
        :title="current + '详情'"
        :name="current"
      />
      <WidgetPanel06 v-show="!current" title="运行监测" />
      <!-- <WidgetPanel01 title="故障对比" />
      <WidgetPanel05 title="偏航角度监测" /> -->
      <WidgetPanel02 title="进水端数据" />
      <WidgetPanel02 title="出水端数据" />
    </template>
    <template #middle>
      <div style="width: 100%; height: 100%" ref="container"></div>
    </template>
  </Layout>
</template>
<script setup lang="ts">
import { onMounted } from 'vue' // 新增导入
import {
  WidgetPanel01,
  WidgetPanel02,
  WidgetPanel03,
  WidgetPanel04,
  WidgetPanel05,
  WidgetPanel06,
  WidgetPanel07,
} from '@/components'
import { provide } from 'vue'
import { Layout } from '@/layout'
import { useTurbine } from '@/hooks'

const {
  container,
  loading,
  current,
  boostrap, // 从useTurbine获取的初始化函数
} = useTurbine()

// 新增：组件挂载后执行初始化（包括模型加载）
onMounted(() => {
  console.log('App组件挂载，开始执行初始化...') // 新增日志，验证流程是否触发
  boostrap() // 调用初始化函数，启动模型加载
})

provide('events', {
  //eqDecomposeAnimation,
  //eqComposeAnimation,
  //startWarning,
  //stopWarning,
})
</script>
