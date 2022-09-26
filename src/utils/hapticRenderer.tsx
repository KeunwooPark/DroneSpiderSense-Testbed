import { config } from "./config";

const maxDistance = config.haptic.maxDistance as number;
const minIntensity = config.haptic.minIntensity as number;
const maxIntensity = config.haptic.maxIntensity as number;

export function distanceToIntensity(distance: number) {
    const reverseDistance = maxDistance - distance;

    if (reverseDistance < 0) {
        return minIntensity;
    }

    const floatIntensity = maxIntensity * reverseDistance / maxDistance;
    const intIntensity = Math.round(floatIntensity);

    if (intIntensity < minIntensity) {
        return minIntensity;
    } else if (intIntensity > maxIntensity) {
        return maxIntensity;
    }
    return intIntensity;
}

export function sensorIdToActuatorID(sensorID: number) {
    return (( 8- sensorID) + 1) % 8;
}

const minSize = 0;
const maxSize = 0.15;

export function distanceToSize(distance: number) {
    const reverseDistance = maxDistance - distance;
    
    if (reverseDistance < 0) {
        return minSize;
    }

    const size = maxSize * reverseDistance / maxDistance;

    return Math.min(size, maxSize);
}