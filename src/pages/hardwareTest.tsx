import { NextPage } from "next";
import { useEffect, useState } from "react";


const HardwareTest: NextPage = () => {
    const [ports, setPorts] = useState<any[]>([]);

    useEffect(() => {
        if ("serial" in navigator) {
            // The Web Serial API is supported.
            console.log("Web Serial API supported");
            
          }
    }, []);

    function scanPorts() {
        console.log("scanning ports");
        navigator.serial.requestPort().then((ports: any) => {
            console.log(ports);
        });
    }

    return (
        <div>
            <div>Hardware Test view</div>
            <button onClick={scanPorts}>scan ports</button>
        </div>
    )
}

export default HardwareTest;