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
    color: #ffffff;
    width: 100%;
    height: auto;
    padding: 10px 16px;
    margin-top: 10px;
    font-size: clamp(13px, 1.1vmax, 16px);
    font-weight: 600;
    letter-spacing: 0.5px;
    ${flexCenter};
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #5DADE2 0%, #3498DB 100%);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    border: none;
    visibility: hidden;
    opacity: 0;

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
    position: fixed;
    top: 2vh;
    left: 2vw;
    z-index: 100;
    width: min(200px, 15vw);
    padding: 20px;
    background: rgba(240, 248, 255, 0.75);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(173, 216, 230, 0.4);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15),
                0 2px 8px rgba(135, 206, 250, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    
    p {
        margin: 0 0 10px 0;
        font-size: clamp(14px, 1.2vmax, 18px);
        font-weight: 600;
        color: #2c5f7f;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    :hover {
        box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2),
                    0 4px 12px rgba(135, 206, 250, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.5);
    }
    
    :hover ${Button} {
        visibility: visible;
        opacity: 1;
    }
    
    @media (max-width: 768px) {
        width: min(160px, 35vw);
        padding: 15px;
    }
`;
