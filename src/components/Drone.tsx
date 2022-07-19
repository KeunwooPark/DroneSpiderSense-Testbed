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
    const [droneCollilde, setDroneCollilde] = useState(false);

    const droneArgs: SphereArgs = [droneSize];

    const [droneRef, droneApi] = useSphere<Mesh>(() => ({ mass: 1, 
                                                        position: [0, 0, 0],
                                                        type: "Kinematic",
                                                        args: droneArgs,
                                                        collisionResponse: true,
                                                        onCollideBegin: (e) => {setDroneCollilde(true)},
                                                        onCollideEnd: (e) => {setDroneCollilde(false)},
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
        
        distanceSensors.push(<DistanceSensor key={`sensor-${i}`} 
                                            droneRef={droneRef} 
                                            wallLayerNumber={props.wallLayerNumber} 
                                            direction={direction} 
                                            showRaycastLine={true} 
                                            angleRange={2 * Math.PI / numProbes} />);
    }

    useFrame((state) => {
        state.camera.position.y += controlState.forward * speed;
        state.camera.position.y -= controlState.backward * speed;
        state.camera.position.x += controlState.right * speed;
        state.camera.position.x -= controlState.left * speed;

        const newDronePosition = new Vector3(state.camera.position.x, state.camera.position.y, 0);
        droneApi.position.copy(newDronePosition);

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
                    {distanceSensors}
                </mesh>
                {/* <RayCastLineGroup center={droneWorldPosition} points={raycastHitPoints} /> */}
            </>);
}