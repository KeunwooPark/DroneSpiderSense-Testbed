import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MathUtils} from "three";
import { config } from "../utils/config";
interface ICameraControlProps {
    firstPersonView: boolean;
    hideWalls: boolean;
}

const cellLayer = config.game.map.cellLayer;

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
            state.camera.layers.enable(cellLayer);
        } else {
            state.camera.layers.disable(cellLayer);
        }
    });

    return <>
        <PerspectiveCamera ref={perspectiveCamRef} makeDefault={props.firstPersonView} position={[0, 0, 0]} />
        <OrthographicCamera position={[0, 0, 1]} zoom={config.game.camZoomLevel as number} makeDefault={!props.firstPersonView} />
        {/* <OrbitControls /> */}
    </>
}