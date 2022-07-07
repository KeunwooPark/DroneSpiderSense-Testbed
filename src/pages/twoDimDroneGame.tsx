import { Box, FirstPersonControls, FlyControls, MapControls, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
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
    const boxRef = useRef();

    useFrame((state) => {
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;

        if (boxRef.current != null) {
            const box = boxRef.current as THREE.Mesh;
            box.position.y += controlState.forward * speed;
            box.position.y -= controlState.backward * speed;
            box.position.x += controlState.right * speed;
            box.position.x -= controlState.left * speed;
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

    return <Box ref={boxRef} args={[1, 1, 1]}></Box>
}

function Wall(props: IWallProps) {

}

const TwoDimDroneGame: NextPage = () => {
    return (
        <div className="h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <div className="w-1/2 h-1/2">
                <Canvas className="">
                    <color args={["#1e1e1e"]} attach="background" />
                    <primitive object={new THREE.AxesHelper(10)} />
                    <ambientLight />
                    <CameraControl />
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
