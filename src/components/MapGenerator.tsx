import { useEffect, useState } from "react";
import { Vector2 } from "three";
import { config } from "../utils/config";
import IMapDefinition from "./IMapDefinition";
import Map2DVisualizer from "./Map2DVisualizer";

function generateMap(width: number, height: number, singlePath: boolean): number[][] {
    // backtracking algorithm to generate a map

    // The Algorithm
    // 1. Randomly choose a starting cell.
    // 2. Randomly choose a wall at the current cell and open a passage through it to any random, unvisited, adjacent cell. This is now the current cell.
    // 3. If all adjacent cells have been visited, back up to the previous and repeat step 2.
    // 4. Stop when the algorithm has backed all the way up to the starting cell.

    // reference: https://github.com/john-science/mazelib/blob/main/docs/MAZE_GEN_ALGOS.md

    // physical: related to actual cells in the map
    // logical: related to paths and walls in the map

    const edges = createLogicalMap(width, height, singlePath);
    const edge = new Edge(new Node(0, 0), new Node(0, 1));
    return generatePhysicalMapFromEdges(edges, width, height);
}

function createLogicalMap(width: number, height: number, singlePath: boolean): Edge[] {
    const logicalWidth = converToLogicalLength(width);
    const logicalHeight = converToLogicalLength(height);

    if (logicalWidth < 1 || logicalHeight < 1) {
        return [];
    }

    const nodeMap: Node[][] = [];
    for (let i = 0; i < logicalWidth; i++) {
        nodeMap[i] = [];
        for (let j = 0; j < logicalHeight; j++) {
            nodeMap[i]![j] = new Node(i, j);
        }
    }

    // start from 0, 0
    const startNode = nodeMap[0]![0]!;
    startNode.markVisited();

    const backtrackingStack: Node[] = [startNode];
    const edges: Edge[] = [];
    let hitFirstEnd = false;
    while (backtrackingStack.length > 0) {
        const lastNode = backtrackingStack[backtrackingStack.length - 1]!;
        const adjacentNode = lastNode.getRandomNotVisitiedAdjacentNode(nodeMap);
        if (adjacentNode == null) {
            // time to backtrack
            backtrackingStack.pop();

            if (!hitFirstEnd) {
                hitFirstEnd = true;
                lastNode.setToTarget();

                if (singlePath) {
                    break;
                }
            }
            continue;
        } else {
            // add adjacent node to the stack
            adjacentNode.markVisited();
            backtrackingStack.push(adjacentNode);
            edges.push(new Edge(lastNode, adjacentNode));
        }
    }

    return edges;
}

function converToLogicalLength(physicalLength: number): number {
    if (physicalLength % 2 === 0) {
        return (physicalLength - 2) / 2;
    } else {
        return Math.ceil(physicalLength - 2 ) / 2;
    }
}

class Node {

    public row: number;
    public col: number;
    public visited = false;
    public target = false;
    
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

    public getRandomNotVisitiedAdjacentNode(nodeMap: Node[][]): Node | null {
        const adjacentNodes = this.getAdjacentNodes(nodeMap);
        const unvisitedAdjacentNodes = adjacentNodes.filter(node => !node.visited);
        if (unvisitedAdjacentNodes.length > 0) {
            const randomIndex = Math.round(Math.random() * (unvisitedAdjacentNodes.length-1));
            return unvisitedAdjacentNodes[randomIndex]!;
        } else {
            return null;
        }
    }

    public markVisited() {
        this.visited = true;
    }

    public getAdjacentNodes(nodeMap: Node[][]): Node[] {
        const adjacentNodes: Node[] = [];
        const row = this.row;
        const col = this.col;

        if (nodeMap.length === 0 || nodeMap[0]!.length === 0) {
            throw new Error("nodeMap is empty");
        }

        if (row > 0) {
            adjacentNodes.push(nodeMap[row - 1]![col]!);
        }
        if (row < nodeMap.length - 1) {
            adjacentNodes.push(nodeMap[row + 1]![col]!);
        }
        if (col > 0) {
            adjacentNodes.push(nodeMap[row]![col - 1]!);
        }
        if (col < nodeMap[0]!.length - 1) {
            adjacentNodes.push(nodeMap[row]![col + 1]!);
        }
        return adjacentNodes;
    }

    public isTarget(): boolean {
        return this.target;
    }

    public setToTarget() {
        this.target = true;
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

    getTargetPosition(): Vector2 | null {
        if (this.to.isTarget()) {
            return new Vector2(this.to.getPhysicalRow(), this.to.getPhysicalCol());
        } else if (this.from.isTarget()) {
            return new Vector2(this.from.getPhysicalRow(), this.from.getPhysicalCol());
        }
        return null;
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

        const targetPosition = edge.getTargetPosition();
        if (targetPosition != null) {
            map[targetPosition.x]![targetPosition.y] = 2;
        }
    }

    // entrance
    map[1]![0] = 0;

    return map;
}

interface IMapGeneratorProps {
    onMapGenerated: (mapDefinition: IMapDefinition) => void;
}

export default function MapGenerator(props: IMapGeneratorProps) {
    const width = config.game.map.width as number;
    const height = config.game.map.height as number;
    const cellSize = config.game.map.cellSize as number;
    
    const [map, setMap] = useState<number[][]>([]);

    function clickGenerateMap() {
        console.log("generating...");
        const _map = generateMap(width, height, true);
        setMap(_map);

        const mapDefinition = {map: _map, width: width, height: height, cellSize: cellSize};
        props.onMapGenerated(mapDefinition);
    }

    return <>
        <h2 className="text-lg">map generator</h2>
        <button className="btn btn-primary" onClick={clickGenerateMap}>generate</button>
        <Map2DVisualizer height={height} width={width} map={map} cellSize={cellSize} />
    </>
}