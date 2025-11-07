import { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Echarts from "echarts";

interface IProps {}

const PowerConsumption: FC<IProps> = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const vmax = (n: number) => (innerWidth / 100) * n;

        const option = {
            title: {
                text: "用电消耗(W)",
                left: vmax(1),
                textStyle: {
                    color: "#fffae5",
                    fontSize: 20,
                },
            },
            tooltip: {},
            series: [
                {
                    type: "pie",
                    data: [
                        { name: "灯", value: 10 },
                        { name: "空调", value: 20 },
                        { name: "冰箱", value: 20 },
                        { name: "其他", value: 5 },
                    ],
                    selectedMode: "single",
                    selectedOffset: 10,
                    clockwise: true,
                    label: {
                        fontSize: vmax(0.71),
                        color: "#fafaf6",
                    },
                    labelLine: {
                        lineStyle: {
                            color: "#fffae5",
                        },
                    },
                    center: ["50%", "55%"],
                    itemStyle: {},
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

export default PowerConsumption;

const Container = styled.div`
    width: 25vw;
    height: 20vw;
    position: fixed !important;
    bottom: 1vw;
    left: 1vw;
    transition: 0.5s;
    background: linear-gradient(
        31deg,
        rgb(252 189 0 / 57%),
        rgb(166 141 240 / 58%)
    );
    border-radius: 1vw;
`;
