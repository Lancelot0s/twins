import { nextTick, ref, reactive } from 'vue'
import { forEach, random } from 'lodash-es'
import useThree from './useThree'
import TWEEN from 'three/examples/jsm/libs/tween.module.js'
import * as THREE from 'three'
import WidgetLabel from '@/components/WidgetLabel.vue'

const CONFIG = {
  MODEL_SOURCES: {
    EQUIPMENT: `${import.meta.env.VITE_API_DOMAIN}/models/equipment.glb`,
    PLANE: `${import.meta.env.VITE_API_DOMAIN}/models/plane.glb`,
    SKELETON: `${import.meta.env.VITE_API_DOMAIN}/models/skeleton.glb`,
    DEVICE: `${import.meta.env.VITE_API_DOMAIN}/models/device2.glb`,
  },
  MODEL_SCALES: [0.0001 * 3, 0.0001 * 3, 0.0001 * 3],
  EQUIPMENT_POSITION: {
    变桨系统: {
      LABEL: { x: 0.0291, y: 2.6277, z: 0.2308 },
      COMPOSE: { x: 2519.0795, y: 29288.6777, z: 0 },
      DECOMPOSE: { x: 2519.0795, y: 29000.6777, z: 300 },
    },
    转子: {
      LABEL: { x: 0.0632, y: 2.7692, z: 0.1746 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8850, z: 300 },
    },
    主轴: {
      LABEL: { x: 0.0183, y: 2.6193, z: 0.0815 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8350, z: 200 },
    },
    齿轮箱: {
      LABEL: { x: 0.0319, y: 2.6239, z: -0.0402 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8350, z: 100 },
    },
    油冷装置: {
      LABEL: { x: 0.0364, y: 2.7995, z: 0.0593 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8650, z: 600 },
    },
    偏航电机: {
      LABEL: { x: -0.0122, y: 2.75662, z: -0.0305 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8850, z: 400 },
    },
    风冷装置: {
      LABEL: { x: -0.001, y: 2.7643, z: -0.1305 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8750, z: 300 },
    },
    发电机: {
      LABEL: { x: 0.0047, y: 2.6156, z: -0.2045 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8350, z: 0 },
    },
    控制柜: {
      LABEL: { x: 0.0249, y: 2.7605, z: -0.2521 },
      COMPOSE: { x: 20437.7851, y: 8650, z: 0 },
      DECOMPOSE: { x: 20437.7851, y: 8850, z: 0 },
    },
  },
} as const

// export function useTurbine() {
//   const {
//     container,
//     scene,
//     camera,
//     ocontrol,
//     outlinePass,
//     hexPass,
//     loadGltf,
//     loadAnimationMixer,
//     loadCSS2DByVue,
//     addModelPick,
//     addModelHoverPick,
//     addOutlineEffect,
//     transitionAnimation,
//     planeClippingAnimation,
//   } = useThree()

//   const current = ref('')

//   const isAnimation = ref(false)

//   const labelGroup = new THREE.Group()

//   const models = {
//     equipment: null as any,
//     plane: null as any,
//     skeleton: null as any,
//   }

//   const skeletons = {
//     color: null as any,
//     wireframe: null as any,
//   }

//   const loading = reactive({
//     total: 2, // 全部
//     loaded: 0, // 已加载
//     isLoading: true, // 执行状态
//   })

//   const boostrap = async () => {
//     await loadModels() // 加载风机模型
//     loadLights() // 加载灯光
//     await openingAnimation() // 开场动画

