import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MathUtils } from "three";
import { config } from "../utils/config";
interface ICameraControlProps {
    firstPersonView: boolean;
    hideWalls: boolean;
    wallLayerNumber: number;
}

export default function CameraControl(props: ICameraControlProps) {
    const perspectiveCamRef = useRef(null);
    useEffect(() => {
        if (perspectiveCamRef.current == null) {
            return;
        }

        const camera = perspectiveCamRef.current as THREE.PerspectiveCamera;
        camera.rotateX(MathUtils.degToRad(90));
    }, []);

    useThree((state) => {
        if (!props.hideWalls) {
            state.camera.layers.enable(props.wallLayerNumber);
        } else {
            state.camera.layers.disable(props.wallLayerNumber);
        }
    });

    return <>
        <OrthographicCamera position={[0, 0, 1]} zoom={config.game.camZoomLevel as number} makeDefault={!props.firstPersonView} />
        {/* <OrbitControls /> */}
        <PerspectiveCamera ref={perspectiveCamRef} makeDefault={props.firstPersonView} position={[0, 0, 0]} />
    </>
}