import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MathUtils } from "three";
interface ICameraControlProps {
    firstPersonView: boolean;
    hideWalls: boolean;
    wallLayerNumber: number;
}

const camZoomLevel = 150;

export default function CameraControl(props: ICameraControlProps) {
    const perspectiveCamRef = useRef(null);
    useEffect(() => {
        if (perspectiveCamRef.current == null) {
            return;
        }

        const camera = perspectiveCamRef.current as THREE.PerspectiveCamera;
        camera.rotateX(MathUtils.degToRad(90));
        // camera.rotateZ(MathUtils.degToRad(180));
        console.log("rotate");
    }, []);

    useThree((state) => {
        if (!props.hideWalls) {
            state.camera.layers.enable(props.wallLayerNumber);
        } else {
            state.camera.layers.disable(props.wallLayerNumber);
        }
    });

    return <>
        <OrthographicCamera position={[0, 0, 1]} zoom={camZoomLevel} makeDefault={!props.firstPersonView} />
        {/* <OrbitControls /> */}
        <PerspectiveCamera ref={perspectiveCamRef} makeDefault={props.firstPersonView} position={[0, 0, 0]} />
    </>
}