/*
 * @Author: smartHome
 * @Date: 2025-10-20 22:19:07
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-20 22:59:42
 * @Description:AirQuality - Air Quality
 */
import { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Echarts from "echarts";

interface IProps {}

const AirQuality: FC<IProps> = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const vmax = (n: number) => (innerWidth / 100) * n;

        const option = {
            title: {
                text: "24h Air Quality",
                left: vmax(1),
                textStyle: {
                    color: "#fffae5",
                    fontSize: 20,
                },
            },
            tooltip: {
                trigger: "axis",
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
                height: "auto",
            },
            xAxis: {
                type: "category",
                data: new Array(24).fill(1).map((_, index) => index),
                axisLabel: {
                    interval: 0,
                    fontSize: vmax(0.7),
                },
                axisLine: {
                    lineStyle: {
                        color: "#fffae5",
                    },
                },
            },
            yAxis: {
                type: "value",
                axisLabel: {
                    fontSize: vmax(0.7),
                },
                axisLine: {
                    lineStyle: {
                        color: "#fffae5",
                    },
                },
                splitLine: {
                    //   show: false,
                    lineStyle: {
                        // Use alternating dark and light colors
                        color: "#aaa",
                    },
                },
            },
            series: [
                {
                    type: "bar",
                    data: new Array(24).fill(1).map((_, index) => {
                        return 20 + (0.6 + Math.random() * 0.4) * 30;
                    }),
                    barWidth: "30%",
                },
            ],
        };
        const chart = Echarts.init(ref.current);
        chart.setOption(option);
        window.addEventListener("resize", (e: any) => {
            chart.resize();
        });
    }, []);

    return <Container ref={ref}></Container>;
};

export default AirQuality;

const Container = styled.div`
    width: 25vw;
    height: 20vw;
    position: fixed !important;
    top: 1vw;
    left: 1vw;
    transition: 0.5s;
    background: linear-gradient(
        31deg,
        rgb(252 189 0 / 57%),
        rgb(166 141 240 / 58%)
    );
    border-radius: 1vw;
`;
