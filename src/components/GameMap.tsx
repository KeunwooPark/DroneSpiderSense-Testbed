import { Box, Sphere } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Box3, Object3D, Vector2, Vector3 } from "three";
import { config } from "../utils/config";
import Cell from "./Cell";
import IMapDefinition from "./IMapDefinition";
import Target from "./Target";
import { useBox } from "@react-three/cannon";
import CollideBox from "./CollideBox";

interface IMapProps {
  mapDefinition: IMapDefinition;
}

const cellLayer = config.game.map.cellLayer;
const mapLayer = config.game.map.mapLayer;

export default function GameMap(props: IMapProps) {
  const [cellComponents, setCellComponents] = useState<JSX.Element[]>([]);
  const [mapBoundingBox, setMapBoundingBox] = useState<JSX.Element>();

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

    
    const boundingBoxComp = createBoundingBox(_cellComponents);
    setMapBoundingBox(boundingBoxComp);

  }, [props.mapDefinition]);

  const createBoundingBox = (cells: JSX.Element[]): JSX.Element => {
    if (cells.length === 0) {
      return <></>;
    }
    const boundingBox = new Box3();
    const cellPoints = cells.reduce((acc, cur) => {
      const points = getPoints(cur);
      acc = acc.concat(points);
      return acc;
    }, [] as Vector3[]);

    boundingBox.setFromPoints(cellPoints);

    const bbPosition = boundingBox.getCenter(new Vector3());
    const bbSize = boundingBox.getSize(new Vector3());
    const boundingBoxComp = (
      <CollideBox
        position={[bbPosition.x, bbPosition.y, bbPosition.z]}
        size={[
          bbSize.x,
          bbSize.y,
          bbSize.z,
        ]}
        layerNumber={mapLayer}
      >
        <meshStandardMaterial
          attach="material"
          color="white"
          // transparent
          // wireframe
        />
      </CollideBox>
    );

    return boundingBoxComp;
  }

  // This is hacky, but it works for now.
  // Just keep this code and `Cell` component in sync.
  const getPoints = (cell: JSX.Element): Vector3[] => {
    const cellSize = cell.props.cellSize;
    const position = cell.props.position;
    const cellThickness = cell.props.cellThickness;

    const sqaurePoints = [new Vector3(position.x + cellSize / 2, position.y + cellSize / 2, 0), 
      new Vector3(position.x + cellSize / 2, position.y - cellSize / 2, 0), 
      new Vector3(position.x - cellSize / 2, position.y + cellSize / 2, 0), 
      new Vector3(position.x - cellSize / 2, position.y - cellSize / 2, 0)];
    

    const upperPoints = sqaurePoints.map((c) => c.clone().add(new Vector3(0, 0, cellThickness/2)));
    const lowerPoints = sqaurePoints.map((c) => c.clone().add(new Vector3(0, 0, -cellThickness/2)));

    const points = [...upperPoints, ...lowerPoints];

    return points;
  }


  return <mesh>
    {mapBoundingBox}
    {cellComponents}</mesh>;
}


