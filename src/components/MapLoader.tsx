import { useState } from "react";
import IMapDefinition from "./IMapDefinition";

interface IMapLoaderProps {
  onMapLoaded: (mapDefinition: IMapDefinition) => void;
}

export default function MapLoader(props: IMapLoaderProps) {
  const [loadingFile, setLoadingFile] = useState(false);

  function handleFileChange(event: any) {
    if (event.target.files.length < 1) {
      return;
    }

    setLoadingFile(true);

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target!.result as string;
      const mapDefinition = parseMapDefinition(text);
      setLoadingFile(false);
      props.onMapLoaded(mapDefinition);
    };
    reader.readAsText(file);
  }

  const parseMapDefinition = (text: string): IMapDefinition => {
    const lines = text.split("\n");
    const map: number[][] = [];
    for (const line of lines) {
      const row = line.split(",").map((x) => parseInt(x));
      map.push(row);
    }

    const width = map.length;
    const height = map[0]!.length;

    const mapDefinition: IMapDefinition = {
      map: map,
      width: width,
      height: height,
      cellSize: 1,
    };
    return mapDefinition;
  };

  return (
    <>
      <h2 className="text-lg">map generator</h2>
      <input type="file" onChange={handleFileChange} />
      <progress className="progress w-56"></progress>
    </>
  );
}
