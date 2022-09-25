import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MathUtils, Vector3 } from "three";
import { config } from "../utils/config";
import DroneSensorsHUD from "./DroneSensorsHud";
import IHapticPacket from "./IHapticPacket";
interface ICameraControlProps {
    firstPersonView: boolean;
    hideWalls: boolean;
    hapticPacketsForHUD: IHapticPacket[];
    hudSensorDirections: Vector3[];
}

const cellLayer = config.game.map.cellLayer;

export default function CameraControl(props: ICameraControlProps) {
    const perspectiveCamRef = useRef(null);
    const [hudSensorValues, setHudSensorValues] = useState<number[]>([]);

    useEffect(() => {
        if (perspectiveCamRef.current == null) {
            return;
        }

        const camera = perspectiveCamRef.current as THREE.PerspectiveCamera;
        camera.rotateX(MathUtils.degToRad(90));
    }, []);

    useThree((state) => {
        if (!props.hideWalls) {
            state.camera.layers.enable(cellLayer);
        } else {
            state.camera.layers.disable(cellLayer);
        }
    });

    return <>
        <PerspectiveCamera ref={perspectiveCamRef} makeDefault={props.firstPersonView} position={[0, 0, 0]}>
            <DroneSensorsHUD hapticPackets={props.hapticPacketsForHUD} sensorDirections={props.hudSensorDirections} />
        </PerspectiveCamera>
        <OrthographicCamera position={[0, 0, 1]} zoom={config.game.camZoomLevel as number} makeDefault={!props.firstPersonView} />
        {/* <OrbitControls /> */}
    </>
}