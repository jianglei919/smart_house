/*
 * @Author: smartHome
 * @Date: 2025-11-08 11:59:46
 * @LastEditors: smartHome
 * @LastEditTime: 2025-11-22 16:17:48
 * @Description:下降 落下
 */

export class FallHelper {
    time = 0;

    compute() {
        // exp(0) === 1
        return Math.exp(this.time) - 1;
    }

    computeDistance(time: number) {
        this.time += time;
        return this.compute();
    }

    resetTime() {
        this.time = 0;
    }
}
