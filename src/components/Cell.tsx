import { useBox } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { Mesh, TextureLoader, Vector2 } from "three";
import * as THREE from "three";

interface ICellProps {
  cellSize: number;
  cellThickness: number;
  layerNumber: number;
  position: Vector2;
}

export default function Cell(props: ICellProps) {
  const { cellSize, cellThickness, layerNumber, position } = props;
  const [cellRef] = useBox<Mesh>(() => ({
    mass: 1,
    position: [position.x, position.y, 0],
    type: "Static",
    args: [cellSize, cellSize, cellThickness],
  }));

  const colorMap = useLoader(TextureLoader, "/textures/green-tile.jpg");

  return (
    <mesh ref={cellRef} layers={layerNumber}>
      <boxGeometry args={[cellSize, cellSize, cellThickness]} />
      <meshStandardMaterial attach="material" map={colorMap} />
    </mesh>
  );
}
