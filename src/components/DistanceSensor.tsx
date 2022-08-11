import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RefObject, useEffect, useState } from "react";
import useInterval from "react-useinterval";
import { Intersection, Mesh, Object3D, Raycaster, Scene, Vector, Vector3 } from "three";
import { config } from "../utils/config";
import { distanceToSize } from "../utils/hapticRenderer";

interface IDistanceSensorProps {
    droneRef: RefObject<Mesh>;
    direction: Vector3;
    wallLayerNumber: number;
    angleRange: number;
    showRaycastLine: boolean;
    showAngleRange: boolean;
    showSphere: boolean;
    id: number;
    pollInterval: number;
    onDistanceChange: (id: number, distance: number) => void;
}

export default function DistanceSensor(props: IDistanceSensorProps) {

    const [raycaster, setRaycaster] = useState<Raycaster>();
    const origin = new Vector3(0, 0, 0);
    const [raycastHitPoint, setRaycastHitPoint] = useState(new Vector3(0, 0, 0));
    const [raycastHitDistance, setRaycastHitDistance] = useState(Infinity);
    const [isHit, setIsHit] = useState(false);

    const [subDirections, setSubDirections] = useState<Vector3[]>([]);

    useEffect(() => {
        const raycaster = new Raycaster();
        raycaster.layers.set(props.wallLayerNumber);
        setRaycaster(raycaster);

        const subDirections: Vector3[] = [];
        const zAxis = new Vector3(0, 0, 1);
        const numSubRays = config.drone.sensor.numSubRays as number;

        const midAngle = props.angleRange / 2;
        const angleStep = props.angleRange / (numSubRays - 1);
        const startingDirection = props.direction.clone().applyAxisAngle(zAxis, -midAngle);
        
        for (let i = 0; i < numSubRays; i++) {
            const rotAngle = (angleStep * i);
            const subDir = startingDirection.clone().applyAxisAngle(zAxis, rotAngle);
            subDirections.push(subDir);
        }

        setSubDirections(subDirections);
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

        if (subDirections == null || subDirections.length == 0) {
            return;
        }

        const drone = props.droneRef.current as Mesh;
    
        // local coordinates
        const {hitDistance, hitDirection} = raycast(drone, state.scene, raycaster);
        const raycastHitPoint = hitDirection.clone().multiplyScalar(hitDistance);

        setRaycastHitDistance(hitDistance);
        
        const isHit = hitDistance < Infinity;
        setIsHit(isHit);

        if (isHit) {
            setRaycastHitPoint(raycastHitPoint);
        } else {
            setRaycastHitPoint(new Vector3(0, 0, 0));
        }
    });

    useInterval(() => {
        props.onDistanceChange(props.id, raycastHitDistance);
    }, props.pollInterval);

    function raycast(drone: Mesh, scene: Scene, raycaster: Raycaster): {hitDistance: number, hitDirection: Vector3} {
        const {hitDistance, hitDirection} = raycastInAngleRange(raycaster, drone, subDirections, scene);
        return {hitDistance, hitDirection};
    }

    function getLine() {
        if(props.showRaycastLine && isHit) {
            return <Line points={[origin, raycastHitPoint]} color={"green"} lineWidth={2} ></Line>
        } else {
            return <></>;
        }
    }

    function getSphere() {

        if (!props.showSphere) {
            return <></>;
        }

        if(isHit) {
            const size = distanceToSize(raycastHitDistance);
            const sensorDistance = config.drone.sensorDistance;
            return <Sphere args={[size]} position={props.direction.clone().multiplyScalar(sensorDistance)}> 
                <meshBasicMaterial color={"red"} />
            </Sphere>
        } else {
            return <></>;
        }
    }

    function getRangeLine() {

        if (!props.showAngleRange || subDirections == null) {
            return;
        }

        const rangeLines: JSX.Element[] = [];
        for (const direction of subDirections) {
            const endPoint = direction.clone().multiplyScalar(1);
            rangeLines.push(<Line points={[origin, endPoint]} color={"red"} lineWidth={1} ></Line>);
        }

        return rangeLines;
    }

    return <>
        {getLine()}
        {getSphere()}
        {getRangeLine()}
    </>;
}

function raycastInAngleRange(raycaster: Raycaster, drone: Mesh, subDirections: Vector3[], scene: Scene): {hitDistance: number, hitDirection: Vector3} {
    const droneWorldPos = new Vector3();
    drone.getWorldPosition(droneWorldPos);

    let intersects: Intersection<Object3D>[] = [];
    for (const subDir of subDirections) {
        const subDirInWorld = drone.localToWorld(subDir.clone()).sub(droneWorldPos).normalize();
        raycaster.set(droneWorldPos.clone(), subDirInWorld.clone());
        const subIntersects = raycaster.intersectObjects(scene.children);
        intersects = intersects.concat(subIntersects);
    }

    const intersectsAsLocal: {distance: number, point: Vector3}[] = intersects.map(intersect => {
        const localIntersect = drone.worldToLocal(intersect.point.clone());
        return {distance: localIntersect.length(), point: localIntersect};
    });
    intersectsAsLocal.sort((a, b) => a.distance - b.distance);

    if (intersectsAsLocal.length > 0) {
        const closestIntersect = intersectsAsLocal[0]!;
        if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
            const localDirection = closestIntersect.point.clone().normalize();
            // const worldDirection = drone.localToWorld(localDirection);
            // const localDirection = drone.worldToLocal(worldDirection);
            return {hitDistance: closestIntersect.distance, hitDirection: localDirection};
        }
    }

    return {hitDistance: Infinity, hitDirection: new Vector3(0, 0, 0)};
}