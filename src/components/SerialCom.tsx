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

    useEffect(() => {
        if (!("serial" in navigator)) {
            setErrorState({show: true, message: "Web Serial API not supported in this browser."});
          }
    }, []);

    useInterval(() => {
        const packet = props.hapticPacketQueue.shift();
        if (packet) {
            const data = new Int8Array([packet.actuatorID, packet.intensity]);
            console.log(data);
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

    return (<div>
        <button className="btn btn-primary" onClick={connect}>connect</button>
        <button className="btn btn-primary" onClick={disconnect}>disconnect</button>
        <Alert {...errorState} />
    </div>);
}