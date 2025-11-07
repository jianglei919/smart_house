/*
 * @Author: hongbin
 * @Date: 2023-04-22 14:35:52
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-22 14:41:02
 * @Description:
 */
import { FC } from "react";
import styled from "styled-components";

interface IProps {}

const Monitor: FC<IProps> = () => {
    return (
        <Container>
            <video src="/video/JianKong.mov" muted autoPlay controls></video>
        </Container>
    );
};

export default Monitor;

const Container = styled.div`
    width: 42vw;
    height: 40vw;
    border-radius: 1vw;
    background: linear-gradient(45deg, #ca9800, #3204bb);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0.5vw;
    video {
        width: 100%;
        height: 100%;
        border-radius: 1vw;
    }
`;
