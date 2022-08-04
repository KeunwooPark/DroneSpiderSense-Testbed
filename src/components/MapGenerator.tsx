import { useEffect, useState } from "react";
import IMapDefinition from "./IMapDefinition";
import Map2DVisualizer from "./Map2DVisualizer";

function generateMap(width: number, height: number): number[][] {
    const map: number[][] = [];
    for (let i = 0; i < width; i++) {
        map[i] = [];
        for (let j = 0; j < height; j++) {
            map[i]![j] = Math.random() > 0.5 ? 1 : 0;
        }
    }
    return map;
}

interface IMapGeneratorProps {
    mapDefinition: IMapDefinition;
}

export default function MapGenerator(props: IMapGeneratorProps) {
    const width = 20;
    const height = 20;
    const [map, setMap] = useState<number[][]>([]);

    useEffect(() => {
        const _map = generateMap(width, height);
        setMap(_map);
    }, []);

    useEffect(() => {
        props.mapDefinition.map = map;
        props.mapDefinition.width = width;
        props.mapDefinition.height = height;
    }, [map, props.mapDefinition]);

    return <>
        <h2 className="text-lg">map generator</h2>
        <Map2DVisualizer height={height} width={width} map={map} cellSize={props.mapDefinition.cellSize} />
    </>
}