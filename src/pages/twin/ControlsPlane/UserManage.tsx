/*
 * @Author: hongbin
 * @Date: 2023-04-24 13:24:47
 * @LastEditors: hongbin
 * @LastEditTime: 2023-05-20 23:06:08
 * @Description:
 */
import { DBUserInfo } from "@/pages";
import { FlexDiv, flexCenter } from "@/src/styled";
import DBWrapper from "@/src/utils/DBWrapper";
import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface IProps {
    close: () => void;
}

const UserManage: FC<IProps> = ({ close }) => {
    const [users, setUsers] = useState([] as DBUserInfo[]);
    const dbRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
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
            dbRef.current = db;
            await db.open();
            const query = await db.getAll("user");
            console.log(query);
            setUsers(query.filter((u: DBUserInfo) => u.name != "admin"));
        })();
    }, []);

    return (
        <Container>
            {users.map((user) => (
                <div key={user.name}>
                    <span>{user.name}</span>
                    <input
                        value={user.password}
                        onChange={(e) => {
                            setUsers((users) =>
                                users.map((u) => {
                                    if (u.name == user.name) {
                                        u.password = e.target.value;
                                    }
                                    return u;
                                })
                            );
                        }}
                    />
                    <Button
                        onClick={async () => {
                            if (dbRef.current) {
                                dbRef.current
                                    .put("user", {
                                        ...user,
                                    })
                                    .then((res: number) => {
                                        setTimeout(() => {
                                            console.log("res", res);
                                            alert("修改成功");
                                        }, 100);
                                    })
                                    .catch((err: any) => {
                                        console.log("err", err);
                                        alert("修改失败");
                                    });
                            }
                        }}
                    >
                        更新
                    </Button>
                    <Button
                        onClick={async () => {
                            if (dbRef.current) {
                                dbRef.current
                                    .delete("user", user.id)
                                    .then((res: number) => {
                                        setTimeout(() => {
                                            console.log("res", res);
                                            alert("删除成功");
                                            setUsers((users) =>
                                                users.filter(
                                                    (u) => u.id != user.id
                                                )
                                            );
                                        }, 100);
                                    })
                                    .catch((err: any) => {
                                        console.log("err", err);
                                        alert("删除失败");
                                    });
                            }
                        }}
                    >
                        删除
                    </Button>
                </div>
            ))}
            {users.length ? (
                <Button
                    style={{ width: "100%", height: "4vh" }}
                    onClick={close}
                >
                    关闭
                </Button>
            ) : (
                <></>
            )}
        </Container>
    );
};

export default UserManage;

const Button = styled.button`
    cursor: pointer;
    width: 4vw;
    height: 100%;
    padding: 5px;
    margin-left: 5px;
    align-self: flex-start;
    border: none;
    color: #72601e;

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
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 1vw;
    z-index: 99;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 20vw;
    min-height: 40vh;
    color: #000;
    padding: 1vh;
    & > div {
        span {
            color: #8065a7;
            width: 8vw;
        }
        margin: 10px;
        display: flex;
        justify-content: space-between;
        background: linear-gradient(
            293deg,
            rgb(252 189 0 / 63%),
            rgb(166 141 240 / 60%)
        );
        border: none;
        box-shadow: var(
                --clay-shadow-outset,
                5px 5px 10px 0 rgba(0, 0, 0, 0.25)
            ),
            inset
                var(
                    --clay-shadow-inset-primary,
                    -5px -5px 10px 0 rgba(0, 0, 0, 0.25)
                ),
            inset
                var(
                    --clay-shadow-inset-secondary,
                    5px 5px 10px 0 hsla(0, 0%, 100%, 0.2)
                );
        border-radius: 0.5vw;
        padding: 5px;
        align-items: center;
        input {
            border-radius: 0.3vw;
            border: none;
            background: transparent;
            outline: none;
            padding: 5px;
            margin-left: 5px;
            background: #00000011;
        }
    }
    background: linear-gradient(
        293deg,
        rgb(252 189 0 / 63%),
        rgb(166 141 240 / 60%)
    );
    border-radius: 0.5vw;
    box-shadow: var(--clay-shadow-outset, 5px 5px 10px 0 rgba(0, 0, 0, 0.25)),
        inset
            var(
                --clay-shadow-inset-primary,
                -5px -5px 10px 0 rgba(0, 0, 0, 0.25)
            ),
        inset
            var(
                --clay-shadow-inset-secondary,
                5px 5px 10px 0 hsla(0, 0%, 100%, 0.2)
            );
`;
