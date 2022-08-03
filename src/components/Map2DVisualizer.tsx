import IMapDefinition from "./IMapDefinition";

export default function Map2DVisualizer(props: IMapDefinition) {
    

    

    function getMapAsGrid() {
        const grid: JSX.Element[] = [];
        for (let i = 0; i < props.width; i++) {
            const col = <div key={`map-col-${i}`}>{getRows(i)}</div>;
            grid.push(col);
        }
        return grid;
    }

    function getRows(col: number) {
        const rows: JSX.Element[] = [];
        for (let i=0; i < props.height; i++) {
            const value = props.map[i]![col];
            const color = value === 1 ? "bg-yellow-300" : "bg-white";
            const cell = <div className={color} key={`map-col-${col}-row-${i}`} id={`map-col-${col}-row-${i}`}>{value}</div>
            rows.push(cell);
        }
        
        return rows;
    }
    return <div className="w-1/2 flex flex-row">{getMapAsGrid()}</div>
}