//     addModelPick(models.equipment, (intersects) => {
//       if (intersects.length > 0) {
//         const obj = intersects[0]['object']
//         current.value = obj.name
//         outlinePass.value!.selectedObjects = [obj]
//       } else {
//         current.value = ''
//         outlinePass.value!.selectedObjects = []
//       }
//     })
//     addModelHoverPick(models.equipment, (intersects) => {
//       if (intersects.length > 0) {
//         const obj = intersects[0]['object']
//         hexPass.value!.selectedObjects = [obj]
//       } else {
//         hexPass.value!.selectedObjects = []
//       }
//     })
//   }
//   //加载机架和设备模型
//   const loadModels = async () => {
//     const loadEquipment = async () => {
//       const gltf = await loadGltf(CONFIG.MODEL_SOURCES.EQUIPMENT)
//       const model = gltf.scene
//       model.scale.set(...CONFIG.MODEL_SCALES)
//       models.equipment = model
//       loading.loaded += 1
//       model.name = 'equipment'
//       scene.value!.add(model)
//     }
//     const loadSkeleton = async () => {
//       const gltf = await loadGltf(CONFIG.MODEL_SOURCES.SKELETON)
//       const model = gltf.scene
//       loadAnimationMixer(model, gltf.animations, gltf.animations[0].name)
//       model.scale.set(...CONFIG.MODEL_SCALES)
//       models.skeleton = model
//       loading.loaded += 1
//       model.name = 'skeleton'
//       scene.value!.add(model)
//       skeletons.color = models.skeleton.getObjectByName('颜色材质')
//       skeletons.wireframe = models.skeleton.getObjectByName('线框材质')
//     }
//     await Promise.all([loadEquipment(), loadSkeleton()])
//     loading.isLoading = false
//     loading.loaded = 2
//   }
//   //加载灯光
//   const loadLights = () => {
//     const LIGHT_LIST = [
//       [0, 0, 0],
//       [-100, 100, 100],
//       [100, -100, 100],
//       [100, 100, -100],
//     ]
//     forEach(LIGHT_LIST, ([x, y, z]) => {
//       const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
//       directionalLight.position.set(x, y, z)
//       scene.value?.add(directionalLight)
//     })
//   }

//   //开场动画
//   const openingAnimation = () => {
//     return new Promise((resolve) => {
//       isAnimation.value = true
//       // 风机白色外壳平面削切动画
//       planeClippingAnimation({
//         objects: [skeletons.color!],
//         from: 4,
//         to: 2,
//         during: 1000 * 4,
//         onComplete() {
//           isAnimation.value = false
//           skeletons.color!.visible = false
//         },
//       }).start()
//       // 镜头移动
//       transitionAnimation({
//         from: camera.value!.position,
//         to: { x: 0.5, y: 2.8, z: 0.5 },
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Quintic.InOut,
//         onUpdate: ({ x, y, z }: any) => {
//           camera.value!.position.set(x, y, z)
//           ocontrol.value?.update()
//         },
//         onComplete() {
//           isAnimation.value = false
//           resolve(void 0)
//         },
//       }).start()
//     })
//   }

//   //设备分解动画: 外壳削切 => 设备分离 => 显示标签/摄像头转动
//   const eqDecomposeAnimation = () => {
//     return new Promise((resolve) => {
//       //先确保白色外壳隐藏
//       skeletons.color.visible = false
//       isAnimation.value = true

//       const skeletonAnimate = planeClippingAnimation({
//         objects: [skeletons.wireframe],
//         from: 4,
//         to: 2,
//         during: 1000 * 2,
//         onComplete: () => {
//           skeletons.wireframe.visible = false
//           cameraAnimate.start()
//         },
//       })

//       //可以每个部件创建一个动画，这里为了更好控制进程避免使用settimeout，只使用一个动画(更麻烦)
//       const from: any = {}
//       const to: any = {}

//       forEach(models.equipment.children, (mesh, index) => {
//         const name = mesh.name as keyof typeof CONFIG.EQUIPMENT_POSITION
//         const decompose = CONFIG.EQUIPMENT_POSITION[name]['DECOMPOSE']
//         const compose = CONFIG.EQUIPMENT_POSITION[name]['COMPOSE']
//         from[`x${index}`] = compose.x
//         from[`y${index}`] = compose.y
//         from[`z${index}`] = compose.z
//         to[`x${index}`] = decompose.x
//         to[`y${index}`] = decompose.y
//         to[`z${index}`] = decompose.z
//       })

//       const eqAnimate = transitionAnimation({
//         from,
//         to,
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Quintic.InOut,
//         onUpdate(data) {
//           forEach(models.equipment.children, (mesh, index) => {
//             mesh.position.set(
//               data[`x${index}`],
//               data[`y${index}`],
//               data[`z${index}`]
//             )
//           })
//         },
//         onComplete: () => {
//           isAnimation.value = false
//           createEquipmentLabel()
//           resolve(void 0)
//         },
//       })

