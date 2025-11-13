/*
 * @Author: smartHome
 * @Date: 2025-10-20 22:06:18
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-20 22:18:23
 * @Description: Temperature 温度
 */
import { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Echarts from "echarts";

interface IProps {}

const Temperature: FC<IProps> = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const vmax = (n: number) => (innerWidth / 100) * n;

        const option = {
            title: {
                text: "24h温度(摄氏度)",
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
                        // 使用深浅的间隔色
                        color: "#aaa",
                    },
                },
            },
            series: [
                {
                    type: "bar",
                    data: new Array(24).fill(1).map((_, index) => {
                        if (index < 12) {
                            return index * (0.5 + Math.random() * 0.5) * 2;
                        } else {
                            return (
                                (24 - index) * (0.5 + Math.random() * 0.5) * 2
                            );
                        }
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

export default Temperature;

const Container = styled.div`
    width: 25vw;
    height: 20vw;
    position: fixed !important;
    top: 1vw;
    right: 21vw;
    transition: 0.5s;
    background: linear-gradient(
        31deg,
        rgb(252 189 0 / 57%),
        rgb(166 141 240 / 58%)
    );
    border-radius: 1vw;
`;
