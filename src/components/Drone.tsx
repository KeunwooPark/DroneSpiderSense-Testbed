import { SphereArgs, useSphere } from "@react-three/cannon";
import { Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Euler, Layers, Mesh, Quaternion, Vector3 } from "three";
import { distanceToIntensity, sensorIdToActuatorID } from "../utils/hapticRenderer";
import DistanceSensor from "./DistanceSensor";
import IHapticPacket from "./IHapticPacket";
import CameraControl from "./CameraControl";
import { config } from "../utils/config";
import DroneLog from "../utils/DroneLog";
import saveAs from "file-saver";
import DroneSensorsHUD from "./DroneSensorsHud";

interface IDroneProps {
    hideRays: boolean;
    showAngleRange: boolean;
    onlyFrontSensor: boolean;
    hideSpheres: boolean;
    hapticPacketQueue: IHapticPacket[];
    firstPersonView: boolean;
    hideWalls: boolean;
    logging: boolean;
}

interface IGamepadState {
    xAxis: number;
    yAxis: number;
    yaw: number;
}

const cellLayers = new Layers();
cellLayers.set(config.game.map.cellLayer);

export default function Drone(props: IDroneProps) {

    const [cellCollide, setCellCollide] = useState(false);
    const [targetCollide, setTargetColllide] = useState(false);

    const [gamepadState, setGamepadState] = useState<IGamepadState>({xAxis: 0, yAxis: 0, yaw: 0});
    const [distanceSensors, setDistanceSensors] = useState<JSX.Element[]>([]);
    const [distanceSensorDirections, setDistanceSensorDirections] = useState<Vector3[]>([]);
    const [distanceSensorValues, setDistanceSensorValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
    const [logs, setLogs] = useState<DroneLog[]>([]);
    const [isLogging, setIsLogging] = useState(false);
    const [hapticPacketsForHUD, setHapticPacketsForHUD] = useState<IHapticPacket[]>([]);
    
    const droneArgs: SphereArgs = [config.drone.size as number];

    const [droneRef, droneApi] = useSphere<Mesh>(() => ({ mass: 1, 
                                                        position: [0, 0, 0],
                                                        type: "Kinematic",
                                                        args: droneArgs,
                                                        collisionResponse: true,
                                                        onCollideBegin: (e) => {
                                                            if (e.body.layers.test(cellLayers)) {
                                                                setCellCollide(true);
                                                            } else {
                                                                setTargetColllide(true);
                                                            }
                                                        },
                                                        onCollideEnd: (e) => {
                                                            if (e.body.layers.test(cellLayers)) {
                                                                setCellCollide(false);
                                                            } else {
                                                                setTargetColllide(false);
                                                            }
                                                        },
                                                    }));
    

    useFrame((state) => {

        if (droneRef.current == null) {
            return;
        }

        const drone = droneRef.current as Mesh;
        const droneWorldPos = new Vector3();
        drone.getWorldPosition(droneWorldPos);

        const speedGain = config.drone.speedGain as number;
        const translateVelocity = new Vector3(gamepadState.xAxis, -gamepadState.yAxis, 0).multiplyScalar(speedGain);
        const translateVelocityInWorld = drone.localToWorld(translateVelocity.clone()).sub(droneWorldPos);
        droneApi.velocity.set(translateVelocityInWorld.x, translateVelocityInWorld.y, translateVelocityInWorld.z);

        const angularSpeedGain = config.drone.angularSpeedGain as number;

        const angularSpeed = - gamepadState.yaw * angularSpeedGain;
        droneApi.angularVelocity.set(0, 0, angularSpeed);

        const droneOrientation = new Quaternion();
        drone.getWorldQuaternion(droneOrientation);

        if (isLogging) {
            logs.push(new DroneLog(droneWorldPos, droneOrientation, translateVelocityInWorld, angularSpeed, cellCollide, targetCollide));
        }
    });

    function pollGamepad(timestamp: number) {
        const gamepads = navigator.getGamepads().filter(g => g != null);
        const deadzone = config.drone.thumbstickDeadzone as number;
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
        const sensorDistance = config.drone.sensorDistance as number;
        const numProbes = config.drone.numProbes as number;
        const sensorDirections: Vector3[] = [];
        const sensorValues: number[] = [];

        for (let i = 0; i < numProbes; i++) {
            const angle = i * (2 * Math.PI / numProbes);
            const x = Math.cos(angle) * sensorDistance;
            const y = Math.sin(angle) * sensorDistance;
            const direction = new Vector3(x, y, 0);
            direction.normalize();
            sensorDirections.push(direction.clone());
            sensorValues.push(0);
            distanceSensors.push(<DistanceSensor key={`sensor-${i}`} 
                                                id={i}
                                                droneRef={droneRef} 
                                                direction={direction} 
                                                showRaycastLine={!props.hideRays} 
                                                showAngleRange={props.showAngleRange}
                                                angleRange={2 * Math.PI / numProbes}
                                                pollInterval={config.drone.sensorPollingInterval as number} 
                                                showSphere={!props.hideSpheres}
                                                onDistanceChange={onSensorDistanceChange}/>);
        }
        
        setDistanceSensorDirections(sensorDirections);
        setDistanceSensorValues(sensorValues);
        setDistanceSensors(distanceSensors);
    }, [props.hideRays, props.showAngleRange, props.hideSpheres]);

    useEffect(function logDroneState() {
        if (props.logging) {
            // start logging
            setIsLogging(true);
        } else {
            // stop logging
            setIsLogging(false);
            setLogs([]);
            if (logs.length > 0) { 
                saveLogs();
            }
        }
    }, [props.logging]);

    function saveLogs() {
        const logsInString = logs.map(l => l.toJSONString()).join("\n");
        const blob = new Blob([logsInString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "drone_logs.txt");
    }

    function onSensorDistanceChange(id: number, distance: number) {

        if (props.hapticPacketQueue == null) {
            return;
        }

        const intensity = distanceToIntensity(distance);
        const actuatorID = sensorIdToActuatorID(id);
        const maxIntensity = config.haptic.maxIntensity as number;
        hapticPacketsForHUD.push({actuatorID: id, intensity: intensity / maxIntensity});
        props.hapticPacketQueue.push({actuatorID, intensity});
    }

    return (<>
                <mesh ref={droneRef}>
                    <CameraControl firstPersonView={props.firstPersonView} hideWalls={props.hideWalls} 
                        hapticPacketsForHUD={hapticPacketsForHUD}
                        hudSensorDirections={distanceSensorDirections}
                    />
                    <sphereGeometry args={droneArgs}/>
                    <pointLight position={[0, 0, 1]} />
                    <meshBasicMaterial attach="material" color={cellCollide? "red" : "blue"} />
                    <HeadupNoti position={[0, 0.1, 0]} visible={cellCollide || targetCollide} message={targetCollide? "found target":"collision"} />
                    <DroneSensorsHUD hapticPackets={hapticPacketsForHUD} sensorDirections={distanceSensorDirections} />
                    
                    {props.onlyFrontSensor? distanceSensors[2] : distanceSensors}
                </mesh>
            </>);
}

function applyDeadzone(value: number, deadzone: number): number {
    if (Math.abs(value) < deadzone) {
        return 0;
    }
    return value;
}

function HeadupNoti(props: any) {
    return <Text fontSize={0.01} rotation={new Euler(Math.PI / 2, 0, 0)} position={props.position} color={"red"} anchorX="center" anchorY="middle" visible={props.visible}>{props.message}</Text>
}