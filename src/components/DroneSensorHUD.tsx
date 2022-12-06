import { Circle, Line, Sphere } from "@react-three/drei";
import { useEffect, useState } from "react";
import useInterval from "react-useinterval";
import { Euler, Vector3 } from "three";
import { config } from "../utils/config";
import { calculateSensorDirection } from "../utils/Sensor";
import IHapticPacket from "./IHapticPacket";

interface IDroneSensorHUDProps {
    sensorDataQueue: IHapticPacket[];
    distance: number;
    size: number;
}
export default function DroneSensorHUD(props: IDroneSensorHUDProps) {

    const { sensorDataQueue, distance, size } = props;
    const [sensorLineDirections, setSensorLineDirections] = useState<Vector3[]>([]);
    const [sensorValues, setSensorValues] = useState<number[]>([]);

    useEffect(() => {

        const numProbes = config.drone.numProbes as number;

        const sensorValues = [];
        const sensorDirections: Vector3[] = [];
        for (let i=0; i<numProbes; i++) {
            sensorValues.push(0);
            const direction = calculateSensorDirection(i);
            sensorDirections.push(convertSensorDirectionForHUD(direction));
        }
        setSensorLineDirections(sensorDirections);
        setSensorValues(sensorValues);
    }, []);

    useInterval(() => {
        const prevSensorValues = sensorValues.slice();
        while (sensorDataQueue.length > 0) {
            const packet = sensorDataQueue.shift();
            prevSensorValues[packet!.actuatorID] = packet!.intensity;
        }

        setSensorValues(prevSensorValues);
    }, 1);

    function getLines() {
        const lines: JSX.Element[] = [];
        for (let i=0; i<sensorLineDirections.length; i++) {
            const lineStartPoint = sensorLineDirections[i]!.clone().multiplyScalar(size);
            const lineLength = sensorValues[i]! * size;
            const lineVec = sensorLineDirections[i]!.clone().multiplyScalar(lineLength);
            // sensor line direction is from center. we want the lines to start from the edge of the circle.
            // so we need to subtract the line vector from the start point.
            const lineEndPoint = lineStartPoint.clone().sub(lineVec);
            const line = <Line position={[0, distance, 0]} points={[lineStartPoint, lineEndPoint]} color={"magenta"} linewidth={2} />
            lines.push(line);
        }

        return lines;
    }

    function convertSensorDirectionForHUD(direction: Vector3) {
        const newDirection = new Vector3(direction.x, 0, direction.y);
        newDirection.normalize();

        return newDirection;
    }

    return(<>
        <Circle position={[0, props.distance, 0]} args={[props.size, 32]} rotation={new Euler(Math.PI / 2, 0, 0)}>
            <meshBasicMaterial color="black" transparent opacity={0.1}/>
        </Circle>
        {getLines()}
    </>);
}