import { useBox } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { Mesh, TextureLoader, Vector2 } from "three";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import CollideBox from "./CollideBox";

interface ICellProps {
  cellSize: number;
  cellThickness: number;
  layerNumber: number;
  position: Vector2;
}

export default function Cell(props: ICellProps) {
  const { cellSize, cellThickness, layerNumber, position } = props;
  const smallOffset = 0.001;
  // const [cellRef] = useBox<Mesh>(() => ({
  //   mass: 1,
  //   position: [position.x, position.y, 0],
  //   type: "Static",
  //   args: [
  //     cellSize - smallOffset,
  //     cellSize - smallOffset,
  //     cellThickness - smallOffset,
  //   ],
  // }));

  const colorMap = useLoader(TextureLoader, "/textures/green-tile.jpg");

  return (
    <>
      {/* <mesh ref={cellRef} layers={layerNumber}>
        <boxGeometry args={[cellSize, cellSize, cellThickness]} />
        <meshStandardMaterial attach="material" map={colorMap} />
      </mesh> */}
      <CollideBox position={[position.x, position.y, 0]} size={[cellSize, cellSize, cellThickness]} layerNumber={layerNumber}>
        <meshStandardMaterial attach="material" map={colorMap} />
      </CollideBox>
      <Box
        layers={layerNumber}
        position={[position.x, position.y, 0]}
        args={[
          cellSize - smallOffset,
          cellSize - smallOffset,
          cellThickness - smallOffset,
        ]}
      >
        <meshStandardMaterial
          attach="material"
          color="black"
          side={THREE.BackSide}
        />
      </Box>
    </>
  );
}
