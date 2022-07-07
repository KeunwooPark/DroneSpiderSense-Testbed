import { Box, FirstPersonControls, FlyControls, MapControls, OrbitControls, OrthographicCamera, Sphere } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { NextPage } from "next"
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import TwoDimDroneGameThreeScene from "../components/TwoDimDroneGameThreeScene";

interface IWallProps {
    maxWidth: number;
    minPathWidth: number;
    thickness: number;
    pathCenter: number;
    pathWidth: number;
    distance: number;

}

function DroneControl(props: any) {

    const speed = 0.02;
    const probDist = 0.3;
    const numProbes = 8;
    const [controlState, setControlState] = useState({forward: 0, backward: 0, right: 0, left: 0});
    const droneRef = useRef();

    const probes: JSX.Element[] = [];
    const probeRefs: any[] = [];

    for (let i = 0; i < numProbes; i++) {
        const angle = i * Math.PI / 4;
        const x = Math.cos(angle) * probDist;
        const y = Math.sin(angle) * probDist;
        const probeRef = useRef();
        probeRefs.push(probeRef);
        probes.push(
            <mesh>
                <Sphere ref={probeRef} key={i + numProbes} position={[x, y, 0]} args={[0.05]}>
                    <meshBasicMaterial key={i + numProbes * 2} attach="material" color="red" />
                </Sphere>
            </mesh>
        );

    }

    useFrame((state) => {
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;
        
        const distances: number[] = [];

        if (droneRef.current != null) {
            const drone = droneRef.current as THREE.Mesh;
            drone.position.y += controlState.forward * speed;
            drone.position.y -= controlState.backward * speed;
            drone.position.x += controlState.right * speed;
            drone.position.x -= controlState.left * speed;
            
            for (const ref of probeRefs) {
                const probeMesh = ref.current as Mesh;
                const direction = new Vector3().subVectors(probeMesh.position, drone.position).normalize();

                const raycaster = new THREE.Raycaster(probeMesh.position, direction, 0, 100);
                const intersects = raycaster.intersectObjects(state.scene.children);
                const reasonableIntersects = intersects.filter(intersect => intersect.distance > 0 && intersect.distance < Infinity);
                if (reasonableIntersects.length > 0) {
                    const minDistance = Math.min(...reasonableIntersects.map(i => i.distance));
                    distances.push(minDistance);
                } else {
                    distances.push(Infinity);
                }
            }
            
        }
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

    return <mesh>
                <Sphere ref={droneRef} args={[0.15]}>
                    <meshBasicMaterial attach="material" color="blue" />
                    {probes}
                </Sphere>
            </mesh>
}

function Wall(props: IWallProps) {
    const { maxWidth, thickness, pathCenter, pathWidth, distance } = props;

    const rightWallLeftMost = pathCenter + pathWidth / 2;
    const rightWallRightMost = maxWidth / 2;

    const rightWallLength = rightWallRightMost - rightWallLeftMost;
    const rightWallHeight = thickness;
    const rightWallPosX = (rightWallLeftMost + rightWallRightMost) / 2;

    const leftWallLeftMost = -maxWidth / 2;
    const leftWallRightMost = pathCenter - pathWidth / 2;
    const leftWallLength = leftWallRightMost - leftWallLeftMost;
    const leftWallHeight = thickness;
    const leftWallPosX = (leftWallLeftMost + leftWallRightMost) / 2; 

    return (<mesh>
            <Box position={[rightWallPosX, distance, 0]} args={[rightWallLength, rightWallHeight, 1]}></Box>
            <Box position={[leftWallPosX, distance, 0]} args={[leftWallLength, leftWallHeight, 1]}></Box>
        </mesh>);
}

function minMaxRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function createRandomeWallParams(prevParams: IWallProps): IWallProps {
    const maxWidth = prevParams.maxWidth;
    const thickness = prevParams.thickness;
    const minPathWidth = prevParams.minPathWidth;
    const pathCenter = minMaxRandom(prevParams.pathCenter - prevParams.pathWidth / 4, prevParams.pathCenter + prevParams.pathWidth / 4);

    let maxPathWidth = 0;
    if (pathCenter > 0) {
        maxPathWidth = maxWidth / 2 - pathCenter;
    } else {
        maxPathWidth = maxWidth / 2 + pathCenter;
    }

    const pathWidth = minMaxRandom(minPathWidth, maxPathWidth);

    return { maxWidth, thickness, pathCenter, pathWidth, distance: 0, minPathWidth };
}

const TwoDimDroneGame: NextPage = () => {

    const numWalls = 50;
    const wallOffset = 1;

    const wallItems: JSX.Element[] = [];
    let prevParams: IWallProps = {maxWidth: 6, thickness: 0.3, pathCenter: 0, pathWidth: 0, distance: 0, minPathWidth: 0.3};
    for (let i = 0; i < numWalls; i++) {
        const wallParams = createRandomeWallParams(prevParams);
        wallParams.distance = i * wallParams.thickness + wallOffset;
        wallItems.push(<Wall key={i} maxWidth={wallParams.maxWidth} thickness={wallParams.thickness} pathCenter={wallParams.pathCenter} pathWidth={wallParams.pathWidth} distance={wallParams.distance} minPathWidth={wallParams.minPathWidth} />);
        prevParams = wallParams;
    }

    return (
        <div className="h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <div className="w-1/2 h-1/2">
                <Canvas className="" camera={{position: [0, 0, 1], zoom: 50}} orthographic>
                    <color args={["#1e1e1e"]} attach="background" />
                    <primitive object={new THREE.AxesHelper(10)} />
                    <ambientLight />
                    <DroneControl />
                    {wallItems}
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
