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