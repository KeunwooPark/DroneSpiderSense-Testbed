import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getMaxListeners } from "process";
import { RefObject, useEffect, useState } from "react";
import { Mesh, Raycaster, Scene, Vector3 } from "three";

interface IDistanceSensorProps {
    droneRef: RefObject<Mesh>;
    direction: Vector3;
    wallLayerNumber: number;
    showRaycastLine: boolean;
    angleRange: number;
}

const distanceFromDrone = 0.2;
const numSubRays = 5;

export default function DistanceSensor(props: IDistanceSensorProps) {

    const [raycaster, setRaycaster] = useState<Raycaster>();
    const origin = new Vector3();
    const [raycastHitPoint, setRaycastHitPoint] = useState(new Vector3(0, 0, 0));
    const [raycastHitDistance, setRaycastHitDistance] = useState(Infinity);
    const [isHit, setIsHit] = useState(false);

    useEffect(() => {
        const raycaster = new Raycaster();
        raycaster.layers.set(props.wallLayerNumber);
        setRaycaster(raycaster);
    }, []);

    useFrame((state) => {
        if (raycaster == null) {
            return;
        }

        if (props.droneRef == null || props.droneRef.current == null) {
            return;
        }

        if (props.direction == null) {
            return;
        }

        const drone = props.droneRef.current as Mesh;
        
        const droneWorldPosition = new Vector3();
        drone.getWorldPosition(droneWorldPosition);
        
        const {hitDistance, hitDirection} = raycastInAngleRange(raycaster, droneWorldPosition, props.direction, props.angleRange, state.scene);
        const raycastHitPoint = hitDirection.clone().multiplyScalar(hitDistance);
        // raycaster.set(droneWorldPosition.clone(), props.direction.clone());
        // const intersects = raycaster.intersectObjects(state.scene.children);

        // let hitDistance = Infinity;
        // let raycastHitPoint: Vector3 | null = null;
        // let isHit = false;
        // let raycastHitDistance = Infinity;
        // if (intersects.length > 0) {
        //     intersects.sort((a, b) => a.distance - b.distance);
        //     const closestIntersect = intersects[0]!;
        //     if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
        //         raycastHitPoint = closestIntersect?.point!.clone();
        //         hitDistance = closestIntersect.distance;
        //         isHit = true;
        //     }
        // }

        setRaycastHitDistance(hitDistance);
        const isHit = hitDistance < Infinity;
        setIsHit(isHit);

        if (isHit) {
            setRaycastHitPoint(raycastHitPoint);
        } else {
            setRaycastHitPoint(new Vector3(0, 0, 0));
        }
    });

    function getLine() {
        if(props.showRaycastLine && isHit) {
            return <Line points={[origin, raycastHitPoint]} color={"pink"} lineWidth={2} ></Line>
        } else {
            return <></>;
        }
    }

    function getSphere() {
        if(isHit) {
            return <Sphere args={[0.02]} position={props.direction.clone().multiplyScalar(distanceFromDrone)}> 
                <meshBasicMaterial color={"red"} />
            </Sphere>
        } else {
            return <></>;
        }
    }

    return <>
        {getLine()}
        {getSphere()}
    </>;
}

function raycastInAngleRange(raycaster: Raycaster, droneWorldPos: Vector3, direction: Vector3, angleRange: number, scene: Scene): {hitDistance: number, hitDirection: Vector3} {
    const subDirections: Vector3[] = [];

    const zAxis = new Vector3(0, 0, 1);
    const midAngle = angleRange / 2;
    for (let i = 0; i < numSubRays; i++) {
        const rotAngle = angleRange / numSubRays * i - midAngle;
        const subDir = direction.clone().applyAxisAngle(zAxis, rotAngle);
        subDirections.push(subDir);
    }

    for (const subDir of subDirections) {
        raycaster.set(droneWorldPos.clone(), subDir.clone());
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            intersects.sort((a, b) => a.distance - b.distance);
            const closestIntersect = intersects[0]!;
            if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
                return {hitDistance: closestIntersect.distance, hitDirection: subDir};
            }
        }
    }

    return {hitDistance: Infinity, hitDirection: new Vector3()};
}