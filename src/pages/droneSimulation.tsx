import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { NextPage } from "next"
import { useState } from "react";
import Drone from "../components/Drone";
import GameMap from "../components/GameMap";
import SerialCom from "../components/SerialCom";
import IHapticPacket from "../components/IHapticPacket";
import MapGenerator from "../components/MapGenerator";
import IMapDefinition from "../components/IMapDefinition";
import { config } from "../utils/config";
import DroneSensorsVisualizer from "../components/DroneSensorsVisualizer";
import { AxesHelper } from "three";

const DroneSimulation: NextPage = () => {
    const [hideWalls, setHideWalls] = useState(false);
    const [hideRays, setHideRays] = useState(false);
    const [hideSpheres, setHideSpheres] = useState(true);
    const [showAngleRange, setShowAngleRange] = useState(false);
    const [showSideSensorVisualization, setShowSideSensorVisualization] = useState(false);
    const [onlyFrontSensor, setOnlyFrontSensor] = useState(false);
    const [firstPersonView, setFirstPersonView] = useState(true);
    const [hapticPacketQueue, setHapticPacketQueue] = useState<IHapticPacket[]>([]);
    const [sensorVisualizationQueue, setSensorVisualizationQueue] = useState<IHapticPacket[]>([]);
    const [mapDefinition, setMapDefinition] = useState<IMapDefinition>({width: 0, height: 0, map: [], cellSize: config.game.map.cellSize as number});
    const [isLogging, setIsLogging] = useState(false);

    function hideWallsChanged() {
        setHideWalls(!hideWalls);
    }

    function hideRaysChanged() {
        setHideRays(!hideRays);
    }

    function showAngleRangeChanged() {
        setShowAngleRange(!showAngleRange);
    }

    function onlyFrontSensorChanged() {
        setOnlyFrontSensor(!onlyFrontSensor);
    }

    function hideSpheresChanged() {
        setHideSpheres(!hideSpheres);
    }

    function firstPersionViewChanged() {
        setFirstPersonView(!firstPersonView);
    }

    function showSideSensorVisualizationChanged() {
        setShowSideSensorVisualization(!showSideSensorVisualization);
    }

    function onMapGenerated(mapDefinition: IMapDefinition) {
        setMapDefinition(mapDefinition);
    }

    return (
        <div className="container mx-auto h-screen">
            <h1 className="text-5xl">drone simulation</h1>
            <div className="ml-3">
                <div>walls</div> 
                <input type="checkbox" className="toggle" checked={!hideWalls} onChange={hideWallsChanged} />
            </div>

            <div className="ml-3">
                <div>rays</div> 
                <input type="checkbox" className="toggle" checked={!hideRays} onChange={hideRaysChanged} />
            </div>

            <div className="ml-3">
                <div>spheres</div> 
                <input type="checkbox" className="toggle" checked={!hideSpheres} onChange={hideSpheresChanged} />
            </div>

            <div className="ml-3">
                <div>angleRange</div> 
                <input type="checkbox" className="toggle" checked={showAngleRange} onChange={showAngleRangeChanged} />
            </div>

            <div className="ml-3">
                <div>show only front sensor</div> 
                <input type="checkbox" className="toggle" checked={onlyFrontSensor} onChange={onlyFrontSensorChanged} />
            </div>

            <div className="ml-3">
                <div>first person view</div> 
                <input type="checkbox" className="toggle" checked={firstPersonView} onChange={firstPersionViewChanged} />
            </div>

            <div className="ml-3">
                <div>show side sensor visualization</div> 
                <input type="checkbox" className="toggle" checked={showSideSensorVisualization} onChange={showSideSensorVisualizationChanged} />
            </div>
            
            <SerialCom pollInterval={config.serial.pollInterval} hapticPacketQueue={hapticPacketQueue} baudRate={115200} />
            <button className="btn btn-primary mb-3" onClick={() => {setIsLogging(!isLogging)}}>{isLogging? "stop logging":"start logging"}</button>
            <div className="grid grid-cols-4 h-1/2">
                <div className="col-span-3">
                    <Canvas className="">
                        <fog attach="fog" color="black" near={0} far={5} />
                        <color args={["#000000"]} attach="background" />
                        <Physics>
                            {/* <ambientLight color={"#FFFFFF"} /> */}
                            <Drone hideRays={hideRays} showAngleRange={showAngleRange} onlyFrontSensor={onlyFrontSensor} hapticPacketQueue={hapticPacketQueue} sensorVisualizationQueue={sensorVisualizationQueue} hideSpheres={hideSpheres} firstPersonView={firstPersonView} hideWalls={hideWalls} logging={isLogging} />
                            <GameMap mapDefinition={mapDefinition} />
                        </Physics>
                    </Canvas>
                </div>
                {showSideSensorVisualization? <DroneSensorsVisualizer hapticPackets={sensorVisualizationQueue}/>:<></>}
            </div>
            <div className="my-3">
                <MapGenerator onMapGenerated={onMapGenerated} />
            </div>
        </div>
    )
}

export default DroneSimulation;
