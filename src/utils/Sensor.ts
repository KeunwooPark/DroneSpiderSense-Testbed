import { Vector3 } from "three";
import { config } from "./config";

export function calculateSensorDirection(sensorIdx: number): Vector3 {
    const numProbes = config.drone.numProbes as number;
    const sensorDistance = config.drone.sensorDistance as number;
    const angle = sensorIdx * (2 * Math.PI / numProbes);

    const x = Math.cos(angle) * sensorDistance;
    const y = Math.sin(angle) * sensorDistance;
    const direction = new Vector3(x, y, 0);
    return direction.normalize();
}