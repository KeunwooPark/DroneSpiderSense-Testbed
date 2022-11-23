import { Sphere } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Vector2 } from "three";
import { config } from "../utils/config";
import Cell from "./Cell";
import IMapDefinition from "./IMapDefinition";
import Target from "./Target";

interface IMapProps {
  mapDefinition: IMapDefinition;
}

const cellLayer = config.game.map.cellLayer;

export default function GameMap(props: IMapProps) {
  const [cellComponents, setCellComponents] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const _cellComponents: JSX.Element[] = [];

    const mapWidth = props.mapDefinition.width;
    const mapHeight = props.mapDefinition.height;
    const map = props.mapDefinition.map;
    const cellSize = props.mapDefinition.cellSize;
    const wallOffset = new Vector2(
      config.game.map.offsetX,
      config.game.map.offsetY
    );
    for (let i = 0; i < mapWidth; i++) {
      for (let j = 0; j < mapHeight; j++) {
        const value = map[i]![j]!;
        const position = new Vector2(i * cellSize, j * cellSize).add(
          wallOffset
        );
        if (value === 1) {
          const cellComp = (
            <Cell
              key={`cell-${i}-${j}`}
              cellSize={cellSize}
              cellThickness={1}
              layerNumber={cellLayer}
              position={position}
            ></Cell>
          );
          _cellComponents.push(cellComp);
        } else if (value === 2) {
          const targetComp = (
            <Target
              key={`target-${i}-${j}`}
              position={position}
              size={cellSize * 0.25}
            ></Target>
          );
          _cellComponents.push(targetComp);
        }
      }
    }

    setCellComponents(_cellComponents);
  }, [props.mapDefinition]);

  return <mesh>{cellComponents}</mesh>;
}
