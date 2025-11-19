/*
 * @Author: smartHome
 * @Date: 2025-10-10 10:44:18
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-24 19:01:02
 * @Description:
 */
import { ThreeHelper } from "@/src/ThreeHelper";
import { NextSEO } from "@/src/components/NextSEO";
import Canvas from "@/src/components/Three/Canvas";
import Account from "@/src/pages/twin/Account";
import { ClickMesh } from "@/src/pages/twin/ClickMesh";
import ControlsPlane, {
    controlsPlaneRef,
} from "@/src/pages/twin/ControlsPlane";
import { SwitchController } from "@/src/pages/twin/SwitchController";
import DBWrapper from "@/src/utils/DBWrapper";
import { FC, Fragment, useEffect } from "react";
import { css } from "styled-components";
import * as THREE from "three";
import { KeyboardMove } from "./move";

interface IProps {}

const House: FC<IProps> = () => {
    return (
        <Fragment>
            <NextSEO title="智慧家居数字系统" />
            <Account />
            <Canvas
                init={init}
                destroy={destroy}
                styled={css`
                    width: 80vw;
                    height: 100vh;
                    border: none;
                    position: absolute;
                    left: 0;
                `}
            />
            <ControlsPlane />
        </Fragment>
    );
};

export default House;

const destroyEvent = [] as VoidFunction[];

function destroy() {
    destroyEvent.forEach((e) => e());
}

async function init(helper: ThreeHelper) {
    helper.camera.position.set(0, 10, 20);
    helper.frameByFrame();
    helper.transparentBackGround();
    helper.initLights();
    helper.renderer.domElement.style["background"] =
        "linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #1e3a8a 100%)";
    //阴影开启
    // helper.renderer.shadowMap.enabled = true;
    //阴影类型
    // helper.renderer.shadowMap.type = THREE.PCFShadowMap;
    // helper.useRoomEnvironment();

    const { switchController } = modelLoad();

    // 追踪漫游状态
    let isRoamMode = false;

    const clickMesh = new ClickMesh();

    clickMesh.click((mesh) => {
        console.log(mesh);
        // 漫游模式下单击切换状态，非漫游模式下显示信息
        if (isRoamMode) {
            mesh && switchController.toggle(mesh);
        } else {
            mesh && switchController.toggleCss2DObject(mesh.uuid);
        }
    });

    clickMesh.dblclick((mesh) => {
        mesh && switchController.toggle(mesh);
    });

    destroyEvent.push(() => {
        clickMesh.destroy();
    });
    const keyboardMove = new KeyboardMove(helper.controls, helper.camera);

    destroyEvent.push(() => {
        keyboardMove.removeListen();
    });

    helper.gui?.add(
        {
            f: () => {
                console.log(helper.camera.position);
                console.log(helper.controls.target);
            },
        },
        "f"
    );

    const door = [
        {
            position: { x: 0, y: 10, z: 20 },
            target: { x: 0, y: 0, z: 0 },
        },
        {
            position: { x: 11, y: 3.2, z: -1 },
            target: { x: 10, y: 3, z: -1 },
        },
    ];

    const positionLinearAnimation = new helper.LinearAnimation(
        door[0].position
    );
    const targetLinearAnimation = new helper.LinearAnimation(door[0].target);

    positionLinearAnimation.onUpdate(({ x, y, z }) => {
        helper.camera.position.set(x, y, z);
    });
    targetLinearAnimation.onUpdate(({ x, y, z }) => {
        helper.controls.target.set(x, y, z);
    });

    if (controlsPlaneRef.current) {
        controlsPlaneRef.current.roam = (state: boolean) => {
            const { x, y, z } = helper.camera.position;
            const { x: tx, y: ty, z: tz } = helper.controls.target;
            positionLinearAnimation.setStart({ x, y, z });
            targetLinearAnimation.setStart({ x: tx, y: ty, z: tz });
            // 更新漫游状态
            isRoamMode = state;
            // 漫游视角
            if (state) {
                positionLinearAnimation.to({ ...door[1].position });
                targetLinearAnimation.to({ ...door[1].target });
            } else {
                //俯瞰 初始视角
                positionLinearAnimation.to({ ...door[0].position });
                targetLinearAnimation.to({ ...door[0].target });
            }
        };
    }

    helper.animation(() => {
        positionLinearAnimation.update();
        targetLinearAnimation.update();
        keyboardMove.update();
        switchController.update();
    });
}

function modelLoad() {
    const helper = ThreeHelper.instance;
    const switchController = new SwitchController();

    helper.loadGltf("/models/HOUSE/house.gltf").then((gltf) => {
        helper.add(gltf.scene);
        switchController.animations = gltf.animations;
        switchController.scene = gltf.scene;
        gltf.scene.traverse((obj) => {
            switchController.append(obj);
        });
        controlsPlaneRef.current?.setDevices(switchController.devices);
        if (controlsPlaneRef.current) {
            controlsPlaneRef.current.toggle = (o: Mesh) => {
                switchController.toggle(o);
                controlsPlaneRef.current?.setDevices(switchController.devices);
            };
        }
        switchController.asyncDevice();
    });

    return { switchController };
}