//       const cameraAnimate = transitionAnimation({
//         from: camera.value!.position,
//         to: { x: 0.7, y: 2.8, z: 0 },
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Linear.None,
//         onUpdate(data) {
//           camera.value!.position.set(data.x, data.y, data.z)
//           ocontrol.value?.update()
//         },
//       })
//       skeletonAnimate.chain(eqAnimate).start()
//     })
//   }

//   //设备组合动画: 隐藏标签 => 设备组合 => 外壳还原
//   const eqComposeAnimation = () => {
//     return new Promise((resolve) => {
//       isAnimation.value = true
//       removeEquipmentLabel()

//       const cameraAnimate = transitionAnimation({
//         from: camera.value!.position,
//         to: { x: 0.5, y: 2.8, z: 0.5 },
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Linear.None,
//         onUpdate(data) {
//           camera.value!.position.set(data.x, data.y, data.z)
//           ocontrol.value?.update()
//         },
//       })
//       cameraAnimate.start()
//       const from: any = {}
//       const to: any = {}

//       forEach(models.equipment.children, (mesh, index) => {
//         const name = mesh.name as keyof typeof CONFIG.EQUIPMENT_POSITION
//         const decompose = CONFIG.EQUIPMENT_POSITION[name]['DECOMPOSE']
//         const compose = CONFIG.EQUIPMENT_POSITION[name]['COMPOSE']
//         from[`x${index}`] = decompose.x
//         from[`y${index}`] = decompose.y
//         from[`z${index}`] = decompose.z
//         to[`x${index}`] = compose.x
//         to[`y${index}`] = compose.y
//         to[`z${index}`] = compose.z
//       })

//       const eqAnimate = transitionAnimation({
//         from,
//         to,
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Quintic.InOut,
//         onUpdate(data) {
//           forEach(models.equipment.children, (mesh, index) => {
//             mesh.position.set(
//               data[`x${index}`],
//               data[`y${index}`],
//               data[`z${index}`]
//             )
//           })
//         },
//       })
//       skeletons.wireframe.visible = true
//       const skeletonAnimate = planeClippingAnimation({
//         objects: [skeletons.wireframe],
//         from: 2,
//         to: 4,
//         during: 1000 * 2,
//         onComplete: () => {
//           isAnimation.value = false
//           resolve(void 0)
//         },
//       })
//       eqAnimate.chain(skeletonAnimate).start()
//     })
//   }

//   //生成设备标签
//   const createEquipmentLabel = () => {
//     forEach(CONFIG.EQUIPMENT_POSITION, (point, name) => {
//       const label = loadCSS2DByVue(WidgetLabel, { name })
//       label.position.set(point.LABEL.x, point.LABEL.y, point.LABEL.z)
//       labelGroup.add(label)
//     })
//     scene.value!.add(labelGroup)
//   }

//   //移除设备标签
//   const removeEquipmentLabel = () => {
//     while (labelGroup.children.length > 0) {
//       const child: any = labelGroup.children[0]
//       labelGroup.remove(child) //
//       child.geometry && child.geometry.dispose() // 释放几何体资源
//       child.material && child.material.dispose() // 释放材质资源
//     }
//     scene.value!.remove(labelGroup)
//   }

//   const warningTimer = ref()

//   //开始模拟设备告警
//   const startWarning = () => {
//     models.equipment.children.forEach((mesh: any) => {
//       mesh.material = mesh.material.clone()
//       mesh.hex = mesh.material.emissive.getHex()
//     })

//     const handle = () => {
//       const currentIndex = random(0, models.equipment.children.length - 1)
//       const currentName = models.equipment.children[currentIndex].name
//       models.equipment.children.forEach((mesh: any, index: number) => {
//         if (index === currentIndex) {
//           mesh.material.emissive.setHex(0xff0000)
//         } else {
//           mesh.material.emissive.setHex(mesh.hex)
//         }
//       })
//       transitionAnimation({
//         from: camera.value!.position,
//         to: { x: 0.7, y: 2.8, z: 0 },
//         duration: 1000 * 2,
//         easing: TWEEN.Easing.Linear.None,
//         onUpdate(data) {
//           camera.value!.position.set(data.x, data.y, data.z)
//           ocontrol.value?.update()
//         },
//       }).start()
//     }
//     handle()
//     warningTimer.value = setInterval(handle, 1000 * 2)
//   }

