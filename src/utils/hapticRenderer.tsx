export const maxDistance = 2;
export const minIntensity = 0;
export const maxIntensity = 100;

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