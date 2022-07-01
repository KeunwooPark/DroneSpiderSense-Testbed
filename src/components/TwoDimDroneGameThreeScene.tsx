import { NextPage } from "next";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ITwoDimDroneGameThreeSceneProps {
    width: number;
    height: number;
}

export default function TwoDimDroneGameThreeScene(props: ITwoDimDroneGameThreeSceneProps) {
    const sceneDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const width = props.width;
        const height = props.height;

        const camera = new THREE.PerspectiveCamera( 75, width / height , 0.1, 1000 );
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        sceneDiv.current!.appendChild( renderer.domElement );
        
        function animate() {
            requestAnimationFrame( animate );
            // required if controls.enableDamping or controls.autoRotate are set to true
            renderer.render( scene, camera );
        }
        animate();
    }, []);

    return (
        <div ref={sceneDiv}></div>
    );
}