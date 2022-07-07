import { Box, FirstPersonControls, FlyControls, MapControls, OrbitControls, OrthographicCamera, Sphere } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { NextPage } from "next"
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import TwoDimDroneGameThreeScene from "../components/TwoDimDroneGameThreeScene";

interface IWallProps {
    maxWidth: number;
    thickness: number;
    pathCenter: number;
    pathWidth: number;
    distance: number;

}

function CameraControl(props: any) {

    const speed = 0.02;
    const [controlState, setControlState] = useState({forward: 0, backward: 0, right: 0, left: 0});
    const droneRef = useRef();
    

    useFrame((state) => {
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;

        if (droneRef.current != null) {
            const drone = droneRef.current as THREE.Mesh;
            drone.position.y += controlState.forward * speed;
            drone.position.y -= controlState.backward * speed;
            drone.position.x += controlState.right * speed;
            drone.position.x -= controlState.left * speed;
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

    return <Sphere ref={droneRef} args={[0.3]}></Sphere>
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


function createRandomeWallParams(): IWallProps {
    const maxWidth = 6;
    const thickness = 0.3;
    const maxPathCenter = maxWidth - 1;
    const pathCenter = Math.random() * maxPathCenter - maxPathCenter / 2;

    let maxPathWidth = 0;
    if (pathCenter > 0) {
        maxPathWidth = maxWidth / 2 - pathCenter;
    } else {
        maxPathWidth = maxWidth / 2 + pathCenter;
    }
    
    const pathWidth = Math.random() * maxPathWidth;

    return { maxWidth, thickness, pathCenter, pathWidth, distance: 0 };
}

const TwoDimDroneGame: NextPage = () => {

    const numWalls = 50;
    const wallOffset = 1;

    const wallItems: JSX.Element[] = [];
    for (let i = 0; i < numWalls; i++) {
        const wallParams = createRandomeWallParams();
        wallParams.distance = i * wallParams.thickness + wallOffset;
        console.log(wallParams);
        wallItems.push(<Wall key={i} maxWidth={wallParams.maxWidth} thickness={wallParams.thickness} pathCenter={wallParams.pathCenter} pathWidth={wallParams.pathWidth} distance={wallParams.distance} />);
    }

    return (
        <div className="h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <div className="w-1/2 h-1/2">
                <Canvas className="" camera={{position: [0, 0, 1], zoom: 50}} orthographic>
                    <color args={["#1e1e1e"]} attach="background" />
                    <primitive object={new THREE.AxesHelper(10)} />
                    <ambientLight />
                    <CameraControl />
                    {wallItems}
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
