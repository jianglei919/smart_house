/*
 * @Author: smartHome
 * @Date: 2025-11-19
 * @Description: Move Particle Material with shader animation
 */
import * as THREE from "three";

interface ParticleOptions {
    size?: number;
    additiveBlending?: boolean;
    color?: THREE.ColorRepresentation;
    transparent?: boolean;
    opacity?: number;
}

// 顶点着色器
const vertexShader = `
    uniform float uTime;
    uniform float uSize;
    
    attribute vec3 coords;
    attribute float scale;
    
    varying float vScale;
    
    void main() {
        vScale = scale;
        
        // 获取球坐标参数
        float radius = coords.x;
        float phi = coords.y;
        float theta = coords.z + uTime * 0.5;
        
        // 将球坐标转换为笛卡尔坐标
        vec3 pos;
        pos.x = radius * sin(phi) * cos(theta);
        pos.y = radius * cos(phi);
        pos.z = radius * sin(phi) * sin(theta);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // 根据距离调整点的大小
        gl_PointSize = uSize * scale * (300.0 / -mvPosition.z);
    }
`;

// 片元着色器
const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying float vScale;
    
    void main() {
        // 创建圆形粒子
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
            discard;
        }
        
        // 添加柔和的边缘
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        alpha *= uOpacity * (0.5 + vScale * 0.5);
        
        gl_FragColor = vec4(uColor, alpha);
    }
`;

export class MoveParticle {
    public particle: THREE.Points;
    private material: THREE.ShaderMaterial;
    private uniforms: {
        uTime: { value: number };
        uSize: { value: number };
        uColor: { value: THREE.Color };
        uOpacity: { value: number };
    };

    constructor(mesh: THREE.Mesh, options: ParticleOptions = {}) {
        const {
            size = 1,
            additiveBlending = false,
            color = 0xffffff,
            transparent = true,
            opacity = 1,
        } = options;

        // 创建 uniforms
        this.uniforms = {
            uTime: { value: 0 },
            uSize: { value: size },
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: opacity },
        };

        // 创建着色器材质
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent,
            depthWrite: false,
            blending: additiveBlending
                ? THREE.AdditiveBlending
                : THREE.NormalBlending,
        });

        // 创建粒子系统
        this.particle = new THREE.Points(mesh.geometry, this.material);

        // 复制网格的位置、旋转和缩放
        this.particle.position.copy(mesh.position);
        this.particle.rotation.copy(mesh.rotation);
        this.particle.scale.copy(mesh.scale);
    }

    /**
     * 更新时间 uniform，用于动画
     */
    setTime() {
        this.uniforms.uTime.value += 0.01;
    }

    /**
     * 更新粒子大小
     */
    setSize(size: number) {
        this.uniforms.uSize.value = size;
    }

    /**
     * 更新粒子颜色
     */
    setColor(color: THREE.ColorRepresentation) {
        this.uniforms.uColor.value.set(color);
    }

    /**
     * 更新粒子透明度
     */
    setOpacity(opacity: number) {
        this.uniforms.uOpacity.value = opacity;
    }

    /**
     * 获取当前时间值
     */
    getTime(): number {
        return this.uniforms.uTime.value;
    }

    /**
     * 设置时间值
     */
    setTimeValue(time: number) {
        this.uniforms.uTime.value = time;
    }

    /**
     * 销毁粒子系统
     */
    dispose() {
        this.material.dispose();
        this.particle.geometry.dispose();
    }
}
