/*
 * @Author: smartHome
 * @Date: 2025-10-22 13:33:32
 * @LastEditors: smartHome
 * @LastEditTime: 2025-10-22 13:37:42
 * @Description:
 */
import { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Echarts from "echarts";

interface IProps {}

const WaterConsumption: FC<IProps> = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const vmax = (n: number) => (innerWidth / 100) * n;

        const option = {
            title: {
                text: "用水消耗(L)",
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
                data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
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
                    data: [8, 6, 9, 4, 8, 12, 12],
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

export default WaterConsumption;

const Container = styled.div`
    width: 25vw;
    height: 20vw;
    position: fixed !important;
    bottom: 1vw;
    right: 21vw;
    transition: 0.5s;
    background: linear-gradient(
        31deg,
        rgb(252 189 0 / 57%),
        rgb(166 141 240 / 58%)
    );
    border-radius: 1vw;
`;
