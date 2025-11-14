"use client";
/*
 * @Author: smartHome
 * @Date: 2025-11-05 17:30:45
 * @LastEditors: smartHome
 * @LastEditTime: 2025-11-12 14:59:49
 * @Description: three
 */
import { FC, useEffect, useRef } from "react";
import styled, { DefaultTheme, ThemedCssFunction } from "styled-components";
// import { init } from "./script";
import { ThreeHelper } from "@/src/ThreeHelper";
import { css } from "styled-components";
interface IProps {
    init: (helper: ThreeHelper) => void;
    destroy?: VoidFunction;
    styled?: ReturnType<typeof css>;
}

const Canvas: FC<IProps> = ({ init, destroy, styled }) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (ref.current) {
            const helper = new ThreeHelper({
                antialias: true,
                canvas: ref.current,
                labelRendererElement: document.querySelector(
                    "#label"
                ) as HTMLDivElement,
            });
            init(helper);
            helper.listenResize();

            return () => {
                destroy && destroy();
                helper.clearScene();
                helper.stopFrame();
                helper.removeResizeListen();
                helper.removeKeyBoardListen();
                document.querySelector("#label")!.innerHTML = "";
            };
        }
    }, [destroy, init]);

    return (
        <Container styled={styled}>
            <CanvasWrap>
                <canvas ref={ref}></canvas>
                <div id="label"></div>
            </CanvasWrap>
        </Container>
    );
};

export default Canvas;

const CanvasWrap = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const Container = styled.div<{ styled?: ReturnType<typeof css> }>`
    height: 80vh;
    width: 80vw;
    margin: 0vh auto;
    border: 2px solid #fff;
    box-shadow: 4px 1px 20px 0px #4d4b4b, -4px -1px 20px 0px #4d4b4b;
    border-radius: 4px;
    ${(props) => props.styled};
`;
