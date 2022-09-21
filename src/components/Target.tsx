import { SphereArgs, useSphere } from "@react-three/cannon";
import { Sphere } from "@react-three/drei";
import { Mesh, Vector2 } from "three";
import { config } from "../utils/config";
interface ITargetProps {
    position: Vector2;
    size: number;
}

export default function Target(props: ITargetProps) {
    const args: SphereArgs = [props.size];
    const [targetRef, targetApi] = useSphere<Mesh>(() => ({ mass: 1, 
        position: [props.position.x, props.position.y, 0],
        type: "Kinematic",
        args: args,
        collisionResponse: true,
    }));
    return <mesh ref={targetRef}>
        <sphereGeometry args={[props.size]} />
        <meshBasicMaterial attach="material" color="green"/>
    </mesh>;
}