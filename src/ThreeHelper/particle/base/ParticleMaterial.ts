/*
 * @Author: smartHome
 * @Date: 2025-11-19
 * @Description: Base Particle Material
 */
import * as THREE from "three";

interface ParticleOptions {
    size?: number;
    additiveBlending?: boolean;
    color?: THREE.ColorRepresentation;
    transparent?: boolean;
    opacity?: number;
}

export class BaseParticle {
    public particle: THREE.Points;
    private material: THREE.PointsMaterial;

    constructor(mesh: THREE.Mesh, options: ParticleOptions = {}) {
        const {
            size = 1,
            additiveBlending = false,
            color = 0xffffff,
            transparent = true,
            opacity = 1,
        } = options;

        // 创建粒子材质
        this.material = new THREE.PointsMaterial({
            size,
            color,
            transparent,
            opacity,
            sizeAttenuation: true,
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
     * 更新粒子大小
     */
    setSize(size: number) {
        this.material.size = size;
        this.material.needsUpdate = true;
    }

    /**
     * 更新粒子颜色
     */
    setColor(color: THREE.ColorRepresentation) {
        this.material.color.set(color);
    }

    /**
     * 更新粒子透明度
     */
    setOpacity(opacity: number) {
        this.material.opacity = opacity;
        this.material.needsUpdate = true;
    }

    /**
     * 销毁粒子系统
     */
    dispose() {
        this.material.dispose();
        this.particle.geometry.dispose();
    }
}
