/*
 * @Author: smartHome
 * @Date: 2025-10-21 10:13:26
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-22 22:21:16
 * @Description:
 */
import {
    Dispatch,
    FC,
    SetStateAction,
    createRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import styled, { css } from "styled-components";
import { IDevices } from "../SwitchController";
import { flexCenter } from "@/src/styled";
import PowerConsumption from "./chart/PowerConsumption";
import WaterConsumption from "./chart/WaterConsumption";
import Monitor from "./Monitor";
import { DBUserInfo } from "@/pages";
import UserManage from "./UserManage";
import Temperature from "./chart/Temperature";
import AirQuality from "./chart/AirQuality";

export const controlsPlaneRef = createRef<{
    setDevices: (IDevices: IDevices) => void;
    toggle: (o: Mesh) => void;
    setIsShowMonitor: Dispatch<SetStateAction<boolean>>;
    roam: (state: boolean) => void;
}>();

interface IProps {
    css?: ReturnType<typeof css>;
}

const ControlsPlane: FC<IProps> = ({ css }) => {
    const [devices, setDevices] = useState<IDevices["string"][]>([]);
    const [isShowDevices, setIsShowDevices] = useState(false);
    const [isShowDevicesInfo, setIsShowDevicesInfo] = useState(false);
    const [isShowDevicesData, setIsShowDevicesData] = useState(false);
    const [isShowMonitor, setIsShowMonitor] = useState(false);
    const [isManageUsers, setIsManageUsers] = useState(false);
    const [isRoam, setIsRoam] = useState(false);
    const [user, setUser] = useState({} as DBUserInfo);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        if (userInfo.name) {
            setUser(userInfo);
        }
    }, []);

    useImperativeHandle(
        controlsPlaneRef,
        () => ({
            setDevices: (devices: IDevices) => {
                setDevices(() => Object.values(devices).filter((d) => !d.bind));
            },
            toggle: (mesh: Mesh) => {},
            setIsShowMonitor,
            roam: () => {},
        }),
        []
    );

    const showDevicesInfo = useCallback(() => {
        devices.forEach((device) => {
            device.target.userData.css2DObject.visible = !isShowDevicesInfo;
        });
        setIsShowDevicesInfo((p) => !p);
    }, [devices, isShowDevicesInfo]);

    return (
        <Plane css={css}>
            <ManagerButton
                onClick={() => {
                    window.open(`${location.origin}/physics`);
                }}
            >
                前往物理端
            </ManagerButton>
            <ManagerButton
                light={isShowDevices}
                onClick={() => setIsShowDevices((p) => !p)}
            >
                电器开关
            </ManagerButton>
            <SwitchWrap show={isShowDevices}>
                {devices.map((device) => (
                    <Devices
                        onClick={() => {
                            controlsPlaneRef.current?.toggle(
                                device.target as Mesh
                            );
                        }}
                        key={device.target.uuid}
                        open={device.state == "on"}
                    >
                        <p>{device.target.name}</p>
                    </Devices>
                ))}
            </SwitchWrap>
            <ManagerButton light={isShowDevicesInfo} onClick={showDevicesInfo}>
                电器信息
            </ManagerButton>
            <ManagerButton
                light={isShowDevicesData}
                onClick={() => setIsShowDevicesData((p) => !p)}
            >
                屋内数据
            </ManagerButton>
            <ManagerButton
                light={isShowMonitor}
                onClick={() => setIsShowMonitor((p) => !p)}
            >
                监控摄像头
            </ManagerButton>
            <ManagerButton
                light={isRoam}
                onClick={() => {
                    controlsPlaneRef.current?.roam(!isRoam);
                    setIsRoam((p) => !p);
                }}
            >
                漫游
            </ManagerButton>
            {user.name == "admin" ? (
                <ManagerButton
                    light={isManageUsers}
                    onClick={() => setIsManageUsers((p) => !p)}
                >
                    管理用户信息
                </ManagerButton>
            ) : null}
            {isShowDevicesData ? (
                <>
                    <PowerConsumption />
                    <WaterConsumption />
                    <Temperature />
                    <AirQuality />
                </>
            ) : null}
            {isShowMonitor ? <Monitor /> : null}
            {isManageUsers ? (
                <UserManage close={() => setIsManageUsers(false)} />
            ) : null}
        </Plane>
    );
};

export default ControlsPlane;

const ManagerButton = styled.div<{ light?: boolean }>`
    height: 10vh;
    width: calc(100% - 10px);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
    border: ${(props) =>
        props.light ? "1px solid rgba(255,255,255,.85)" : "1px solid rgba(255,255,255,.7)"};
    color: #ffffff;
    border-radius: 8px;
    margin: 5px;
    ${flexCenter};
    cursor: pointer;
    background: ${(props) =>
        props.light
            ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 45%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #38bdf8 100%)"};
    box-shadow: ${(props) =>
        props.light ? "0 6px 18px rgba(37,99,235,.35)" : "0 4px 12px rgba(14,165,233,.25)"};
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(37,99,235,.35);
    }
    &:active {
        transform: translateY(0);
    }
`;

const Plane = styled.div<{ css?: ReturnType<typeof css> }>`
    position: fixed;
    width: 20vw;
    height: 100vh;
    top: 0;
    right: 0;
    z-index: 9;
    background: linear-gradient(200deg, #0ea5e9 0%, #2563eb 45%, #1e3a8a 100%);
    ${(props) => {
        console.log(props.css);
        return props.css;
    }};
`;

const SwitchWrap = styled.div<{ show: boolean }>`
    width: 100%;

    transition: 0.3s;
    overflow: hidden scroll;
    display: flex;
    flex-wrap: wrap;
    color: #333;
    justify-content: center;
    ${(props) =>
        props.show
            ? css`
                  height: 50vh;
              `
            : css`
                  height: 0vh;
              `};
`;

const Devices = styled.div<{ open: boolean }>`
    width: 40%;
    height: 10vh;
    border-radius: 1vw;
    margin: 5px;
    ${(props) =>
        props.open
            ? `
            background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)
            `
            : `
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
            `};
    p {
        font-weight: bold;
        color: #e6f2ff;
        padding: 0.5vw;
    }
`;
