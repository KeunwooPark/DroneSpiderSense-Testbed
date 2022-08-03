import { SphereArgs, useSphere } from "@react-three/cannon";
import { Line, OrbitControls, OrthographicCamera, PerspectiveCamera, Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Camera, MathUtils, Mesh, Vector3 } from "three";
import * as THREE from "three";
import { distanceToIntensity } from "../utils/hapticRenderer";
import DistanceSensor from "./DistanceSensor";
import IHapticPacket from "./IHapticPacket";
import CameraControl from "./CameraControl";

interface IDroneProps {
    wallLayerNumber: number;
    hideRays: boolean;
    showAngleRange: boolean;
    onlyFrontSensor: boolean;
    hideSpheres: boolean;
    hapticPacketQueue: IHapticPacket[];
    firstPersonView: boolean;
    hideWalls: boolean;
}

interface IGamepadState {
    xAxis: number;
    yAxis: number;
    yaw: number;
}

const deadzone = 0.1;

export default function Drone(props: IDroneProps) {

    const speed = 0.5;
    const rotationSpeed = MathUtils.degToRad(10);
    const probDist = 0.3;
    const numProbes = 8;
    const sensorPollInterval = 100;
    const droneSize = 0.1;
    const [droneCollilde, setDroneCollilde] = useState(false);

    const [gamepadState, setGamepadState] = useState<IGamepadState>({xAxis: 0, yAxis: 0, yaw: 0});
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

        if (droneRef.current == null) {
            return;
        }

        const drone = droneRef.current as Mesh;
        const droneWorldPos = new Vector3();
        droneRef.current?.getWorldPosition(droneWorldPos);

        const translateVelocity = new Vector3(gamepadState.xAxis, -gamepadState.yAxis, 0).multiplyScalar(speed);
        const translateVelocityInWorld = drone.localToWorld(translateVelocity.clone()).sub(droneWorldPos);
        droneApi.velocity.set(translateVelocityInWorld.x, translateVelocityInWorld.y, translateVelocityInWorld.z);


        const angularSpeed = - gamepadState.yaw * speed;
        droneApi.angularVelocity.set(0, 0, angularSpeed);
    });

    function pollGamepad(timestamp: number) {
        const gamepads = navigator.getGamepads().filter(g => g != null);
        
        if (gamepads.length > 0) {
            const gamepad = gamepads[0];
            let xAxis = gamepad!.axes[0] as number;
            let yAxis = gamepad!.axes[1] as number;
            let yaw = gamepad!.axes[2] as number;

            xAxis = applyDeadzone(xAxis, deadzone);
            yAxis = applyDeadzone(yAxis, deadzone);
            yaw = applyDeadzone(yaw, deadzone);
            setGamepadState({xAxis, yAxis, yaw});
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
                                                showSphere={!props.hideSpheres}
                                                onDistanceChange={onSensorDistanceChange}/>);
        }
        
        setDistanceSensors(distanceSensors);
    }, [props.wallLayerNumber, props.hideRays, props.showAngleRange, props.hideSpheres]);

    function onSensorDistanceChange(id: number, distance: number) {

        if (props.hapticPacketQueue == null) {
            return;
        }

        const intensity = distanceToIntensity(distance);
        props.hapticPacketQueue.push({actuatorID: id, intensity});
    }

    return (<>
                <mesh ref={droneRef}>
                    <CameraControl firstPersonView={props.firstPersonView} hideWalls={props.hideWalls} wallLayerNumber={props.wallLayerNumber} />
                    <sphereGeometry args={droneArgs}/>
                    <pointLight position={[0, 0, 1]} />
                    <meshBasicMaterial attach="material" color={droneCollilde? "red" : "blue"} />
                    {props.onlyFrontSensor? distanceSensors[4] : distanceSensors}
                </mesh>
            </>);
}

function applyDeadzone(value: number, deadzone: number): number {
    if (Math.abs(value) < deadzone) {
        return 0;
    }
    return value;
}