import { Box, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import useInterval from "react-useinterval";
import { Color, Scene, Vector2, Vector3 } from "three";
import { config } from "../utils/config";
import { calculateSensorDirection } from "../utils/Sensor";
import IHapticPacket from "./IHapticPacket";

interface IDroneSensorsVisualizer {
    hapticPackets: IHapticPacket[];
}

export default function DroneSensorsVisualizer(props: IDroneSensorsVisualizer) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sensorDirections, setSensorDirections] = useState<Vector3[]>([]);
    const [sensorValues, setSensorValues] = useState<number[]>([]);
    const canvasWidth = 100; // px
    const canvasHeight = 100; // px

    useEffect(() => {

        const numProbes = config.drone.numProbes as number;

        const sensorValues = [];
        const sensorDirections: Vector3[] = [];
        for (let i=0; i<numProbes; i++) {
            sensorValues.push(0);
            sensorDirections.push(calculateSensorDirection(i));
        }
        setSensorDirections(sensorDirections);
        setSensorValues(sensorValues);
    }, []);

    useInterval(() => {
        const prevSensorValues = sensorValues.slice();
        while (props.hapticPackets.length > 0) {
            const packet = props.hapticPackets.shift();
            prevSensorValues[packet!.actuatorID] = packet!.intensity;
        }

        setSensorValues(prevSensorValues);
    }, 1);

    useEffect(() => {
        if (canvasRef.current == null) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i=0; i<sensorDirections.length; i++) {
            const dir = sensorDirections[i]!;
            const value = sensorValues[i]!;
            const startPoint = new Vector2(canvasWidth/2, canvasHeight/2);
            const magnitude = value * canvasWidth / 2; 
            // flip y axis, to match the canvas coordinate.
            const endPoint = new Vector2(dir.x, -dir.y).multiplyScalar(magnitude).add(startPoint.clone());
            
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
    }, [sensorValues]);

    return (
        <>
            <canvas className="border-2 border-black" ref={canvasRef} style={{backgroundColor: "white"}} width={`${canvasWidth}`} height={`${canvasHeight}`}></canvas>
        </>
    );
}

