/*
 * @Author: smartHome
 * @Date: 2025-10-10 20:17:15
 * @LastEditors: smartHome
 * @LastEditTime: 2025-11-08 18:25:17
 * @Description: SwitchController
 */

import { AnimationMixer, Clock, Color, MeshStandardMaterial, AudioLoader, PositionalAudio, AudioListener } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { controlsPlaneRef } from "./ControlsPlane";
import DBWrapper from "@/src/utils/DBWrapper";
import { DBDevice, DBUserInfo } from "@/pages";

export interface IDevices {
    [uuid: string]: {
        off: (d: number) => void;
        on: (d: number) => void;
        animation?: THREE.AnimationClip;
        running: boolean;
        mixer?: THREE.AnimationMixer;
        action?: THREE.AnimationAction;
        state: "on" | "off";
        target: Object3D;
        bind?: boolean;
        audio?: PositionalAudio;
    };
}

export class SwitchController {
    devices: IDevices = {};
    animations: THREE.AnimationClip[] = [];
    scene?: THREE.Object3D;
    click = new Clock();
    userInfo: DBUserInfo;
    db: any;
    listener?: AudioListener;
    audioLoader = new AudioLoader();
    tvAudioBuffer?: AudioBuffer;

    constructor(listener?: AudioListener) {
        this.listener = listener;
        
        // 预加载电视音频
        if (listener) {
            this.audioLoader.load(
                '/Willow Tree.mp3',
                (buffer) => {
                    this.tvAudioBuffer = buffer;
                    console.log('✅ 音频加载成功');
                    // 音频加载完成后，为所有已存在的TV设备添加音频
                    this.attachAudioToTVs();
                },
                undefined,
                (error) => {
                    console.error('❌ 音频加载失败:', error);
                }
            );
        }
        
        const info = JSON.parse(localStorage.getItem("user") || "{}");
        this.userInfo = info;
        const db = new DBWrapper("smart_house", "1", {
            onupgradeneeded: (e: any) => {
                const db = e.target.result;
                const objStore = db.createObjectStore("user", {
                    autoIncrement: true,
                    keyPath: "id",
                });
                objStore.createIndex("name", "name", { unique: 1 });
            },
        }) as any;
        this.db = db;
        db.open();

        const loop = () => {
            setTimeout(() => {
                this.asyncDevice();
                loop();
            }, 500);
        };
        // loop();
    }

    get(uuid: string) {
        return this.devices[uuid];
    }

    /**
     * 为所有TV设备附加音频
     */
    attachAudioToTVs() {
        if (!this.listener || !this.tvAudioBuffer) return;
        
        Object.entries(this.devices).forEach(([uuid, device]) => {
            const tv = device.target;
            // 检查是否是TV设备且还没有音频
            if (tv.name.includes("电视") && !device.audio) {
                const audio = new PositionalAudio(this.listener!);
                audio.setBuffer(this.tvAudioBuffer!);
                audio.setRefDistance(2);
                audio.setLoop(true);
                audio.setVolume(1);
                audio.setDirectionalCone(180, 230, 0.5);
                tv.add(audio);
                
                // 更新设备的audio字段
                device.audio = audio;
                
                console.log(`音频已附加到 ${tv.name}`);
            }
        });
    }

    addCss2DObject(desc: string, mesh: Object3D) {
        if (mesh.userData.css2DObject) return;
        const div = document.createElement("div");
        div.className = "css2dLabel";
        const dbDevice = this.userInfo[mesh.name];
        div.textContent = `${desc}已为你工作${dbDevice.duration}小时`;
        div.style.fontSize = "12px";
        div.style.backgroundColor = "transparent";
        const css2DObject = new CSS2DObject(div);
        css2DObject.position.set(0, 0, 0);
        mesh.add(css2DObject);
        mesh.userData.css2DObject = css2DObject;
        css2DObject.visible = false;
        //@ts-ignore
        window.asyncDevice = () => this.asyncDevice();
    }

