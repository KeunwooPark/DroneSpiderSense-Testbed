export const config: any = {};

config.game = {};
config.game.camZoomLevel = 150;

config.game.map = {};
// width and height is better to be odd numbers.
config.game.map.width = 11;
config.game.map.height = 11;
config.game.map.cellSize = 0.7;
config.game.map.cellLayer = 1;
config.game.map.minPathAreaRatio = 0.3;

config.drone = {};
config.drone.size = 0.1;
config.drone.numProbes = 8;
config.drone.sensorDistance = 0.3;
config.drone.speedGain = 0.4;
config.drone.angularSpeedGain = 0.6;
config.drone.sensorPollingInterval = 100; // ms
config.drone.thumbstickDeadzone = 0.15;

config.drone.sensor = {};
config.drone.sensor.numSubRays = 5;

config.serial = {};
config.serial.pollInterval = 1; //ms