//   //结束模拟设备告警
//   const stopWarning = () => {
//     clearInterval(warningTimer.value)
//     models.equipment.children.forEach((mesh: any) => {
//       mesh.material.emissive.setHex(mesh.hex)
//     })

//     transitionAnimation({
//       from: camera.value!.position,
//       to: { x: 0.5, y: 2.8, z: 0.5 },
//       duration: 1000 * 2,
//       easing: TWEEN.Easing.Linear.None,
//       onUpdate(data) {
//         camera.value!.position.set(data.x, data.y, data.z)
//         ocontrol.value?.update()
//       },
//     }).start()
//   }

//   nextTick(async () => {
//     await boostrap()
//   })

//   return {
//     container,
//     loading,
//     current,
//     eqDecomposeAnimation,
//     eqComposeAnimation,
//     startWarning,
//     stopWarning,
//   }
// }
export function useTurbine() {
  const {
    container,
    scene,
    camera,
    ocontrol,
    outlinePass,
    hexPass,
    renderMixins,
    loadGltf,
    loadCSS2DByVue,
    addModelPick,
    addModelHoverPick,
    addOutlineEffect,
    transitionAnimation,    
  } = useThree()

  const current = ref('')
  const isAnimation = ref(false)
  const labelGroup = new THREE.Group()

  // 简化模型存储，只保留设备模型
  const models = {
    device: null as any, // 替换原有equipment和skeleton
  }

  const loading = reactive({
    total: 1, // 只加载一个模型
    loaded: 0,
    isLoading: true,
  })

  const boostrap = async () => {
    await loadModels() // 加载设备模型
    loadLights() // 加载灯光
    setupCamera() // 简化相机位置设置，去掉复杂动画

    // 保留模型选择和悬停效果
    addModelPick(models.device, (intersects) => {
      if (intersects.length > 0) {
        const obj = intersects[0]['object']
        current.value = obj.name
        outlinePass.value!.selectedObjects = [obj]
      } else {
        current.value = ''
        outlinePass.value!.selectedObjects = []
      }
    })
    addModelHoverPick(models.device, (intersects) => {
      if (intersects.length > 0) {
        const obj = intersects[0]['object']
        hexPass.value!.selectedObjects = [obj]
      } else {
        hexPass.value!.selectedObjects = []
      }
    })
  }

  // 简化模型加载，只加载目标模型
  const loadModels = async () => {
  try {
    // 只加载 device.glb 模型
    console.log('模型加载开始')
    const gltf = await loadGltf(CONFIG.MODEL_SOURCES.DEVICE); // 确认路径正确
    const model = gltf.scene;
    console.log('模型加载中')
    model.scale.set(...CONFIG.MODEL_SCALES); // 若没有CONFIG，可直接设置如 model.scale.set(1,1,1)
    // 创建指定颜色的流动纹理
  const createColoredFlowTexture = (color: string) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 200
    canvas.height = 50
    
    // 绘制渐变条纹（根据输入颜色生成）
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, `${color}20`) // 透明度20%
    gradient.addColorStop(0.5, `${color}80`) // 透明度80%
    gradient.addColorStop(1, `${color}20`) // 透明度20%
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(5, 1)
    return texture
  }
  
  // 为三个软管分别创建红、绿、蓝纹理
  const textures = {
    '软管1': createColoredFlowTexture('#ff0000'), // 红色
    '软管2': createColoredFlowTexture('#00ff00'), // 绿色
    '软管3': createColoredFlowTexture('#0000ff')  // 蓝色
  }
  
  // 存储每个软管的偏移量，实现独立动画速度
  const flowOffsets = {
    '软管1': 0,
    '软管2': 0,
    '软管3': 0
  }
  
  // 为指定软管添加流动效果
  model.traverse((child: any) => {
    // 精确匹配三个软管
    if (['软管1', '软管2', '软管3'].includes(child.name)) {
      // 保存原始材质
      child.originalMaterial = child.material
      
      // 应用对应颜色的纹理
      child.material = new THREE.MeshPhysicalMaterial({
        color: child.name === '软管1' ? 0xff0000 : 
               child.name === '软管2' ? 0x00ff00 : 0x0000ff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.6,
        metalness: 0.2,
        map: textures[child.name as keyof typeof textures],
        side: THREE.DoubleSide
      })
      
      // 标记为需要流动动画的对象
      child.userData.hasFlowAnimation = true
    }
  })
  
  // 添加动画更新（不同软管可设置不同速度）
  renderMixins.set('hoseFlow', () => {
    // 红色软管速度
    flowOffsets['软管1'] = (flowOffsets['软管1'] + 0.015) % 1
    textures['软管1'].offset.x = flowOffsets['软管1']
    
    // 绿色软管速度（稍慢）
    flowOffsets['软管2'] = (flowOffsets['软管2'] + 0.01) % 1
    textures['软管2'].offset.x = flowOffsets['软管2']
    
    // 蓝色软管速度（稍快）
    flowOffsets['软管3'] = (flowOffsets['软管3'] + 0.02) % 1
    textures['软管3'].offset.x = flowOffsets['软管3']
  })
  
    models.device = model;
    model.name = 'device';
    scene.value!.add(model);
      
      // 遍历模型子对象，根据名称设置材质
    model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // 外壳：半透明玻璃材质
      if (child.name === '外壳') {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xf0f8ff, // 基础白色
          transparent: true, // 启用透明
          opacity: 0.12, // 透明度（0-1之间）
          roughness: 0.1, // 低粗糙度=高反光
          metalness: 0.2, // 轻微金属感
          side: THREE.DoubleSide, // 双面可见
        });
      }

    }
  });

  scene.value!.add(model);
    // 加载成功后更新loading状态
    loading.loaded += 1;
    loading.isLoading = false;
    console.log('模型加载成功')
  } catch (error) {
    console.error('设备模型加载失败:', error);
    // 加载失败时也更新loading状态，避免一直卡在加载中
    loading.loaded += 1;
    loading.isLoading = false;
    // 可选：显示错误提示
  }
  };

  // 保留灯光设置
  const loadLights = () => {
    const LIGHT_LIST = [
      [0, 0, 0],
      [-100, 100, 100],
      [100, -100, 100],
      [100, 100, -100],
    ]
    LIGHT_LIST.forEach(([x, y, z]) => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
      directionalLight.position.set(x, y, z)
      scene.value?.add(directionalLight)
    })
  }

  // 简化相机设置，直接设置初始位置
  const setupCamera = () => {
    camera.value!.position.set(0.5, 2.8, 0.5)
    ocontrol.value?.update()
  }

  // 移除原有复杂动画，保留必要的标签功能
  const createEquipmentLabel = () => {
    // 如需保留标签功能，可根据新模型调整坐标配置
    // CONFIG.EQUIPMENT_POSITION需对应新模型的标签位置配置
    Object.entries(CONFIG.EQUIPMENT_POSITION).forEach(([name, point]) => {
      const label = loadCSS2DByVue(WidgetLabel, { name })
      label.position.set(point.LABEL.x, point.LABEL.y, point.LABEL.z)
      labelGroup.add(label)
    })
    scene.value!.add(labelGroup)
  }

  const removeEquipmentLabel = () => {
    while (labelGroup.children.length > 0) {
      const child: any = labelGroup.children[0]
      labelGroup.remove(child)
      child.geometry && child.geometry.dispose()
      child.material && child.material.dispose()
    }
    scene.value!.remove(labelGroup)
  }

  // 简化告警功能（可选保留）
  const startWarning = () => {
    // 可根据需要保留或移除
  }

  const stopWarning = () => {
    // 可根据需要保留或移除
  }

  return {
    container,
    loading,
    current,
    boostrap,
    startWarning,
    stopWarning,
    // 移除不需要的动画方法
  }
}

export default useTurbine
