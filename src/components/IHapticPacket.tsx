export default interface IHapticPacket {
    actuatorID: number; // 0-7
    intensity: number; // 0-100
}