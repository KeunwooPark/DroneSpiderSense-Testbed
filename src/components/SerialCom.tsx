import { useEffect, useState } from "react";
import useInterval from "react-useinterval";
import Alert, { IAlertProps } from "./Alert";
import IHapticPacket from "./IHapticPacket";

export interface ISerialComProps {
    hapticPacketQueue: IHapticPacket[];
    pollInterval: number;
    baudRate: number;
}

export default function SerialCom(props: ISerialComProps) {

    const baudRate = props.baudRate;
    const [errorState, setErrorState] = useState<IAlertProps>({show: false, message: ""});
    const [serialPort, setSerialPort] = useState<SerialPort>();
    const [debug, setDebug] = useState(false);

    useEffect(() => {
        if (!("serial" in navigator)) {
            setErrorState({show: true, message: "Web Serial API not supported in this browser."});
          }
    }, []);

    useInterval(async () => {

        while (props.hapticPacketQueue.length > 0) {
            const packet = props.hapticPacketQueue.shift();
            if (packet) {
                if (debug) {
                    console.log("Sent: " + packet.actuatorID + " " + packet.intensity);
                    return;
                }
                
                const data = new Uint8Array([packet.actuatorID, packet.intensity]);
    
                if (serialPort == null || serialPort.writable == null || serialPort.writable.locked) {
                    console.error("Serial port not ready", serialPort?.writable);
                    return;
                }
    
                const writer = serialPort.writable.getWriter();
                await writer.write(data);
                writer.releaseLock();
                console.log("Sent: " + packet.actuatorID + " " + packet.intensity);
            }
        }

        
    }, props.pollInterval);

    async function connect() {

        let _serialPort = serialPort;
        if (_serialPort == null) {
            _serialPort = await navigator.serial.requestPort();
            setSerialPort(_serialPort);
        }

        await _serialPort.open({baudRate});
        
        setErrorState({show: false, message: ""});
    }

    function disconnect() {
        if (serialPort?.readable?.locked || serialPort?.writable?.locked) {
            // busy wait
            setErrorState({show: true, message: "Serial port is busy."});
            return;
        }

        serialPort?.close().then(() => {
            setSerialPort(undefined);
        });

        setErrorState({show: false, message: ""});
    }

    function toggleDebug() {
        setDebug(!debug);
    }

    return (<div className="">
        <button className="btn btn-primary m-3" onClick={connect}>connect</button>
        <button className="btn btn-primary" onClick={disconnect}>disconnect</button>
        <div className="form-control max-width">
            <label className="label cursor-pointer">
                <span className="label-text">debug</span>
                <input type="checkbox" className="toggle toggle-primary" checked={debug} onChange={toggleDebug} />
            </label>
        </div>
        <Alert {...errorState} />
    </div>);
}