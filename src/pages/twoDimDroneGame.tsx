import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { NextPage } from "next"
import { useState } from "react";
import Drone from "../components/Drone";
import GameMap from "../components/GameMap";
import SerialCom from "../components/SerialCom";
import IHapticPacket from "../components/IHapticPacket";

const wallLayerNumber = 1;
const camZoomLevel = 150;

const TwoDimDroneGame: NextPage = () => {
    const [hideWalls, setHideWalls] = useState(false);
    const [hideRays, setHideRays] = useState(false);
    const [showAngleRange, setShowAngleRange] = useState(false);
    const [onlyFrontSensor, setOnlyFrontSensor] = useState(false);
    const initialWallParams = {maxWidth: 6, thickness: 0.3, pathCenter: 0, pathWidth: 0, distance: 0, minPathWidth: 0.3, layerNumber: wallLayerNumber };
    const [hapticPacketQueue, setHapticPacketQueue] = useState<IHapticPacket[]>([]);

    function handleHideWallsChange() {
        setHideWalls(!hideWalls);
    }

    function handleHideRaysChange() {
        setHideRays(!hideRays);
    }

    function handleShowAngleRangeChange() {
        setShowAngleRange(!showAngleRange);
    }

    function handleOnlyFrontSensorChange() {
        setOnlyFrontSensor(!onlyFrontSensor);
    }

    return (
        <div className="container mx-auto h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <div className="ml-3">
                <div>walls</div> 
                <input type="checkbox" className="toggle" checked={!hideWalls} onChange={handleHideWallsChange} />
            </div>

            <div className="ml-3">
                <div>rays</div> 
                <input type="checkbox" className="toggle" checked={!hideRays} onChange={handleHideRaysChange} />
            </div>

            <div className="ml-3">
                <div>angleRange</div> 
                <input type="checkbox" className="toggle" checked={showAngleRange} onChange={handleShowAngleRangeChange} />
            </div>

            <div className="ml-3">
                <div>show only front sensor</div> 
                <input type="checkbox" className="toggle" checked={onlyFrontSensor} onChange={handleOnlyFrontSensorChange} />
            </div>
            
            <SerialCom pollInterval={2} hapticPacketQueue={hapticPacketQueue} baudRate={115200} />
            
            <div className="w-1/2 h-1/2">
                <Canvas className="" camera={{position: [0, 0, 1], zoom: camZoomLevel}} orthographic>
                    <color args={["#000000"]} attach="background" />
                    <Physics>
                        <ambientLight />
                        <Drone wallLayerNumber={wallLayerNumber} hideRays={hideRays} showAngleRange={showAngleRange} onlyFrontSensor={onlyFrontSensor} hapticPacketQueue={hapticPacketQueue} />
                        <GameMap initialWallParams={initialWallParams} hideWalls={hideWalls} wallLayerNumber={wallLayerNumber} />
                    </Physics>
                </Canvas>
            </div>
        </div>
    )
}

export default TwoDimDroneGame;
