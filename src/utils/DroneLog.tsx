import { Euler, Quaternion, Vector3 } from "three";

export default class DroneLog {
    private posX: number;
    private posY: number;
    private posZ: number;
    private rotX: number;
    private rotY: number;
    private rotZ: number;
    private time: number;
    private velX: number;
    private velY: number;
    private velZ: number;
    private angVel: number; // only yaw
    private isCollide: boolean;
    private foundTarget: boolean;

    constructor(pos: Vector3, rot: Quaternion, vel: Vector3, angVel: number, isCollide: boolean, foundTarget: boolean) {
        this.posX = pos.x;
        this.posY = pos.y;
        this.posZ = pos.z;

        const headingVec = new Euler();
        headingVec.setFromQuaternion(rot);

        this.rotX = headingVec.x;
        this.rotY = headingVec.y;
        this.rotZ = headingVec.z;

        this.velX = vel.x;
        this.velY = vel.y;
        this.velZ = vel.z;

        this.angVel = angVel;

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
            velX: this.velX,
            velY: this.velY,
            velZ: this.velZ,
            angVel: this.angVel,
            isCollide: this.isCollide,
            foundTarget: this.foundTarget,
            time: this.time
        });
    }
}