/*
 * @Author: smartHome
 * @Date: 2025-12-28 19:23:28
 * @LastEditors: smartHome
 * @LastEditTime: 2025-12-28 19:36:46
 * @Description: 模型加载工作者
 */

export class ModelLoadWorker {
    private worker!: Worker;
    private instance?: ModelLoadWorker;

    constructor() {
        if (this.instance) return this.instance;
        this.instance = this;

        const worker = new Worker(
            new URL("../worker/LoadModelWorker.ts", import.meta.url)
        );
        this.worker = worker;

        worker.onmessage = (e) => {
            console.log(e.data);
            if (e.data.type === "loaded") {
                console.log("模型加载完成", e.data);
            } else if (e.data.type === "error") {
                console.error(e.data);
            }
        };
        worker.postMessage({ type: "init" });

        worker.onerror = (err) => {
            console.error("模型加载work出错:", err, err.message);
        };
    }

    load(url: string) {
        this.worker.postMessage({ type: "load", url });
    }
}
