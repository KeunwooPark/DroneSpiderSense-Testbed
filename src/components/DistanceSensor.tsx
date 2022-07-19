import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getMaxListeners } from "process";
import { RefObject, useEffect, useState } from "react";
import { Mesh, Raycaster, Vector3 } from "three";

interface IDistanceSensorProps {
    droneRef: RefObject<Mesh>;
    direction: Vector3;
    wallLayerNumber: number;
}

export default function DistanceSensor(props: IDistanceSensorProps) {

    const [raycaster, setRaycaster] = useState<Raycaster>();
    const [droneWorldPosition, setDroneWorldPosition] = useState(new Vector3(0, 0, 0));
    const [raycastHitPoint, setRaycastHitPoint] = useState(new Vector3(0, 0, 0));
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
        setDroneWorldPosition(droneWorldPosition.clone());

        raycaster.set(droneWorldPosition.clone(), props.direction.clone());
        const intersects = raycaster.intersectObjects(state.scene.children);

        let hitDistance = Infinity;
        let raycastHitPoint: Vector3 | null = null;
        let isHit = false;
        if (intersects.length > 0) {
            intersects.sort((a, b) => a.distance - b.distance);
            const closestIntersect = intersects[0]!;
            if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
                raycastHitPoint = closestIntersect?.point!.clone();
                hitDistance = closestIntersect.distance;
                isHit = true;
            }
        }

        setIsHit(isHit);

        if (raycastHitPoint == null) {
            setRaycastHitPoint(new Vector3(0, 0, 0));
        } else {
            setRaycastHitPoint(raycastHitPoint);
        }
    });

    function getLine() {
        if(isHit) {
            return <Line points={[droneWorldPosition, raycastHitPoint]} color={"pink"} lineWidth={2} ></Line>
        } else {
            return <></>;
        }
    }

    return <>
        {getLine()}
    </>;
}