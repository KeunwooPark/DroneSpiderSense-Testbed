import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Vector2, Vector3 } from "three";

interface IDroneSensorsHUD {
    sensorValues: number[];
    sensorDirections: Vector3[];
}

export default function DroneSensorsHUD(props: IDroneSensorsHUD) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hudWidth = 100; // px
    const hudHeight = 100; // px

    useEffect(() => {
        const numSensorValues = props.sensorValues.length;
        if (numSensorValues === 0) {
            return;
        }

        const canvas = canvasRef.current;
        if (canvas == null) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sensorValues = props.sensorValues;
        const sensorDirections = props.sensorDirections;

        const maxLength = 80;
        ctx.beginPath();
        for (let i=0; i<numSensorValues; i++) {
            const lineStart = new Vector2(hudWidth/2, hudHeight/2);
            const lineDirection = new Vector2(sensorDirections[i]!.x, sensorDirections[i]!.y);
            const lineLength = sensorValues[i]! * maxLength;
            const lineEnd = lineDirection.multiplyScalar(lineLength).add(lineStart);

            ctx.moveTo(lineStart.x, lineStart.y);
            ctx.lineTo(lineEnd.x, lineEnd.y);
            ctx.stroke();
        }

    }, [props.sensorValues, props.sensorDirections]);

    return (
        <Html position={[-5.0, 3.75, 0]}>
            <canvas ref={canvasRef} style={{backgroundColor: "white"}} width={`${hudWidth}`} height={`${hudHeight}`}></canvas>
        </Html>
    );
}