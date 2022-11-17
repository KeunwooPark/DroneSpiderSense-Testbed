import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { NextPage } from "next";
import { useState } from "react";
import Drone from "../components/Drone";
import GameMap from "../components/GameMap";
import SerialCom from "../components/SerialCom";
import IHapticPacket from "../components/IHapticPacket";
import MapGenerator from "../components/MapGenerator";
import IMapDefinition from "../components/IMapDefinition";
import { config } from "../utils/config";
import { saveAs } from "file-saver";
import MapLoader from "../components/MapLoader";

const DroneSimulation: NextPage = () => {
  const [hideWalls, setHideWalls] = useState(false);
  const [hideRays, setHideRays] = useState(false);
  const [hideSpheres, setHideSpheres] = useState(true);
  const [showAngleRange, setShowAngleRange] = useState(false);
  const [showSensorHUD, setShowSensorHUD] = useState(false);
  const [onlyFrontSensor, setOnlyFrontSensor] = useState(false);
  const [firstPersonView, setFirstPersonView] = useState(true);
  const [orbitControls, setOrbitControls] = useState(false);
  const [hapticPacketQueue, setHapticPacketQueue] = useState<IHapticPacket[]>(
    []
  );
  const [mapDefinition, setMapDefinition] = useState<IMapDefinition>({
    width: 0,
    height: 0,
    map: [],
    cellSize: config.game.map.cellSize as number,
  });
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

  function orbitControlsChanged() {
    setOrbitControls(!orbitControls);
  }

  function showSideSensorVisualizationChanged() {
    setShowSensorHUD(!showSensorHUD);
  }

  function onMapLoaded(mapDefinition: IMapDefinition) {
    setMapDefinition(mapDefinition);
  }

  function loggingOnClick() {
    if (isLogging) {
      saveMapDefinition();
    }

    setIsLogging(!isLogging);
  }

  function saveMapDefinition() {
    const mapDefinitionAsString = JSON.stringify(mapDefinition);
    const file = new Blob([mapDefinitionAsString], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(file, "mapDefinition.json");
  }

  return (
    <div className="container mx-auto h-screen">
      <h1 className="text-5xl">drone simulation</h1>
      <div className="ml-3">
        <div>walls</div>
        <input
          type="checkbox"
          className="toggle"
          checked={!hideWalls}
          onChange={hideWallsChanged}
        />
      </div>

      <div className="ml-3">
        <div>rays</div>
        <input
          type="checkbox"
          className="toggle"
          checked={!hideRays}
          onChange={hideRaysChanged}
        />
      </div>

      <div className="ml-3">
        <div>spheres</div>
        <input
          type="checkbox"
          className="toggle"
          checked={!hideSpheres}
          onChange={hideSpheresChanged}
        />
      </div>

      <div className="ml-3">
        <div>angleRange</div>
        <input
          type="checkbox"
          className="toggle"
          checked={showAngleRange}
          onChange={showAngleRangeChanged}
        />
      </div>

      <div className="ml-3">
        <div>show only front sensor</div>
        <input
          type="checkbox"
          className="toggle"
          checked={onlyFrontSensor}
          onChange={onlyFrontSensorChanged}
        />
      </div>

      <div className="ml-3">
        <div>first person view</div>
        <input
          type="checkbox"
          className="toggle"
          checked={firstPersonView}
          onChange={firstPersionViewChanged}
        />
      </div>

      <div className="ml-3">
        <div>orbit controls</div>
        <input
          type="checkbox"
          className="toggle"
          checked={orbitControls}
          onChange={orbitControlsChanged}
        />
      </div>

      <div className="ml-3">
        <div>show side sensor visualization</div>
        <input
          type="checkbox"
          className="toggle"
          checked={showSensorHUD}
          onChange={showSideSensorVisualizationChanged}
        />
      </div>

      <SerialCom
        pollInterval={config.serial.pollInterval}
        hapticPacketQueue={hapticPacketQueue}
        baudRate={115200}
      />
      <button className="btn btn-primary mb-3" onClick={loggingOnClick}>
        {isLogging ? "stop logging" : "start logging"}
      </button>
      <div className="grid grid-cols-4 h-1/2">
        <div className="col-span-3">
          <Canvas className="">
            <fog attach="fog" color="blue" near={0} far={2} />
            <color args={["#000000"]} attach="background" />
            <Physics>
              {/* <ambientLight color={"#FFFFFF"} /> */}
              <Drone
                hideRays={hideRays}
                showAngleRange={showAngleRange}
                onlyFrontSensor={onlyFrontSensor}
                hapticPacketQueue={hapticPacketQueue}
                hideSpheres={hideSpheres}
                firstPersonView={firstPersonView}
                hideWalls={hideWalls}
                logging={isLogging}
                showSensorHUD={showSensorHUD}
                orbitControls={orbitControls}
              />
              <GameMap mapDefinition={mapDefinition} />
            </Physics>
          </Canvas>
        </div>
      </div>
      <div className="my-3">
        {/* <MapGenerator onMapGenerated={onMapGenerated} /> */}
        <MapLoader onMapLoaded={onMapLoaded} />
      </div>
    </div>
  );
};

export default DroneSimulation;
