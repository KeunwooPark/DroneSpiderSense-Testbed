import { useState } from "react";
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

export default function MapGenerator(props: any) {
    const width = 20;
    const height = 20;
    const [map, setMap] = useState<number[][]>(generateMap(width, height));

    return <>
        <h2 className="text-lg">map generator</h2>
        <Map2DVisualizer height={height} width={width} map={map} />
    </>
}