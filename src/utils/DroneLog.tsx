import { Euler, Quaternion, Vector3 } from "three";

export default class DroneLog {

    static parse(text: string): DroneLog {
        const obj = JSON.parse(text);
        const log = new DroneLog(new Vector3(), new Quaternion(), new Vector3(), 0, false, false, false);
        log.posX = obj.posX;
        log.posY = obj.posY;
        log.posZ = obj.posZ;
        log.rotX = obj.rotX;
        log.rotY = obj.rotY;
        log.rotZ = obj.rotZ;
        log.velX = obj.velX;
        log.velY = obj.velY;
        log.velZ = obj.velZ;
        log.angVel = obj.angVel;
        log.isCollide = obj.isCollide;
        log.foundTarget = obj.foundTarget;
        log.time = obj.time;

        return log;
    }

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
    private inMap: boolean;

    constructor(pos: Vector3, rot: Quaternion, vel: Vector3, angVel: number, isCollide: boolean, foundTarget: boolean, crossingMap: boolean) {
        this.posX = pos.x;
        this.posY = pos.y;
        this.posZ = pos.z;

        const rotation = new Euler();
        rotation.setFromQuaternion(rot);

        this.rotX = rotation.x;
        this.rotY = rotation.y;
        this.rotZ = rotation.z;

        this.velX = vel.x;
        this.velY = vel.y;
        this.velZ = vel.z;

        this.angVel = angVel;

        this.isCollide = isCollide;
        this.foundTarget = foundTarget;
        this.inMap = crossingMap;

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
            inMap: this.inMap,
            time: this.time
        });
    }

    getHeading(): Vector3 {
        const frontDirection = new Vector3(0, 1, 0);
        return frontDirection.applyEuler(new Euler(this.rotX, this.rotY, this.rotZ));
    }

    getVelocity(): Vector3 {
        return new Vector3(this.velX, this.velY, this.velZ);
    }
}