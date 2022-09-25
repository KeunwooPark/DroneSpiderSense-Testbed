import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Scene, Vector2, Vector3 } from "three";
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
    });

    useEffect(() => {
        if (canvasRef.current == null) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }

        ctx.clearRect(0, 0, hudWidth, hudHeight);

        for (let i=0; i<sensorDirections.length; i++) {
            const dir = sensorDirections[i]!;
            const value = sensorValues[i]!;
            const startPoint = new Vector2(hudWidth/2, hudHeight/2);
            const magnitude = value * hudWidth / 2; 
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
        <Html position={[0, 0, 0]}>
            <canvas ref={canvasRef} style={{backgroundColor: "white"}} width={`${hudWidth}`} height={`${hudHeight}`}></canvas>
        </Html>
        </>
    );
}

