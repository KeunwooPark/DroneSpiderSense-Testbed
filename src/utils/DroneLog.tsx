import { Euler, Quaternion, Vector3 } from "three";

export default class DroneLog {
    private posX: number;
    private posY: number;
    private posZ: number;
    private rotX: number;
    private rotY: number;
    private rotZ: number;
    private time: number;
    private isCollide: boolean;
    private foundTarget: boolean;

    constructor(pos: Vector3, heading: Quaternion, isCollide: boolean, foundTarget: boolean) {
        this.posX = pos.x;
        this.posY = pos.y;
        this.posZ = pos.z;

        const headingVec = new Euler();
        headingVec.setFromQuaternion(heading);

        this.rotX = headingVec.x;
        this.rotY = headingVec.y;
        this.rotZ = headingVec.z;

        this.isCollide = isCollide;
        this.foundTarget = foundTarget;

        this.time = Date.now();
    }

    toJSONString(): string {
        return JSON.stringify({
            posX: this.posX,
            posY: this.posY,
            posZ: this.posZ,
            rotX: this.rotX,
            rotY: this.rotY,
            rotZ: this.rotZ,
            isCollide: this.isCollide,
            foundTarget: this.foundTarget,
            time: this.time
        });
    }
}