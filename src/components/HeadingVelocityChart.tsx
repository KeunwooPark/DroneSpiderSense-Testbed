import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { radToDeg } from "three/src/math/MathUtils";
import DroneLog from "../utils/DroneLog";

interface IHeadingVelocityChartProps {
    droneLogs: DroneLog[];
}

interface IHeadingVelocityChartBindingData {
    index: number;
    heading: Vector3;
    velocity: Vector3;
    angle: number;
}

export default function HeadingVelocityChart(props: IHeadingVelocityChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const width = 1000;
    const height = 600;
    // margin is necessary to avoid cutting off the axis labels.
    const margine = {top: 10, right: 30, bottom: 30, left: 60};

    const [average, setAverage] = useState<number>(0);
    const [std, setSTD] = useState<number>(0);

    useEffect(() => {
        if (containerRef.current == null) {
            return;
        }

        
        const data: IHeadingVelocityChartBindingData[] = props.droneLogs.map((dl, i) => {
            const heading = dl.getHeading();
            const velocity = dl.getVelocity();
            let angle = 0;
            if (velocity.length() > 0) {
                angle = heading.clone().angleTo(velocity);
            }

            return {
                index: i,
                heading,
                velocity,
                angle,
            }
        });

        const container = d3.select(containerRef.current);

        // prepare svg
        const svg = container.append("svg").attr("width", width + margine.left + margine.right).attr("height", height + margine.top + margine.bottom)
                                .append("g").attr("transform", `translate(${margine.left}, ${margine.top})`);

        
        // set axis
        const xAxis = d3.scaleLinear().range([0, width]).domain(d3.extent(data, d => d.index) as [number, number]);
        const minAngle = d3.min(data, d => {return d.angle})!
        const maxAngle = d3.max(data, d => {return d.angle})!
        
        const yAxis = d3.scaleLinear().domain([minAngle, maxAngle]).range([0, height]);

        svg.append("g").call(d3.axisBottom(xAxis)).attr("transform", `translate(0, ${height})`);
        svg.append("g").call(d3.axisLeft(yAxis));

        // set line

        const line = d3.line<any>().x((d) => xAxis(d.index)).y(d => yAxis(d.angle));
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 1.5)
            .attr("d", line);

        const averageAngle = d3.mean(data, d => d.angle)!;
        setAverage(averageAngle);

        const stdAngle = d3.deviation(data, d => d.angle)!;
        setSTD(stdAngle);

        return () => {
            if (containerRef.current != null) {
                containerRef.current.removeChild(containerRef.current.firstChild as Node);
            }
        }
    }, [props.droneLogs]);

    return (
        <>
            <div ref={containerRef}>
            </div>
            <div>{`average: ${average} rad = ${radToDeg(average)} deg`}</div>
            <div>{`std: ${std} rad  = ${radToDeg(std)} deg`}</div>
        </>
    );
} 