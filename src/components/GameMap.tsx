import { useEffect, useState } from "react";
import IWallProps from "./IWallProps";
import Wall from "./Wall";

const numWalls = 50;
const wallOffset = 1;
const wallThickness = 0.3;
const minPathWidth = 0.5;

interface IMapProps {
    initialWallParams: IWallProps;
}

export default function GameMap(props: IMapProps) {

    
    const [wallComponents, setWallComponents] = useState<JSX.Element[]>([]);
    
    useEffect(() => {
        if (wallComponents.length > 0) {
            return;
        }
        const _wallComponents: JSX.Element[] = [];
        const mapWallParams = createRandomWallParamsForMap(props.initialWallParams, numWalls, wallOffset);
        for (const wallParam of mapWallParams) {
            _wallComponents.push(<Wall key={wallParam.distance} 
                maxWidth={wallParam.maxWidth} 
                thickness={wallParam.thickness} 
                pathCenter={wallParam.pathCenter} 
                pathWidth={wallParam.pathWidth} distance={wallParam.distance} minPathWidth={wallParam.minPathWidth} layerNumber={props.initialWallParams.layerNumber}/>);
        }

        setWallComponents(_wallComponents);
    }, [props.initialWallParams]);

    return (<mesh>{wallComponents}</mesh>);
}

function createRandomWallParamsForMap(initialParams: IWallProps, numWalls: number, wallOffset: number): IWallProps[] {
    const wallParamsForMap: IWallProps[] = [];

    let prevParams: IWallProps = {maxWidth: 6, thickness: wallThickness, pathCenter: 0, pathWidth: 0, distance: 0, minPathWidth: minPathWidth, layerNumber: 0};
    for (let i = 0; i < numWalls; i++) {
        const wallParams = createRandomWallParams(prevParams);
        wallParams.distance = i * wallParams.thickness + wallOffset;
        wallParamsForMap.push(wallParams);
        prevParams = wallParams;
    }
    return wallParamsForMap;
}

function createRandomWallParams(prevParams: IWallProps): IWallProps {
    const maxWidth = prevParams.maxWidth;
    const thickness = prevParams.thickness;
    const minPathWidth = prevParams.minPathWidth;
    const pathCenter = minMaxRandom(prevParams.pathCenter - prevParams.pathWidth / 4, prevParams.pathCenter + prevParams.pathWidth / 4);

    let maxPathWidth = 0;
    if (pathCenter > 0) {
        maxPathWidth = maxWidth / 2 - pathCenter;
    } else {
        maxPathWidth = maxWidth / 2 + pathCenter;
    }

    const pathWidth = minMaxRandom(minPathWidth, maxPathWidth);
    const layerNumber = prevParams.layerNumber;;

    return { maxWidth, thickness, pathCenter, pathWidth, distance: 0, minPathWidth, layerNumber};
}
function minMaxRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}