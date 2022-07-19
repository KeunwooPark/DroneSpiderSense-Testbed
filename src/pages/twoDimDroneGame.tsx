import { Debug, Physics, SphereArgs, Triplet, useBox, useSphere } from "@react-three/cannon";
import { Line, Sphere, useHelper } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { NextPage } from "next"
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BoxHelper, Mesh, Vector3 } from "three";
import Drone from "../components/Drone";
import GameMap from "../components/GameMap";

const wallLayerNumber = 1;
const camZoomLevel = 150;

const TwoDimDroneGame: NextPage = () => {

    

    const [hideWalls, setHideWalls] = useState(false);
    const initialWallParams = {maxWidth: 6, thickness: 0.3, pathCenter: 0, pathWidth: 0, distance: 0, minPathWidth: 0.3, layerNumber: wallLayerNumber };

    function handleHideWallsClick() {
        setHideWalls(!hideWalls);
    }

    return (
        <div className="h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleHideWallsClick}>{hideWalls? "show walls" : "hide walls"}</button>
            <div className="w-1/2 h-1/2">
                <Canvas className="" camera={{position: [0, 0, 1], zoom: camZoomLevel}} orthographic>
                    <color args={["#000000"]} attach="background" />
                    <Physics>
                        {/* <primitive object={new THREE.AxesHelper(10)} /> */}
                        {/* <OrbitControls /> */}
                        <ambientLight />
                        <Drone wallLayerNumber={wallLayerNumber} />
                        <GameMap initialWallParams={initialWallParams} hideWalls={hideWalls} wallLayerNumber={wallLayerNumber} />
                    </Physics>
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
