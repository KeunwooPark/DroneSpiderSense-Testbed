import { useBox } from "@react-three/cannon";
import { Mesh } from "three";

interface ICollideBoxProps {
    position: [number, number, number];
    size: [number, number, number];
    layerNumber: number;
    children?: JSX.Element;
}

export default function CollideBox(props: ICollideBoxProps) {
    const [ref] = useBox<Mesh>(() => ({
      mass: 1,
      type: "Static",
      position: props.position,
      args: props.size,
    }));
  
    return (
      <mesh ref={ref} layers={props.layerNumber}>
        <boxGeometry args={props.size} />
        {props.children}
      </mesh>
    );
  }