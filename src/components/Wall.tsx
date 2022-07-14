import { Box } from "@react-three/drei";
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

    return (<mesh>
                <Box position={[rightWallPosX, distance, 0]} args={[rightWallLength, rightWallHeight, 1]} layers={props.layerNumber} ></Box>
                <Box position={[leftWallPosX, distance, 0]} args={[leftWallLength, leftWallHeight, 1]} layers={props.layerNumber}></Box>
        </mesh>);
}
