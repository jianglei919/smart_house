/*
 * @Author: hongbin
 * @Date: 2023-04-21 16:24:36
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-21 22:05:53
 * @Description:indexDb 存储模型
 */
import { ThreeHelper } from "@/src/ThreeHelper";
import { RandomColor } from "@/src/ThreeHelper/utils";
import { NextSEO } from "@/src/components/NextSEO";
import Canvas from "@/src/components/Three/Canvas";
import DBWrapper from "@/src/utils/DBWrapper";
import { FC } from "react";
import styled, { css } from "styled-components";
import * as THREE from "three";

interface IProps {}

const House: FC<IProps> = () => {
    return (
        <>
            <NextSEO title="indexDB & three.js" />
            <Canvas init={init} destroy={destroy} />
        </>
    );
};

export default House;

const destroyEvent = [] as VoidFunction[];

function destroy() {
    destroyEvent.forEach((e) => e());
}

async function init(helper: ThreeHelper) {
    helper.addStats();
    helper.camera.position.set(0, 10, 20);
    helper.frameByFrame();
    helper.addGUI();
    helper.transparentBackGround();
    helper.initLights();
    helper.renderer.domElement.style["background"] =
        "linear-gradient(45deg, #fcbd00, #a68df0)";

    const db = new DBWrapper("test", "1", {
        onupgradeneeded: (e: any) => {
            const db = e.target.result;
            db.createObjectStore("model", {
                autoIncrement: true,
                keyPath: "id",
            });
            const objStore = db.createObjectStore("user", {
                autoIncrement: true,
                keyPath: "id",
            });
            objStore.createIndex("name", "name", { unique: 1 });
        },
    }) as any;
    db.open();
    // db.add("user", { name: "1", info: { 主卧: true } });

    // console.log(await db.getAll("user"));
    // console.log(await db.getKey("user", 1));

    const dbJson = await db.get("model", 3);
    if (dbJson) {
        console.log(dbJson);
        const group = await new THREE.ObjectLoader().parseAsync(dbJson.json);
        helper.add(group);
    } else {
        const group = new THREE.Group();

        for (let i = 0; i < 30; i++) {
            const box = helper.generateRect(
                { width: 1, height: 1, depth: 1 },
                { color: new RandomColor() }
            );
            box.position.set(
                (0.5 - Math.random()) * 5,
                (0.5 - Math.random()) * 5,
                (0.5 - Math.random()) * 5
            );
            group.add(box);
            box.updateMatrix();
        }
        helper.add(group);

        const json = group.toJSON();
        db.add("model", { json });
    }
}
