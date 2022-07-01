import { NextPage } from "next"
import TwoDimDroneGameThreeScene from "../components/TwoDimDroneGameThreeScene";

const TwoDimDroneGame: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-1/2 mx-auto min-h-screen">
            <h1 className="text-5xl">TwoDimDroneGame</h1>
            <TwoDimDroneGameThreeScene height={512} width={512} />
        </div>
    )
}

export default TwoDimDroneGame;