    /**
     * 与数据库中的设备状态同步
     */
    async asyncDevice() {
        const ds = Object.values(this.devices);
        if (!ds.length) return;
        const data = (await this.db.get(
            "user",
            this.userInfo.id
        )) as DBUserInfo;
        let needUpdate = false;
        let ktMesh: Object3D, ldMesh: Object3D, rdMesh: Object3D;
        for (const { target, state, bind } of ds) {
            if (bind) continue;
            const inDB = data[target.name].off;
            if ((state == "off") != inDB) {
                console.log(target.name, "不相同");
                this.toggle(target as Mesh, false);
                needUpdate = true;
            }
            if (target.name == "空调") {
                ktMesh = target;
            }
            if (target.name == "阳台左门") {
                ldMesh = target;
            }
            if (target.name == "阳台右门") {
                rdMesh = target;
            }
        }

        if (data.温度 > 22) {
            //开空调
            const { off } = data["空调"];
            if (off) {
                //@ts-ignore
                this.toggle(ktMesh);
            }
        }
        if (data.湿度 < 45) {
            //开空调
            const { off: 阳台左门 } = data["阳台左门"];
            const { off: 阳台右门 } = data["阳台右门"];
            if (阳台左门) {
                //@ts-ignore
                this.toggle(ldMesh);
            }
            if (阳台右门) {
                //@ts-ignore
                this.toggle(rdMesh);
            }
        }

        if (needUpdate) {
            controlsPlaneRef.current?.setDevices(this.devices);
        }
    }

