export const config: any = {};

config.game = {};
config.game.camZoomLevel = 150;

config.game.map = {};
// width and height is better to be odd numbers.
config.game.map.width = 41;
config.game.map.height = 41;
config.game.map.cellSize = 0.3;
config.game.map.cellLayer = 1;
config.game.map.mapLayer = 2;
config.game.map.minPathAreaRatio = 0.1;
// offsets depends on how the map is generated.
config.game.map.offsetX = -config.game.map.cellSize * 13;
config.game.map.offsetY = 1;

config.drone = {};
config.drone.size = 0.1; // radius
config.drone.numProbes = 8;
config.drone.sensorDistance = 0.3;
config.drone.speedGain = 0.4;
config.drone.angularSpeedGain = 0.6;
config.drone.sensorPollingInterval = 100; // ms
config.drone.thumbstickDeadzone = 0.15;
config.drone.traceLength = 1000;

config.drone.sensor = {};
config.drone.sensor.numSubRays = 5;

config.haptic = {};
config.haptic.maxDistance = 0.35;
config.haptic.minIntensity = 0;
config.haptic.maxIntensity = 50;

config.serial = {};
config.serial.pollInterval = 1; //ms
