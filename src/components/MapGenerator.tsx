import { useEffect, useState } from "react";
import { Vector2 } from "three";
import IMapDefinition from "./IMapDefinition";
import Map2DVisualizer from "./Map2DVisualizer";

function generateMap(width: number, height: number): number[][] {
    // backtracking algorithm to generate a map

    // The Algorithm
    // 1. Randomly choose a starting cell.
    // 2. Randomly choose a wall at the current cell and open a passage through it to any random, unvisited, adjacent cell. This is now the current cell.
    // 3. If all adjacent cells have been visited, back up to the previous and repeat step 2.
    // 4. Stop when the algorithm has backed all the way up to the starting cell.

    // reference: https://github.com/john-science/mazelib/blob/main/docs/MAZE_GEN_ALGOS.md

    // physical: related to actual cells in the map
    // logical: related to paths and walls in the map

    const logicalMap = createLogicalMap(width, height);
    
    const edge = new Edge(new Node(0, 0), new Node(0, 1));
    console.log(edge)
    return generatePhysicalMapFromEdges([edge], width, height);
}

function createLogicalMap(width: number, height: number): Node[][] {
    const logicalWidth = Math.floor((width - 2) / 2);
    const logicalHeight = Math.floor((height - 2) / 2);

    if (logicalWidth < 1 || logicalHeight < 1) {
        return [];
    }

    const map: Node[][] = [];
    for (let i = 0; i < logicalWidth; i++) {
        map[i] = [];
        for (let j = 0; j < logicalHeight; j++) {
            map[i]![j] = new Node(i, j);
        }
    }

    return map;
}

class Node {

    public row: number;
    public col: number;
    public visited = false;
    
    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    public getPhysicalRow(): number {
        return this.row * 2 + 1;
    }

    public getPhysicalCol(): number {
        return this.col * 2 + 1;
    }
}

type EdgeDirection = "up" | "down" | "left" | "right";

class Edge {
    private from: Node;
    private to: Node;
    private direction: EdgeDirection = "up";
    
    constructor(from: Node, to: Node) {
        this.from = from;
        this.to = to;

        this.direction = this.decideDirection()!;
    }

    public decideDirection(): EdgeDirection | undefined {
        if (this.from.row === this.to.row) {
            if (this.from.col ===  this.to.col + 1) {
                return "left";
            } else if (this.from.col + 1 === this.to.col) {
                return "right";
            }
        } else if (this.from.col === this.to.col) {
            if (this.from.row ===  this.to.row + 1) {
                return "down";
            } else if (this.from.row + 1 === this.to.row) {
                return "up";
            }
        } else {
            throw new Error("Invalid edge");
        }
    }

    getPhysicalPositionsToRemove(): Vector2[] {
        const positions = [];
        positions.push(new Vector2(this.from.getPhysicalRow(), this.from.getPhysicalCol()));
        positions.push(new Vector2(this.to.getPhysicalRow(), this.to.getPhysicalCol()));

        if (this.direction === "up") {
            positions.push(new Vector2(this.from.getPhysicalRow() + 1, this.from.getPhysicalCol()));
        } else if (this.direction === "down") {
            positions.push(new Vector2(this.from.getPhysicalRow() - 1, this.from.getPhysicalCol()));
        }
        else if (this.direction === "right") {
            positions.push(new Vector2(this.from.getPhysicalRow(), this.from.getPhysicalCol() + 1));
        }
        else if (this.direction === "left") {
            positions.push(new Vector2(this.from.getPhysicalRow(), this.from.getPhysicalCol() - 1));
        }

        return positions;
    }
}

function generatePhysicalMapFromEdges(edges: Edge[], width: number, height: number): number[][] {

    const map: number[][] = [];
    for (let i = 0; i < width; i++) {
        map[i] = [];
        for (let j = 0; j < height; j++) {
            map[i]![j] = 1;
        }
    }

    for (const edge of edges) {
        const positionsToRemove = edge.getPhysicalPositionsToRemove();
        for (const position of positionsToRemove) {
            map[position.x]![position.y] = 0;
        }
    }

    return map;
}

interface IMapGeneratorProps {
    mapDefinition: IMapDefinition;
}

export default function MapGenerator(props: IMapGeneratorProps) {
    const width = 20;
    const height = 20;
    const [map, setMap] = useState<number[][]>([]);

    useEffect(() => {
        const _map = generateMap(width, height);
        setMap(_map);
    }, []);

    useEffect(() => {
        props.mapDefinition.map = map;
        props.mapDefinition.width = width;
        props.mapDefinition.height = height;
    }, [map, props.mapDefinition]);

    return <>
        <h2 className="text-lg">map generator</h2>
        <Map2DVisualizer height={height} width={width} map={map} cellSize={props.mapDefinition.cellSize} />
    </>
}