/*
 * @Author: smartHome
 * @Date: 2025-10-24 16:27:22
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-24 16:51:51
 * @Description:
 */
import { ThreeHelper } from "@/src/ThreeHelper";
import Canvas from "@/src/components/Three/Canvas";
import { FC } from "react";
import { css } from "styled-components";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

interface IProps {}

const House: FC<IProps> = () => {
    return (
        <Canvas
            init={init}
            destroy={destroy}
            styled={css`
                width: 100vw;
                height: 100vh;
                border: none;
                position: absolute;
                left: 0;
            `}
        />
    );
};

export default House;

const destroyEvent = [] as VoidFunction[];

function destroy() {
    destroyEvent.forEach((e) => e());
}

async function init(helper: ThreeHelper) {
    helper.addAxis();
    helper.addStats();
    helper.camera.position.set(0, 0, 1);
    helper.frameByFrame();
    helper.addGUI();
    helper.transparentBackGround();
    helper.initLights();
    helper.useSkyEnvironment();
    helper.renderer.domElement.style["background"] =
        "linear-gradient(45deg, #fcbd00, #a68df0)";

    const keyboardMove = new KeyboardMove(helper.controls, helper.camera);

    destroyEvent.push(() => {
        keyboardMove.removeListen();
    });

    helper.animation(() => {
        keyboardMove.update();
    });
}

export class KeyboardMove {
    transform = new THREE.Vector3();
    events = {
        KeyW: {
            press: false,
            handle: () => {
                this.transform.z -= 0.1;
            },
        },
        KeyA: {
            press: false,
            handle: () => {
                this.transform.x -= 0.1;
            },
        },
        KeyS: {
            press: false,
            handle: () => {
                this.transform.z += 0.1;
            },
        },
        KeyD: {
            press: false,
            handle: () => {
                this.transform.x += 0.1;
            },
        },
    } as Record<string, { press: boolean; handle: VoidFunction }>;
    removeListen!: () => void;

    constructor(
        private control: OrbitControls,
        private camera: THREE.PerspectiveCamera
    ) {
        this.listen();
    }

    listen() {
        const self = this;
        const press = (e: KeyboardEvent) => {
            if (self.events[e.code]) {
                self.events[e.code].press = true;
            }
        };

        const up = (e: KeyboardEvent) => {
            if (self.events[e.code]) {
                self.events[e.code].press = false;
            }
        };

        document.addEventListener("keydown", press);
        document.addEventListener("keyup", up);
        this.removeListen = () => {
            document.removeEventListener("keydown", press);
            document.removeEventListener("keyup", up);
        };
    }

    update() {
        this.transform.setScalar(0);
        for (const { press, handle } of Object.values(this.events)) {
            if (press) {
                handle();
            }
        }
        this.transform.applyAxisAngle(
            THREE.Object3D.DEFAULT_UP,
            this.control.getAzimuthalAngle()
        );
        this.control.target.add(this.transform);
        this.camera.position.add(this.transform);
    }
}
