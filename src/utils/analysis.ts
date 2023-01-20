import { Vector3 } from "three";
import DroneLog from "./DroneLog";

export function calculateNumCollisions(droneLogs: DroneLog[]) : number {
    let numCollisions = 0;
    let isCollide = false;

    for (const droneLog of droneLogs) {
        if (droneLog.getIsCollide()) {
            if (!isCollide) {
                numCollisions++;
                isCollide = true;
            }
        } else {
            isCollide = false;
        }
    }

    return numCollisions;
}

export function calculateCollisionDuration(droneLogs: DroneLog[]) : number { 

    let collisionDuration = 0;
    let isCollide = false;
    let startCollisionTime = 0;

    for (const droneLog of droneLogs) {
        if (!droneLog.isInMap()) {
            continue;
        }
        if (droneLog.getIsCollide()) {
            if (!isCollide) {
                startCollisionTime = droneLog.getTime();
                isCollide = true;
            }
        } else {
            if (isCollide) {
                collisionDuration += droneLog.getTime() - startCollisionTime;
                isCollide = false;
            }
        }
    }

    return collisionDuration;
}

export function calculateCompletionTime(droneLogs: DroneLog[]) : number { 

    let duration = 0;
    let isInMap = false;
    let startTime = 0;
    for (const droneLog of droneLogs) {
        if (droneLog.isInMap()) {
            if (!isInMap) {
                startTime = droneLog.getTime();
                isInMap = true;
            }
        } else {
            if (isInMap) {
                duration = (droneLog.getTime() - startTime);
                isInMap = false;
            }
        }
    }

    return duration;
}

export function calculateVelocityStats(droneLogs: DroneLog[]) : {mean: number, std: number} {
    let mean = 0;
    let std = 0;

    let numLogs = droneLogs.length;
    for (const droneLog of droneLogs) {
        const velocity = droneLog.getVelocity();
        mean += velocity.length();
    }

    mean /= numLogs;

    for (const droneLog of droneLogs) {
        let diff = droneLog.getVelocity().length() - mean;
        std += (diff * diff);
    }
    console.log(std);
    std /= numLogs;
    std = Math.sqrt(std);

    return {mean, std};
}

export function calculateMoveDistance(droneLogs: DroneLog[]) : number {
    let distance = 0;
    let prevPosition = new Vector3();
    let isFirst = true;
    for (const droneLog of droneLogs) {
        if (isFirst) {
            prevPosition = droneLog.getPosition();
            isFirst = false;
            continue;
        }
        distance += droneLog.getPosition().distanceTo(prevPosition);
        prevPosition = droneLog.getPosition();
    }

    return distance;
}