/*
 * @Author: smartHome
 * @Date: 2025-10-22 14:58:12
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-20 21:59:42
 * @Description:
 */
import { NextSEO } from "@/src/components/NextSEO";
import Image from "next/image";
import { FC, useState } from "react";
import styled from "styled-components";
import bg from "../public/textures/img.png";
import { flexCenter } from "@/src/styled";
import DBWrapper from "@/src/utils/DBWrapper";

const devicesName = [
    "空调",
    "次卧",
    "主卧",
    "客厅电视",
    "房门",
    "卫生间",
    "厨房",
    "阳台右门",
    "阳台左门",
    "卧室电视",
    "风扇",
    "次卧吊灯",
    "大吊灯",
    "主卧吊灯",
];

export type DBDevice = Record<string, { duration: number; off: boolean }>;
export type DBUserInfo = DBDevice & {
    name: string;
    password: string;
    id: number;
    温度: number;
    湿度: number;
};

const generateRandomData = () => {
    return devicesName.reduce((p, c) => {
        p[c] = {
            duration: Number((Math.random() * 1000).toFixed(0)),
            off: !["次卧吊灯", "大吊灯", "主卧吊灯"].includes(c),
        };
        return p;
    }, {} as DBDevice);
};

interface IProps {}

const HomePage: FC<IProps> = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [register, setRegister] = useState({
        name: "",
        password: "",
        conformPWD: "",
    });

    const login = async () => {
        if (isLoading) return;
        setIsLoading(true);
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
        await db.open();
        const query = await db.getAllMatching("user", {
            index: "name",
            query: IDBKeyRange.only(name),
        });
        if (!query.length) {
            const userData = {
                name,
                password,
                ...generateRandomData(),
                温度: 26,
                湿度: 60,
            };
            await db
                .add("user", userData)
                .then((res: any) => {
                    console.log("res", res);
                    localStorage.setItem(
                        "user",
                        JSON.stringify({ id: res, ...userData })
                    );
                    location.href = "/twin";
                })
                .catch((err: any) => {
                    console.log("err", err);
                    alert("用户名重复");
                });
        } else {
            if (query[0].password == password) {
                console.log("成功");
                localStorage.setItem("user", JSON.stringify(query[0]));
                location.href = "/twin";
            } else {
                alert("密码错误");
            }
        }
        setIsLoading(false);
    };

    return (
        <>
            <NextSEO title="智能家居数字系统" />
            <Container>
                <FixedBg>
                    <Image src={bg} alt="" fill />
                </FixedBg>
                {isRegister ? null : (
                    <Plane>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            placeholder="用户名"
                        />

                        <Input
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            placeholder="密码"
                            type="password"
                        />
                        <Button
                            style={{ marginLeft: "10%", width: "80%" }}
                            onClick={login}
                        >
                            登录
                        </Button>
                        <span
                            onClick={() => {
                                setIsRegister(true);
                            }}
                            style={{
                                color: "#3498DB",
                                fontSize: "clamp(12px, 1vmax, 16px)",
                                marginTop: "1.5vmax",
                                cursor: "pointer",
                                textDecoration: "underline",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#2980B9";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#3498DB";
                            }}
                        >
                            还没有账号？立即注册
                        </span>
                    </Plane>
                )}
                {isRegister ? (
                    <Plane>
                        <Input
                            value={register.name}
                            onChange={(e) => {
                                setRegister((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }));
                            }}
                            placeholder="用户名"
                        />

                        <Input
                            value={register.password}
                            onChange={(e) => {
                                setRegister((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }));
                            }}
                            placeholder="密码"
                            type="password"
                        />
                        <Input
                            value={register.conformPWD}
                            onChange={(e) => {
                                setRegister((prev) => ({
                                    ...prev,
                                    conformPWD: e.target.value,
                                }));
                            }}
                            placeholder="确认密码"
                            type="password"
                        />
                        <Button
                            style={{ marginLeft: "10%", width: "80%" }}
                            onClick={() => {
                                if (
                                    !register.name ||
                                    !register.password ||
                                    !register.conformPWD
                                ) {
                                    alert("请将信息填写完整");
                                } else if (
                                    register.password != register.conformPWD
                                ) {
                                    alert("两次密码输入不同");
                                } else {
                                    login();
                                }
                            }}
                        >
                            注册
                        </Button>
                        <span
                            onClick={() => {
                                setIsRegister(false);
                            }}
                            style={{
                                color: "#3498DB",
                                fontSize: "clamp(12px, 1vmax, 16px)",
                                marginTop: "1.5vmax",
                                cursor: "pointer",
                                textDecoration: "underline",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#2980B9";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#3498DB";
                            }}
                        >
                            已有账号？立即登录
                        </span>
                    </Plane>
                ) : null}
                <Fixed>智慧家居数字系统</Fixed>
            </Container>
        </>
    );
};

export default HomePage;

const Input = styled.input`
    width: 85%;
    padding: 14px 18px;
    height: auto;
    border: 2px solid rgba(173, 216, 230, 0.3);
    margin: 10px 0;
    font-size: clamp(14px, 1.2vmax, 18px);
    background: rgba(240, 248, 255, 0.85);
    border-radius: 12px;
    color: #2c5f7f;
    outline: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(135, 206, 250, 0.15);

    ::placeholder {
        color: #87CEEB;
    }

    &:focus {
        border-color: #87CEEB;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 16px rgba(135, 206, 250, 0.3);
        transform: translateY(-2px);
    }

    &:hover {
        border-color: #ADD8E6;
    }
`;

const Button = styled.div`
    cursor: pointer;
    color: #ffffff;
    width: 85%;
    height: auto;
    padding: 14px 24px;
    margin-top: 20px;
    font-size: clamp(14px, 1.2vmax, 18px);
    font-weight: 600;
    letter-spacing: 0.5px;
    ${flexCenter};
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #5DADE2 0%, #3498DB 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    border: none;

    &:hover {
        background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
    }
`;

const Container = styled.div`
    overflow: hidden;
`;

const Plane = styled.div`
    width: min(450px, 90vw);
    min-height: auto;
    padding: 50px 40px 40px;
    margin: 22vh auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(240, 248, 255, 0.75);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(173, 216, 230, 0.4);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15),
                0 2px 8px rgba(135, 206, 250, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.5);
    
    @media (max-width: 768px) {
        margin: 18vh auto 0;
    }
`;

const FixedBg = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
`;

export const Fixed = styled.span`
    position: fixed;
    top: 8vh;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(20px, 3vmax, 42px);
    font-weight: 700;
    letter-spacing: 2px;
    text-shadow: 2px 4px 8px rgba(52, 152, 219, 0.3),
                 0 0 20px rgba(135, 206, 250, 0.2);
    color: #2980B9;
    background: linear-gradient(135deg, #3498DB 0%, #5DADE2 50%, #85C1E2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
    z-index: 10;
    
    @media (max-width: 768px) {
        top: 5vh;
        font-size: clamp(16px, 3vmax, 36px);
    }
`;
