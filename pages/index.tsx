/*
 * @Author: hongbin
 * @Date: 2023-04-22 14:58:12
 * @LastEditors: hongbin
 * @LastEditTime: 2023-05-20 21:59:42
 * @Description:
 */
import { NextSEO } from "@/src/components/NextSEO";
import Image from "next/image";
import { FC, useState } from "react";
import styled from "styled-components";
import bg from "../public/textures/mountains.jpg";
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
        const db = new DBWrapper("house", "1", {
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
        console.log(query);
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
            <NextSEO title="智能家居-数字孪生" />
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
                            登陆
                        </Button>
                        <span
                            onClick={() => {
                                setIsRegister(true);
                            }}
                            style={{
                                color: "#284549",
                                fontSize: "1vmax",
                                marginTop: "1vmax",
                            }}
                        >
                            注册
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
                                color: "#284549",
                                fontSize: "1vmax",
                                marginTop: "1vmax",
                            }}
                        >
                            登陆
                        </span>
                    </Plane>
                ) : null}
                <Fixed>智慧家居数字孪生系统</Fixed>
            </Container>
        </>
    );
};

export default HomePage;

const Input = styled.input`
    width: 80%;
    padding: 5px;
    height: 4vh;
    border: none;
    margin: 1vh;
    font-size: 1vmax;
    background: var(--clay-background, rgba(0, 0, 0, 0.005));
    border-radius: 0.4vw;
    box-shadow: var(--clay-shadow-outset, 8px 8px 16px 0 rgba(0, 0, 0, 0.25)),
        inset
            var(
                --clay-shadow-inset-primary,
                -8px -8px 16px 0 rgba(0, 0, 0, 0.25)
            ),
        inset
            var(
                --clay-shadow-inset-secondary,
                8px 8px 16px 0 hsla(0, 0%, 100%, 0.2)
            );
    ::placeholder {
        color: #18282b;
    }
    color: #152f34;
    outline: none;
`;

const Button = styled.div`
    cursor: pointer;
    color: #18282b;
    width: 100%;
    height: 5vh;
    margin-top: 2vh;
    align-self: flex-start;

    ${flexCenter};
    transition: 0.3s;
    background: var(--clay-background, rgba(0, 0, 0, 0.005));
    border-radius: 0.3vw;
    box-shadow: var(--clay-shadow-outset, 8px 8px 16px 0 rgba(0, 0, 0, 0.25)),
        inset
            var(
                --clay-shadow-inset-primary,
                -8px -8px 16px 0 rgba(0, 0, 0, 0.25)
            ),
        inset
            var(
                --clay-shadow-inset-secondary,
                8px 8px 16px 0 hsla(0, 0%, 100%, 0.2)
            );

    :active {
        color: #80d9e8;
    }
`;

const Container = styled.div`
    overflow: hidden;
`;

const Plane = styled.div`
    width: min(400px, 20vw);
    height: 70vh;
    padding-top: 10vh;
    margin: 10vh 0 0 10vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--clay-background, rgba(0, 0, 0, 0.005));
    border-radius: var(--clay-border-radius, 32px);
    box-shadow: var(--clay-shadow-outset, 8px 8px 16px 0 rgba(0, 0, 0, 0.25)),
        inset
            var(
                --clay-shadow-inset-primary,
                -8px -8px 16px 0 rgba(0, 0, 0, 0.25)
            ),
        inset
            var(
                --clay-shadow-inset-secondary,
                8px 8px 16px 0 hsla(0, 0%, 100%, 0.2)
            );
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
    top: 20vh;
    left: 40vw;
    font-size: 5vmax;
    letter-spacing: 2px;
    text-shadow: 2px 3px 4px #234046;
    color: #284549;
`;
