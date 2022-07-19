import { SphereArgs, useSphere } from "@react-three/cannon";
import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import DistanceSensor from "./DistanceSensor";

interface IDroneProps {
    wallLayerNumber: number;
}

export default function Drone(props: IDroneProps) {

    const speed = 0.02;
    const probDist = 0.3;
    const numProbes = 8;
    const droneSize = 0.15;
    const [controlState, setControlState] = useState({forward: 0, backward: 0, right: 0, left: 0});
    const [droneWorldPosition, setDroneWorldPosition] = useState(new Vector3(0, 0, 0));
    const [raycastHitPoints, setRaycastHitPoints] = useState<Vector3[]>([]);
    const [raycastHitDistances, setRaycastHitDistances] = useState<number[]>([]);
    const [droneCollilde, setDroneCollilde] = useState(false);

    const droneArgs: SphereArgs = [droneSize];

    const [droneRef, droneApi] = useSphere<Mesh>(() => ({ mass: 1, 
                                                        position: [0, 0, 0],
                                                        type: "Kinematic",
                                                        args: droneArgs,
                                                        collisionResponse: true,
                                                        onCollideBegin: (e) => {setDroneCollilde(true), console.log("collide begin")},
                                                        onCollideEnd: (e) => {setDroneCollilde(false), console.log("collide end")},
                                                    }));
    const probes: JSX.Element[] = [];
    const probeRefs: any[] = [];
    const sensorDirections: Vector3[] = [];

    for (let i = 0; i < numProbes; i++) {
        const angle = i * Math.PI / 4;
        const x = Math.cos(angle) * probDist;
        const y = Math.sin(angle) * probDist;
        const direction = new Vector3(x, y, 0);
        direction.normalize();
        sensorDirections.push(direction);
    }

    const distanceSensors: JSX.Element[] = [];

    for (let i = 0; i < numProbes; i++) {
        const angle = i * Math.PI / 4;
        const x = Math.cos(angle) * probDist;
        const y = Math.sin(angle) * probDist;
        const direction = new Vector3(x, y, 0);
        direction.normalize();

        distanceSensors.push(<DistanceSensor key={`sensor-${i}`} droneRef={droneRef} wallLayerNumber={props.wallLayerNumber} direction={direction} />);
    }

    useFrame((state) => {
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;
        const raycastHitPoints: Vector3[] = [];
        const raycastHitDistances: number[] = [];
        
        const newDronePosition = new Vector3(state.camera.position.x, state.camera.position.y, 0);
        droneApi.position.copy(newDronePosition);


        // const drone = droneRef.current as Mesh;
        
        // const droneWorldPosition = new Vector3();
        // drone.getWorldPosition(droneWorldPosition);
        // setDroneWorldPosition(droneWorldPosition.clone());
        // const raycaster = state.raycaster;
        // raycaster.camera = state.camera;
        // raycaster.layers.set(props.wallLayerNumber);

        // for (const direction of sensorDirections) {
        //     raycaster.set(droneWorldPosition.clone(), direction.clone());

        //     const intersects = raycaster.intersectObjects(state.scene.children);
        //     let hitDistance = Infinity;
        //     if (intersects.length > 0) {
        //         intersects.sort((a, b) => a.distance - b.distance);
        //         const closestIntersect = intersects[0]!;
        //         if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
        //             raycastHitPoints.push(closestIntersect?.point!.clone());
        //             hitDistance = closestIntersect.distance;
        //         }
        //     }
        //     raycastHitDistances.push(hitDistance);
        // }

        // setRaycastHitDistances(raycastHitDistances);
        // setRaycastHitPoints(raycastHitPoints);

    });

    useEffect(() => {
        window.addEventListener("keydown", (event) => {
            if (event.key === "w") {
                setControlState({forward: 1, backward: controlState.backward, right: controlState.right, left: controlState.left});
            }
            
            if (event.key === "s") {
                setControlState({forward: controlState.forward, backward: 1, right: controlState.right, left: controlState.left});
            }

            if (event.key === "d") {
                setControlState({forward: controlState.forward, backward: controlState.backward, right: 1, left: controlState.left});
            }

            if (event.key === "a") {
                setControlState({forward: controlState.forward, backward: controlState.backward, right: controlState.right, left: 1});
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "w") {
                setControlState({forward: 0, backward: controlState.backward, right: controlState.right, left: controlState.left});
            }
            
            if (event.key === "s") {
                setControlState({forward: controlState.forward, backward: 0, right: controlState.right, left: controlState.left});
            }

            if (event.key === "d") {
                setControlState({forward: controlState.forward, backward: controlState.backward, right: 0, left: controlState.left});
            }

            if (event.key === "a") {
                setControlState({forward: controlState.forward, backward: controlState.backward, right: controlState.right, left: 0});
            }

        });
    });

    return (<>
                <mesh ref={droneRef}>
                    <sphereGeometry args={droneArgs}/>
                    <meshBasicMaterial attach="material" color={droneCollilde? "red" : "blue"} />
                </mesh>
                {distanceSensors}
                {/* <RayCastLineGroup center={droneWorldPosition} points={raycastHitPoints} /> */}
            </>);
}

interface IRaycastLineGroupProps {
    center: Vector3;
    points: Vector3[];
}

function RayCastLineGroup(props: IRaycastLineGroupProps) {
    
    function getLines() {
        const lines: JSX.Element[] = [];
        for (let i = 0; i < props.points.length; i++) {
            const point = props.points[i]!;
            const line = <Line key={`raycastline-${i}`} points={[props.center, point]} color={"pink"} lineWidth={2} ></Line>
            lines.push(line);
        }

        return lines;
    }

    return (<>{getLines()}</>);
}

interface ISphereVizGroupProps {
    sensorDirections: Vector3[];
    sensorDistances: number[];
    distanceFromDrone: number;
}

function SphereVizGroup(props: ISphereVizGroupProps) {
    const minSphereSize = 0.01;
    const maxSphereSize = 0.1;
    const maxDistance = 100;
    function distanceToSize(distance: number): number {
        if (distance == Infinity) {
            return minSphereSize;
        }

        const size = maxSphereSize * (maxDistance - distance) / maxDistance;
        return Math.min(size, maxSphereSize);
    }

    function getSpheres() {
        const spheres: JSX.Element[] = [];
        for(let i = 0; i < props.sensorDirections.length; i++) {
            const direction = props.sensorDirections[i]!;
            const distance = props.sensorDistances[i]!;
            const size = distanceToSize(distance);
            const sphere = <Sphere key={`viz-sphere-${i}`} args={[size]} position={direction.clone().multiplyScalar(props.distanceFromDrone)}></Sphere>
            spheres.push(sphere);
        }
    }

    return (<>{getSpheres()}</>);
}