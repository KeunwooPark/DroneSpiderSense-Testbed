import { Bounds, Box, FirstPersonControls, FlyControls, Line, MapControls, OrbitControls, OrthographicCamera, Sphere, useHelper } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { NextPage } from "next"
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Box3, BoxHelper, Layers, Mesh, Object3D, Scene, Vector3 } from "three";
import { nullable } from "zod";
import GameMap from "../components/GameMap";

const wallLayerNumber = 1;

interface IDroneControlProps {
    hideWalls: boolean;
}

function DroneControl(props: IDroneControlProps) {

    const speed = 0.02;
    const probDist = 0.3;
    const numProbes = 8;
    const [controlState, setControlState] = useState({forward: 0, backward: 0, right: 0, left: 0});
    const [droneWorldPosition, setDroneWorldPosition] = useState(new Vector3(0, 0, 0));
    const [raycastHitPoints, setRaycastHitPoints] = useState<Vector3[]>([]);
    const droneRef = useRef();
    const state = useThree();

    useHelper(droneRef, BoxHelper, "royalblue");

    //const raycaster = new THREE.Raycaster();
    const probes: JSX.Element[] = [];
    const probeRefs: any[] = [];

    for (let i = 0; i < numProbes; i++) {
        const angle = i * Math.PI / 4;
        const x = Math.cos(angle) * probDist;
        const y = Math.sin(angle) * probDist;
        const probeRef = useRef();
        probeRefs.push(probeRef);
        const currentTime = Date.now();
        probes.push(
            <mesh>
                <Sphere ref={probeRef} key={`drone-shpere-${i}-${currentTime}`} position={[x, y, 0]} args={[0.05]}>
                    <meshBasicMaterial key={`drone-sphere-mat-${i}-${currentTime}`} attach="material" color="red" />
                </Sphere>
            </mesh>
        );

    }

    useFrame((state) => {
        if (!props.hideWalls) {
            state.camera.layers.enable(wallLayerNumber);
        } else {
            console.log()
            state.camera.layers.disable(wallLayerNumber);
        }
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;
        const raycastHitPoints: Vector3[] = [];
        
        if (droneRef.current != null) {

            // if (checkForCollision(state.scene.children, droneRef.current)) {
            //     console.log("collision");
            // }

            const drone = droneRef.current as THREE.Mesh;
            drone.position.y += controlState.forward * speed;
            drone.position.y -= controlState.backward * speed;
            drone.position.x += controlState.right * speed;
            drone.position.x -= controlState.left * speed;

            const droneWorldPosition = new Vector3();
            drone.getWorldPosition(droneWorldPosition);
            setDroneWorldPosition(droneWorldPosition.clone());
            const raycaster = state.raycaster;
            raycaster.camera = state.camera;
            raycaster.layers.set(wallLayerNumber);

            for (const ref of probeRefs) {
                const probeMesh = ref.current as Mesh;
                if (probeMesh == null) {
                    continue;
                }
                const probeWorldPosition = new Vector3();
                probeMesh.getWorldPosition(probeWorldPosition);
                const direction = new Vector3().subVectors(probeWorldPosition, droneWorldPosition);
                direction.normalize();
                raycaster.set(droneWorldPosition.clone(), direction.clone());

                const intersects = raycaster.intersectObjects(state.scene.children);
                if (intersects.length > 0) {
                    intersects.sort((a, b) => a.distance - b.distance);
                    const closestIntersect = intersects[0]!;
                    if (closestIntersect.distance != null && closestIntersect?.distance < Infinity && closestIntersect?.point != null) {
                        raycastHitPoints.push(closestIntersect?.point!.clone());
                    }
                }
            }
            setRaycastHitPoints(raycastHitPoints);
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

    return (<mesh>
                <Sphere ref={droneRef} args={[0.15]}>
                    <meshBasicMaterial attach="material" color="blue" />
                    {probes.length > 0? probes : <></>}
                </Sphere>
                <RayCastLineGroup center={droneWorldPosition} points={raycastHitPoints} />
            </mesh>);
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

const TwoDimDroneGame: NextPage = () => {

    
    const camZoomLevel = 70;

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
                    <color args={["#1e1e1e"]} attach="background" />
                    {/* <primitive object={new THREE.AxesHelper(10)} /> */}
                    <ambientLight />
                    <DroneControl hideWalls={hideWalls} />
                    <GameMap initialWallParams={initialWallParams} />
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
