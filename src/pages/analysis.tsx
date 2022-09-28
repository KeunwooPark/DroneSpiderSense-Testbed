import { NextPage } from "next";
import { useState } from "react";
import HeadingVelocityChart from "../components/HeadingVelocityChart";
import DroneLog from "../utils/DroneLog";

const Analysys: NextPage = () => {

    const [droneLogs, setDroneLogs] = useState<DroneLog[]>([]);

    function onFileChange(e: any) {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target == null) {
                return;
            }
            const droneLogAsString = (e.target.result as string).trim().split("\n");
            const droneLogs = droneLogAsString.map(ls => DroneLog.parse(ls));
            setDroneLogs(droneLogs);
        }

        fileReader.readAsText(file);
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl my-5">Analysis view</h1>

            <div className="form-control" onChange={onFileChange}>
                <label className="label">{"log file (.txt)"}</label>
                <input type="file"></input>
            </div>
            <div>
                <HeadingVelocityChart droneLogs={droneLogs} />
            </div>
        </div>
    )
}

export default Analysys