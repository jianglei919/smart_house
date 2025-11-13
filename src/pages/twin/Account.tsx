/*
 * @Author: smartHome
 * @Date: 2025-10-23 21:56:14
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-24 15:44:24
 * @Description:
 */
import { DBUserInfo } from "@/pages";
import { flexCenter } from "@/src/styled";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";

interface IProps {}

const Account: FC<IProps> = () => {
    const [user, setUser] = useState({} as DBUserInfo);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        if (!userInfo.name) {
            location.href = "/";
        } else {
            setUser(userInfo);
        }
    }, []);

    return (
        <Container>
            <p>{user.name}</p>
            <Button
                onClick={() => {
                    localStorage.setItem("user", "{}");
                    location.href = "/";
                }}
            >
                登出
            </Button>
        </Container>
    );
};

export default Account;

const Button = styled.div`
    cursor: pointer;
    color: #b58b78;
    width: 100%;
    height: 5vh;
    margin-top: 2vh;
    align-self: flex-start;

    ${flexCenter};
    transition: 0.3s;
    background: var(--clay-background, rgba(0, 0, 0, 0.005));
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

    :active {
        color: #917264;
    }
    visibility: hidden;
    opacity: 0;
    transition: 0.3s;
`;

const Container = styled.div`
    position: fixed;
    top: 1vh;
    left: 1vw;
    z-index: 1;
    width: 10vw;
    :hover ${Button} {
        visibility: visible;
        opacity: 1;
    }
`;
