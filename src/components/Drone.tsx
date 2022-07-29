import { SphereArgs, useSphere } from "@react-three/cannon";
import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { distanceToIntensity } from "../utils/hapticRenderer";
import DistanceSensor from "./DistanceSensor";
import IHapticPacket from "./IHapticPacket";

interface IDroneProps {
    wallLayerNumber: number;
    hideRays: boolean;
    showAngleRange: boolean;
    onlyFrontSensor: boolean;
    hapticPacketQueue: IHapticPacket[];
}

interface IGamepadState {
    xAxis: number;
    yAxis: number;
}

export default function Drone(props: IDroneProps) {

    const speed = 0.02;
    const probDist = 0.3;
    const numProbes = 8;
    const sensorPollInterval = 100;
    const droneSize = 0.1;
    const [droneCollilde, setDroneCollilde] = useState(false);

    const [gamepadState, setGamepadState] = useState<IGamepadState>({xAxis: 0, yAxis: 0});
    const [distanceSensors, setDistanceSensors] = useState<JSX.Element[]>([]);

    const droneArgs: SphereArgs = [droneSize];

    const [droneRef, droneApi] = useSphere<Mesh>(() => ({ mass: 1, 
                                                        position: [0, 0, 0],
                                                        type: "Kinematic",
                                                        args: droneArgs,
                                                        collisionResponse: true,
                                                        onCollideBegin: (e) => {setDroneCollilde(true)},
                                                        onCollideEnd: (e) => {setDroneCollilde(false)},
                                                    }));

    

    useFrame((state) => {

        const diff = new Vector3(gamepadState.xAxis, -gamepadState.yAxis, 0).multiplyScalar(speed);
        const newCamPos = state.camera.position.clone().add(diff);
        state.camera.position.copy(newCamPos);

        const newDronePosition = new Vector3(newCamPos.x, newCamPos.y, 0);
        droneApi.position.copy(newDronePosition);
    });

    function pollGamepad(timestamp: number) {
        const gamepads = navigator.getGamepads().filter(g => g != null);
        
        if (gamepads.length > 0) {
            const gamepad = gamepads[0];
            const xAxis = gamepad!.axes[0] as number;
            const yAxis = gamepad!.axes[1] as number;

            setGamepadState({xAxis, yAxis});
        }
        

        requestAnimationFrame(pollGamepad);
    }

    useEffect(() => {
        pollGamepad(0);
    }, []);

    useEffect(function setSensors() {
        const distanceSensors: JSX.Element[] = [];
        const angleOffset = -Math.PI / 2;
        for (let i = 0; i < numProbes; i++) {
            const angle = i * (2 * Math.PI / numProbes) + angleOffset;
            const x = Math.cos(angle) * probDist;
            const y = Math.sin(angle) * probDist;
            const direction = new Vector3(x, y, 0);
            direction.normalize();
            
            distanceSensors.push(<DistanceSensor key={`sensor-${i}`} 
                                                id={i}
                                                droneRef={droneRef} 
                                                wallLayerNumber={props.wallLayerNumber} 
                                                direction={direction} 
                                                showRaycastLine={!props.hideRays} 
                                                showAngleRange={props.showAngleRange}
                                                angleRange={2 * Math.PI / numProbes}
                                                pollInterval={sensorPollInterval} 
                                                onDistanceChange={onSensorDistanceChange}/>);
        }
        
        setDistanceSensors(distanceSensors);
    }, [props.wallLayerNumber, props.hideRays, props.showAngleRange]);

    function onSensorDistanceChange(id: number, distance: number) {

        if (props.hapticPacketQueue == null) {
            return;
        }

        const intensity = distanceToIntensity(distance);
        props.hapticPacketQueue.push({actuatorID: id, intensity});
    }

    return (<>
                <mesh ref={droneRef}>
                    <sphereGeometry args={droneArgs}/>
                    <meshBasicMaterial attach="material" color={droneCollilde? "red" : "blue"} />
                    {props.onlyFrontSensor? distanceSensors[4] : distanceSensors}
                </mesh>
            </>);
}