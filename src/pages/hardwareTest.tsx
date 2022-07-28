import { NextPage } from "next";
import { useEffect, useState } from "react";
import IHapticPacket from "../components/IHapticPacket";
import SerialCom from "../components/SerialCom";


const HardwareTest: NextPage = () => {
    
    const numActuators = 8;
    const [port, setPort] = useState<SerialPort>();
    const [hapticPacketQueue, setHapticPacketQueue] = useState<IHapticPacket[]>([]);
    const [controlState, setControlState] = useState<IHapticPacket>({actuatorID: 0, intensity: 0});

    useEffect(() => {
        if ("serial" in navigator) {
            // The Web Serial API is supported.
            console.log("Web Serial API supported");
          }
    }, []);

    function onSliderChange(e: any) {
        const value = e.target.value;
        hapticPacketQueue.push({actuatorID: controlState.actuatorID, intensity: value});
        setControlState({actuatorID: controlState.actuatorID, intensity: value});
    }

    function onActuatorIDSelectChange(e: any) {
        const value = e.target.value as number;
        hapticPacketQueue.push({actuatorID: value, intensity: controlState.intensity});
        setControlState({actuatorID: value, intensity: controlState.intensity});
    }

    function getActuatorIDOptions() {
        const options = [];
        for (let i = 0; i < numActuators; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl my-5">Hardware Test view</h1>
            <SerialCom pollInterval={2} hapticPacketQueue={hapticPacketQueue} baudRate={115200} />
            <div className="form-control mt-3">
                <label>Actuator ID</label>
                <select className="select select-primary w-full max-w-xs" onChange={onActuatorIDSelectChange}>
                    {getActuatorIDOptions()}
                </select>
                <label>Actuator Intensity</label>
                <input type="range" min="0" max="100" value={controlState.intensity} className="range range-primary" onChange={onSliderChange} />
            </div>
        </div>
    )
}

export default HardwareTest;