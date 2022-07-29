import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getMaxListeners } from "process";
import { RefObject, useEffect, useState } from "react";
import useInterval from "react-useinterval";
import { Intersection, Mesh, Object3D, Raycaster, Scene, Vector3 } from "three";
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

const distanceFromDrone = 0.3;
const numSubRays = 5;

export default function DistanceSensor(props: IDistanceSensorProps) {

    const [raycaster, setRaycaster] = useState<Raycaster>();
    const origin = new Vector3();
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
        const droneWorldPosition = new Vector3();
        drone.getWorldPosition(droneWorldPosition);
        
        const {hitDistance, hitDirection} = raycastInAngleRange(raycaster, droneWorldPosition, subDirections, props.angleRange, scene);
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
            return <Sphere args={[size]} position={props.direction.clone().multiplyScalar(distanceFromDrone)}> 
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

function raycastInAngleRange(raycaster: Raycaster, droneWorldPos: Vector3, subDirections: Vector3[], angleRange: number, scene: Scene): {hitDistance: number, hitDirection: Vector3} {

    let intersects: Intersection<Object3D>[] = [];
    for (const subDir of subDirections) {
        raycaster.set(droneWorldPos.clone(), subDir.clone());
        const subIntersects = raycaster.intersectObjects(scene.children);
        intersects = intersects.concat(subIntersects);
    }

    if (intersects.length > 0) {
        intersects.sort((a, b) => a.distance - b.distance);
        const closestIntersect = intersects[0]!;
        if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
            const direction = closestIntersect.point.clone().sub(droneWorldPos).normalize();
            return {hitDistance: closestIntersect.distance, hitDirection: direction};
        }
    }

    return {hitDistance: Infinity, hitDirection: new Vector3(0, 0, 0)};
}