    append(obj: Object3D) {
        const animation = this.animations.find((a) => a.name == obj.name);
        if (obj.type == "Mesh") {
            const m = obj as Mesh;
            if (m.material.type == "MeshPhysicalMaterial") {
                const material = new MeshStandardMaterial({});
                Object.assign(material, m.material);
                m.material = material;
            }
        }

        if (animation) {
            const mixer = new AnimationMixer(obj);
            const action = mixer.clipAction(animation).play();

            let t = 0;
            const on = (delta: number) => {
                t += delta;
                if (t > animation.duration) {
                    t = animation.duration;
                    this.devices[obj.uuid].running = false;
                } else {
                    mixer.setTime(t);
                }
            };
            const off = (delta: number) => {
                t -= delta;
                if (t < 0) {
                    t = 0;
                    this.devices[obj.uuid].running = false;
                } else {
                    mixer.setTime(t);
                }
            };
            this.addCss2DObject(obj.name, obj);
            this.devices[obj.uuid] = {
                animation,
                running: false,
                state: "off",
                mixer,
                action,
                on,
                off,
                target: obj,
            };
        } else if (obj.userData.light) {
            // obj.userData.light
            const light = this.scene?.getObjectByName(
                obj.userData.light
            ) as THREE.Light;
            if (light) {
                this.addCss2DObject(obj.name, obj);
                light.userData.intensity = light.intensity;
                // 初始化时关闭灯光
                light.intensity = 0;
                // console.log(obj);
                this.devices[obj.uuid] = {
                    target: obj,
                    running: false,
                    state: "off",
                    on: () => {
                        // light.visible = true;
                        light.intensity = light.userData.intensity;
                        this.devices[obj.uuid].running = false;
                    },
                    off: () => {
                        // light.visible = false;
                        light.intensity = 0;
                        this.devices[obj.uuid].running = false;
                    },
                };
            } else console.error(obj, "未找到灯光");
        } else if (obj.userData.bind) {
            // 点击空调外壳或其他部分 都指向空调动画
            const target = this.scene?.getObjectByName(
                obj.userData.bind
            ) as THREE.Light;
            if (target) {
                this.devices[obj.uuid] = {
                    running: false,
                    state: "off",
                    on: () => {
                        this.devices[target.uuid].running = true;
                        this.devices[target.uuid].state =
                            this.devices[target.uuid].state == "off"
                                ? "on"
                                : "off";
                        this.devices[obj.uuid].running = false;
                    },
                    off: () => {
                        this.devices[target.uuid].running = true;
                        this.devices[target.uuid].state =
                            this.devices[target.uuid].state == "off"
                                ? "on"
                                : "off";
                        this.devices[obj.uuid].running = false;
                    },
                    target: target,
                    bind: true,
                };
            }
        } else if (obj.userData.loop) {
            this.addCss2DObject(obj.name, obj);
            this.devices[obj.uuid] = {
                running: false,
                state: "off",
                on: () => {
                    // 持续旋转，不设置 running = false
                    obj.rotation.y += 0.05;
                },
                off: () => {
                    // 停止旋转
                    this.devices[obj.uuid].running = false;
                },
                target: obj,
            };
        } else if (obj.name.includes("Tv")) {
            const tv = obj as Mesh;
            tv.material = tv.material.clone();
            const name = tv.position.z > 0 ? "卧室电视" : "客厅电视";
            tv.name = name;
            this.addCss2DObject(name, tv);
            tv.userData.color = tv.material.color.clone();
            tv.material.color = new Color("#000");
            
            this.devices[tv.uuid] = {
                target: tv,
                running: false,
                state: "off",
                on: () => {
                    tv.material.color.copy(tv.userData.color);
                    tv.material.needsUpdate = true;
                    this.devices[tv.uuid].running = false;
                    
                    // 播放音频
                    const audio = this.devices[tv.uuid].audio;
                    console.log(`📢 ${tv.name} 开启 - 音频存在:`, !!audio, '正在播放:', audio?.isPlaying);
                    if (audio && !audio.isPlaying) {
                        audio.play();
                        console.log('▶️ 开始播放音频');
                    }
                },
                off: () => {
                    tv.material.color.copy(new Color("#000"));
                    tv.material.needsUpdate = true;
                    this.devices[tv.uuid].running = false;
                    
                    // 暂停音频
                    const audio = this.devices[tv.uuid].audio;
                    console.log(`🔇 ${tv.name} 关闭 - 音频存在:`, !!audio, '正在播放:', audio?.isPlaying);
                    if (audio && audio.isPlaying) {
                        audio.pause();
                        console.log('⏸️ 暂停音频');
                    }
                },
            };
        } else {
            // if (obj.type == "Mesh") {
            //     obj.material = new MeshStandardMaterial();
            // }
        }

        if (obj.type == "Mesh") {
            //@ts-ignore
            // obj.material = new MeshStandardMaterial({});
        }
    }

    toggle(mesh: Mesh, upDB = true) {
        const item = this.devices[mesh.uuid];
        if (!item) {
            if (mesh.name.includes("摄像头")) {
                controlsPlaneRef.current?.setIsShowMonitor((p) => !p);
            }
        } else {
            const oldState = item.state;
            item.running = true;
            item.state = item.state == "off" ? "on" : "off";
            console.log(`🔄 切换 ${item.target.name}: ${oldState} → ${item.state}, running: ${item.running}`);
            upDB && this.updateDB(item.target.name);
            controlsPlaneRef.current?.setDevices(this.devices);
        }
    }

    /**
     * 更新数据库
     */
    async updateDB(name: string) {
        const data = await this.db.get("user", this.userInfo.id);
        data[name].off = !data[name].off;
        const res = await this.db.put("user", data);
        console.log(res);
    }

    toggleCss2DObject(uuid: string) {
        const info = this.get(uuid);
        if (!info) return;
        if (!info.target) return console.log("no find target", info);
        const { css2DObject } = info.target.userData as {
            css2DObject: Object3D;
        };
        if (css2DObject) {
            css2DObject.visible = !css2DObject.visible;
        }
    }

    update() {
        const delta = this.click.getDelta();

        Object.values(this.devices).forEach((item) => {
            if (item.running) {
                // 调用对应状态的方法（on 或 off）
                item[item.state](delta);
            }
        });
    }
}
