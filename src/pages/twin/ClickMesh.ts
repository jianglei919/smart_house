/*
 * @Author: hongbin
 * @Date: 2023-04-10 15:19:19
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-22 14:24:47
 * @Description: 鼠标选中物体
 */
import { ThreeHelper } from "@/src/ThreeHelper";
import { Raycaster, Vector2 } from "three";

export class ClickMesh {
    private raycaster: Raycaster;
    private pointer = new Vector2();
    destroy: () => void;
    private _click = (m?: Mesh) => {
        console.log("显示信息");
    };
    private _dblclick = (m?: Mesh) => {
        console.log("开关切换");
    };

    constructor() {
        this.raycaster = new Raycaster();

        let time: NodeJS.Timeout;

        /**
         * 鼠标单击物体
         */
        const click = ({ clientX, clientY }: MouseEvent) => {
            clearTimeout(time);
            time = setTimeout(() => {
                this.intersect(clientX, clientY, (mesh) => {
                    this._click(mesh);
                });
            }, 200);
        };

        /**
         * 鼠标双击物体
         */
        const dblclick = ({ clientX, clientY }: MouseEvent) => {
            clearTimeout(time);
            this.intersect(clientX, clientY, (mesh) => {
                this._dblclick(mesh);
            });
        };

        document.addEventListener("click", click);
        document.addEventListener("dblclick", dblclick);
        this.destroy = () => {
            document.removeEventListener("click", click);
            document.removeEventListener("dblclick", dblclick);
        };
    }

    private intersect(x: number, y: number, call: (m?: Mesh) => void) {
        const { offsetWidth, offsetHeight } =
            ThreeHelper.instance.renderer.domElement;

        this.pointer.set(
            (x / offsetWidth) * 2 - 1,
            -(y / offsetHeight) * 2 + 1
        );
        this.raycaster.setFromCamera(this.pointer, ThreeHelper.instance.camera);

        const intersects = this.raycaster.intersectObjects(
            ThreeHelper.instance.scene.children,
            true
        );

        call(intersects[0]?.object as unknown as Mesh);
    }

    click(_click: (m?: Mesh) => void) {
        this._click = _click;
    }

    dblclick(_dblclick: (m?: Mesh) => void) {
        this._dblclick = _dblclick;
    }
}
