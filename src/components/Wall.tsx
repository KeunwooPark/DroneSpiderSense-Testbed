import { Physics, Triplet, useBox } from "@react-three/cannon";
import { Box, useHelper } from "@react-three/drei";
import { useRef } from "react";
import { BoxHelper, Mesh } from "three";
import IWallProps from "./IWallProps";
const wallLayerNumber = 1;

export default function Wall(props: IWallProps) {
    const { maxWidth, thickness, pathCenter, pathWidth, distance } = props;

    const rightWallLeftMost = pathCenter + pathWidth / 2;
    const rightWallRightMost = maxWidth / 2;

    const rightWallLength = rightWallRightMost - rightWallLeftMost;
    const rightWallHeight = thickness;
    const rightWallPosX = (rightWallLeftMost + rightWallRightMost) / 2;

    const leftWallLeftMost = -maxWidth / 2;
    const leftWallRightMost = pathCenter - pathWidth / 2;
    const leftWallLength = leftWallRightMost - leftWallLeftMost;
    const leftWallHeight = thickness;
    const leftWallPosX = (leftWallLeftMost + leftWallRightMost) / 2; 

    // const rightWallArgs = {width: 1, height: 1, depth: 1};
    const rightWallArgs: Triplet = [rightWallLength, rightWallHeight, 1];
    const leftWallArgs: Triplet = [leftWallLength, leftWallHeight, 1];

    const [rightWallRef] = useBox<Mesh>(() => ({ mass: 1, position: [rightWallPosX, distance, 0], type: "Static", args: rightWallArgs}));
    const [leftWallRef] = useBox<Mesh>(() => ({ mass: 1, position: [leftWallPosX, distance, 0], type: "Static", args: leftWallArgs} ));
    const geometryRef = useRef(null);

    return (<>
                <mesh ref={rightWallRef} layers={props.layerNumber}>
                    <boxGeometry args={rightWallArgs}/>
                    <meshStandardMaterial attach="material"  />
                </mesh>
                <mesh ref={leftWallRef} layers={props.layerNumber}>
                    <boxGeometry args={leftWallArgs}/>
                    <meshStandardMaterial attach="material"  />
                </mesh>
            </>);
}
