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
    DEVICE: `${import.meta.env.VITE_API_DOMAIN}/models/device3.glb`,
  },
  MODEL_SCALES: [0.0001 * 3, 0.0001 * 3, 0.0001 * 3],
  TEXTURE_SOURCES: {
    SEPARATOR: '/textures/separator_surface.png', 
  }
} as const

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

  const models = {
    device: null as any,
  }

  const loading = reactive({
    total: 1,
    loaded: 0,
    isLoading: true,
  })

  const boostrap = async () => {
    await loadModels()
    loadLights()
    setupCamera()

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

const loadModels = async () => {
  try {
    console.log('模型加载开始')
    const gltf = await loadGltf(CONFIG.MODEL_SOURCES.DEVICE);
    const model = gltf.scene;
    console.log('模型加载中')
    model.scale.set(...CONFIG.MODEL_SCALES);
    
    const textureLoader = new THREE.TextureLoader();

    // 2. 扩展纹理加载：新增分离器贴图（含可选法线贴图）
    const textures = {
      '出水管': await loadTexture(textureLoader, '/textures/red_flow.png', 8),
      '入水管': await loadTexture(textureLoader, '/textures/green_flow.png', 8),
      '出气管': await loadTexture(textureLoader, '/textures/blue_flow.png', 8),
      // 新增：分离器基础贴图（表面纹理）
      'separator': await loadTexture(textureLoader, '/textures/separator_surface.png', 1), // 重复次数设为1（避免纹理拉伸）
    };

    const flowOffsets = {
      '出水管-1': 0, '出水管-2': 0, '出水管-3': 0,
      '入水管-1': 0, '入水管-2': 0, '入水管-3': 0, '入水管-4': 0,
      '出气管-1': 0, '出气管-2': 0, '出气管-3': 0
    };

    // 3. 遍历模型：同时处理管道和分离器
    model.traverse((child: any) => {
      // 3.1 原有管道逻辑（保持不变）
      const pipePattern = /^(出水管|入水管|出气管)-\d+$/;
      if (pipePattern.test(child.name)) {
        child.originalMaterial = child.material;
        const pipeType = child.name.split('-')[0];
        const texture = textures[pipeType as keyof typeof textures];
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
          roughness: 0.4,
          metalness: 0.1,
          map: texture,
          side: THREE.DoubleSide
        });
        child.userData.hasFlowAnimation = true;
      }
    // 匹配需要排除的模型（外壳、内部外壳、管道）
      const isExcluded = 
        child.name === '外壳' || 
        child.name === '内部外壳' || 
        child.name === '分离器' ||
        /^(出水管|入水管|出气管)-\d+$/.test(child.name);

      if (!isExcluded && child instanceof THREE.Mesh) {

        const surfaceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xeeeeee, 
            transparent: false,
            opacity: 1,
            roughness: 0.3,
            metalness: 0.4,         
            clearcoat: 0.2, 
            clearcoatRoughness: 0.1, 
            map: textures.separator, 
            side: THREE.DoubleSide,
          });

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000, // 边缘线颜色，可改为白色等
            wireframe: true, // 关键：开启线框模式
            side: THREE.DoubleSide,
          });

          const group = new THREE.Group();  
          const baseMesh = new THREE.Mesh(child.geometry, surfaceMaterial);// 线框材质模型（展示边缘轮廓）  
          const wireframeMesh = new THREE.Mesh(child.geometry, wireframeMaterial);

          group.add(baseMesh);
          group.add(wireframeMesh);
          // 保持原模型的位置、旋转、缩放等属性
          group.position.copy(child.position);
          group.rotation.copy(child.rotation);
          group.scale.copy(child.scale);
          child.parent?.add(group);
          group.userData.isGeneralSurface = true;
        }
      const isSeparator = child.name === '分离器' || child.name.includes('分离器');
      if (isSeparator && child instanceof THREE.Mesh) {
        // 保存原始材质（便于后续切换或恢复）
        //child.originalMaterial = child.material;

        // 构建分离器材质（带贴图的物理材质，模拟真实表面）
        const separatorMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xeeeeee, // 基础色（与贴图叠加，建议浅灰/白色避免覆盖贴图颜色）
          transparent: false, // 分离器通常不透明，按需调整
          opacity: 1,
          roughness: 0.3, // 低粗糙度=高反光（模拟金属/光滑表面）
          metalness: 0.4, // 金属感（根据贴图类型调整，如塑料设0.2）
          map: textures.separator, // 核心：应用分离器表面贴图
          side: THREE.DoubleSide, // 双面可见（避免内部看不到）
        });

        // 应用材质到分离器
        child.material = separatorMaterial;
        // 标记为分离器（便于后续交互/动画扩展）
        child.userData.isSeparator = true;
      }
      // 3.3 原有外壳逻辑（保持不变）
      if (child instanceof THREE.Mesh) {
        if (child.name === '外壳' || child.name === '内部外壳') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xf0f8ff,
            transparent: true,
            depthWrite: false,
            opacity: 0.1,
            roughness: 0.1,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });
        }
      }
    });

    // 原有管道流动动画（保持不变）
    renderMixins.set('pipeFlow', () => {
      const outletPhase = 0.005;
      flowOffsets['出水管-1'] = (flowOffsets['出水管-1'] + outletPhase) % 1;
      flowOffsets['出水管-2'] = (flowOffsets['出水管-1'] + 0.2) % 1;
      flowOffsets['出水管-3'] = (flowOffsets['出水管-2'] + 0.2) % 1;
      textures['出水管'].offset.x = flowOffsets['出水管-1'];
      textures['出水管'].offset.x = flowOffsets['出水管-2'];
      textures['出水管'].offset.x = flowOffsets['出水管-3'];
      
      const inletPhase = 0.004;
      flowOffsets['入水管-1'] = (flowOffsets['入水管-1'] + inletPhase) % 1;
      flowOffsets['入水管-2'] = (flowOffsets['入水管-1'] + 0.15) % 1;
      flowOffsets['入水管-3'] = (flowOffsets['入水管-2'] + 0.15) % 1;
      flowOffsets['入水管-4'] = (flowOffsets['入水管-3'] + 0.15) % 1;
      textures['入水管'].offset.x = flowOffsets['入水管-1'];
      textures['入水管'].offset.x = flowOffsets['入水管-2'];
      textures['入水管'].offset.x = flowOffsets['入水管-3'];
      textures['入水管'].offset.x = flowOffsets['入水管-4'];
      
      const gasPhase = 0.006;
      flowOffsets['出气管-1'] = (flowOffsets['出气管-1'] + gasPhase) % 1;
      flowOffsets['出气管-2'] = (flowOffsets['出气管-1'] + 0.2) % 1;
      flowOffsets['出气管-3'] = (flowOffsets['出气管-2'] + 0.2) % 1;
      textures['出气管'].offset.x = flowOffsets['出气管-1'];
      textures['出气管'].offset.x = flowOffsets['出气管-2'];
      textures['出气管'].offset.x = flowOffsets['出气管-3'];
    });
    
    models.device = model;
    model.name = 'device';
    scene.value!.add(model);

    loading.loaded += 1;
    loading.isLoading = false;
    console.log('模型加载成功（含分离器贴图）')
  } catch (error) {
    console.error('设备模型加载失败:', error);
    loading.loaded += 1;
    loading.isLoading = false;
  }
};

// 原有纹理加载工具函数（保持不变）
const loadTexture = (
  loader: THREE.TextureLoader, 
  url: string, 
  repeatX: number = 8
): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, 1);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`纹理加载失败 ${url}:`, error);
        reject(error);
      }
    );
  });
};

  // 原有灯光设置（保持不变）
  const loadLights = () => {
    const LIGHT_LIST = [
      [0, 0, 0],
      [-100, 100, 100],
      [100, -100, 100],
      [100, 100, -100],
    ]
    LIGHT_LIST.forEach(([x, y, z]) => {
      const directionalLight = new THREE.DirectionalLight(0xfffccc, 1)
      directionalLight.position.set(x, y, z)
      scene.value?.add(directionalLight)
    })
  }

  // 原有相机设置（保持不变）
  const setupCamera = () => {
    camera.value!.position.set(0.5, 2.8, 0.5)
    ocontrol.value?.update()
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
  }
}

export default useTurbine