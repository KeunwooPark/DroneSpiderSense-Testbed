import { useEffect, useState } from "react";
import { Vector2 } from "three";
import Cell from "./Cell";
import IMapDefinition from "./IMapDefinition";

interface IMapProps {
    wallLayerNumber: number;
    mapDefinition: IMapDefinition;
}

export default function GameMap(props: IMapProps) {
    
    const [cellComponents, setCellComponents] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const _cellComponents: JSX.Element[] = [];

        const mapWidth = props.mapDefinition.width;
        const mapHeight = props.mapDefinition.height;
        const map = props.mapDefinition.map;
        const cellSize = props.mapDefinition.cellSize;
        const wallOffset = new Vector2(0, 1);
        for (let i = 0; i < mapWidth; i++) {
            for (let j = 0; j < mapHeight; j++) {
                if (map[i]![j] === 1) {
                    const position = (new Vector2(i * cellSize, j * cellSize)).add(wallOffset);
                    const cellComp = <Cell key={`cell-${i}-${j}`} cellSize={cellSize} cellThickness={1} layerNumber={props.wallLayerNumber} position={position} ></Cell>
                    _cellComponents.push(cellComp);
                }
            }
        }

        setCellComponents(_cellComponents);
        console.log("map def updated");
    }, [props.mapDefinition]);

    return (<mesh>{cellComponents}</mesh>);
}