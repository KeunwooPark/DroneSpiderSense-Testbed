import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector2, Vector3 } from "three";
import IHapticPacket from "./IHapticPacket";

interface IDroneSensorsHUD {
    sensorDirections: Vector3[];
    hapticPackets: IHapticPacket[];
}

export default function DroneSensorsHUD(props: IDroneSensorsHUD) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sensorDirections, setSensorDirections] = useState<Vector3[]>([]);
    const [sensorValues, setSensorValues] = useState<number[]>([]);
    const hudWidth = 100; // px
    const hudHeight = 100; // px

    useEffect(() => {
        setSensorDirections(props.sensorDirections);
        const sensorValues = [];
        for (let i=0; i<props.sensorDirections.length; i++) {
            sensorValues.push(0);
        }
        setSensorValues(sensorValues);
    }, [props.sensorDirections])

    useFrame(() => {
        const prevSensorValues = sensorValues.slice();
        while (props.hapticPackets.length > 0) {
            const packet = props.hapticPackets.shift();
            prevSensorValues[packet!.actuatorID] = packet!.intensity;
        }

        setSensorValues(prevSensorValues);
        console.log(prevSensorValues);
    });

    // useEffect(() => {
    //     const numSensorValues = props.sensorValues.length;
    //     if (numSensorValues === 0) {
    //         console.log("no values");
    //         return;
    //     }
        
    //     const canvas = canvasRef.current;
    //     if (canvas == null) {
    //         console.log("no canvas");
    //         return;
    //     }
        
    //     const ctx = canvas.getContext("2d");
    //     if (ctx == null) {
    //         console.log("no context");
    //         return;
    //     }
        
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        
    //     const sensorValues = props.sensorValues;
    //     const sensorDirections = props.sensorDirections;
        
    //     const maxLength = 80;
    //     ctx.beginPath();
    //     for (let i=0; i<numSensorValues; i++) {
    //         const lineStart = new Vector2(hudWidth/2, hudHeight/2);
    //         const lineDirection = new Vector2(sensorDirections[i]!.x, sensorDirections[i]!.y);
    //         console.log("sensor value:", i, sensorValues[i]);
    //         const lineLength = (sensorValues[i]! / 100) * maxLength;
    //         const lineEnd = lineDirection.multiplyScalar(lineLength).add(lineStart);

    //         ctx.moveTo(lineStart.x, lineStart.y);
    //         ctx.lineTo(lineEnd.x, lineEnd.y);
    //     }
    //     ctx.stroke();

    // }, [props.sensorDirections]);

    return (
        <Html position={[-5.0, 3.75, 0]}>
            <canvas ref={canvasRef} style={{backgroundColor: "white"}} width={`${hudWidth}`} height={`${hudHeight}`}></canvas>
        </Html>
    );
}