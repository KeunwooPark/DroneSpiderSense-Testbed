import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { calculateCollisionDuration, calculateCompletionTime, calculateMoveDistance, calculateNumCollisions, calculateVelocityStats } from "../../utils/analysis";
import DroneLog from "../../utils/DroneLog";

interface IBasicStatsProps {
    droneLogs: DroneLog[];
}

export default function BasicStats(props: IBasicStatsProps) {

    const {droneLogs} = props;
    const [numCollisions, setNumCollisions] = useState<number>(0);
    const [collisionDuration, setCollisionDuration] = useState<number>(0);
    const [completionTime, setCompletionTime] = useState<number>(0);
    const [moveDistance, setMoveDistance] = useState<number>(0);
    const [veloctyStat, setVelocityStat] = useState<{mean: number, std: number}>({mean: 0, std: 0});

    useEffect(() => {
        if (droneLogs == null || droneLogs.length == 0) {
            return;
        }
        const numCollisions = calculateNumCollisions(droneLogs);
        const collisionDuration = calculateCollisionDuration(droneLogs);
        const completionTime = calculateCompletionTime(droneLogs);
        const moveDistance = calculateMoveDistance(droneLogs);

        const {mean: velMean, std: velStd} = calculateVelocityStats(droneLogs);

        setNumCollisions(numCollisions);
        setCollisionDuration(collisionDuration);
        setCompletionTime(completionTime);
        setVelocityStat({mean: velMean, std: velStd});
        setMoveDistance(moveDistance);

    }, [droneLogs]);

    return (
        <div>
            <div className="my-5">
                <h2 className="text-2xl">Basic stats</h2>
                <div className="my-2">
                    <span className="font-bold">Number of collisions: </span>
                    <span>{numCollisions}</span>
                </div>
                <div className="my-2">
                    <span className="font-bold">Time of collisions: </span>
                    <span>{collisionDuration}ms</span>
                </div>
                <div className="my-2">
                    <span className="font-bold">Completion time: </span>
                    <span>{completionTime}ms</span>
                </div>
                <div className="my-2">
                    <span className="font-bold">Velocity mean: </span>
                    <span>{veloctyStat.mean.toFixed(4)}</span>
                </div>
                <div className="my-2">
                    <span className="font-bold">Velocity std: </span>
                    <span>{veloctyStat.std.toFixed(4)}</span>
                </div>
                <div className="my-2">
                    <span className="font-bold">Move Distance: </span>
                    <span>{moveDistance.toFixed(4)}</span>
                </div>
            </div>
        </div>
    );
}