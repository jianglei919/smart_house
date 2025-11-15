/*
 * @Author: smartHome
 * @Date: 2025-10-22 14:49:36
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-20 22:04:10
 * @Description:物理段 孪生
 */
import { ThreeHelper } from "@/src/ThreeHelper";
import { NextSEO } from "@/src/components/NextSEO";
import Canvas from "@/src/components/Three/Canvas";
import { ClickMesh } from "@/src/pages/twin/ClickMesh";
import ControlsPlane, {
    controlsPlaneRef,
} from "@/src/pages/twin/ControlsPlane";
import { SwitchController } from "@/src/pages/twin/SwitchController";
import { FlexDiv } from "@/src/styled";
import DBWrapper from "@/src/utils/DBWrapper";
import { FC, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { Fixed as FixedTitle } from "./index";
import { DBUserInfo } from ".";

interface IProps {}

const House: FC<IProps> = () => {
    const [user, setUser] = useState({} as DBUserInfo);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    }, []);

    const update = async (key: string, val: number) => {
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

        db.open();
        const data = await db.get("user", user.id);
        data[key] = val;
        const res = await db.put("user", data);
        console.log(res);
    };

    return (
        <>
            <NextSEO title="智慧家居数字系统" />
            <FixedTitle
                style={{
                    color: "#e6f2ff",
                    zIndex: 1,
                    fontSize: "3vmax",
                    top: "3vh",
                    textShadow: "2px 3px 6px rgba(30,64,175,0.6)",
                }}
            >
                智慧家居物理端
            </FixedTitle>
            <Canvas
                init={init}
                destroy={destroy}
                styled={css`
                    width: 100vw;
                    height: 100vh;
                    border: none;
                    position: absolute;
                    left: 0;
                    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #1e3a8a 100%);
                `}
            />
            <Fixed>
                <FlexDiv>
                    <span>当前屋内温度： {22}</span>
                    <span>
                        当温度高于
                        <input
                            type="number"
                            style={{ width: "40px" }}
                            defaultValue={user.温度}
                            onChange={(e) => {
                                update("温度", Number(e.target.value));
                            }}
                        />
                        °C 度时将为您自动打开空调
                    </span>
                </FlexDiv>
            </Fixed>
            <Fixed
                style={{
                    right: "max(210px,10vw)",
                }}
            >
                <FlexDiv>
                    <span>当前屋内湿度： {45}%</span>
                    <span>
                        当湿度高于
                        <input
                            type="number"
                            style={{ width: "40px" }}
                            defaultValue={user.湿度}
                            onChange={(e) => {
                                update("湿度", Number(e.target.value));
                            }}
                        />
                        度时将为您自动打开阳台门
                    </span>
                </FlexDiv>
            </Fixed>
        </>
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
    helper.renderer.domElement.style.background =
        "linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #1e3a8a 100%)";
    //阴影开启
    // helper.renderer.shadowMap.enabled = true;
    //阴影类型
    // helper.renderer.shadowMap.type = THREE.PCFShadowMap;
    // helper.useRoomEnvironment();
    // helper.useSkyEnvironment(); // 注释掉，否则会覆盖背景渐变

    const { switchController } = modelLoad();
    switchController.asyncDevice();

    const clickMesh = new ClickMesh();

    clickMesh.click((mesh) => {
        console.log(mesh);
        mesh && switchController.toggleCss2DObject(mesh.uuid);
    });

    clickMesh.dblclick((mesh) => {
        mesh && switchController.toggle(mesh);
    });

    destroyEvent.push(() => {
        clickMesh.destroy();
    });

    helper.animation(() => {
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
    });

    return { switchController };
}

const Fixed = styled.div`
    position: fixed;
    z-index: 40;
    bottom: 1vh;
    right: 0;
    width: max(200px, 10vw);
    height: max(70px, 7vh);
    font-size: min(14px, 1vw);
    padding: 10px;
    background: linear-gradient(140deg, rgba(30,64,175,0.85) 0%, rgba(37,99,235,0.75) 55%, rgba(14,165,233,0.65) 100%);
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
    border-radius: 0.6vw;
    box-shadow: 0 6px 18px rgba(30,64,175,0.35), inset 0 0 12px rgba(255,255,255,0.08);
`;
