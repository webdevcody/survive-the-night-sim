"use client";

import React from "react";

export interface VisualizerContextImages {
  bg: HTMLImageElement;
  box: HTMLImageElement;
  player: HTMLImageElement;
  rock: HTMLImageElement;
  zombie: HTMLImageElement;
}

export interface VisualizerContextValue {
  getImages: () => VisualizerContextImages;
  ready: boolean;
}

const VisualizerContext = React.createContext<VisualizerContextValue | null>(
  null,
);

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = src;
  });
}

export default function VisualizerProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [ready, setReady] = React.useState(false);
  const images = React.useRef<VisualizerContextImages | null>(null);

  React.useEffect(() => {
    Promise.all([
      loadImage("/map.png"),
      loadImage("/entities/block.svg"),
      loadImage("/entities/player_alive_1.svg"),
      loadImage("/entities/rocks.png"),
      loadImage("/entities/zombie_alive_1.svg"),
    ]).then((result) => {
      setReady(true);

      images.current = {
        bg: result[0],
        box: result[1],
        player: result[2],
        rock: result[3],
        zombie: result[4],
      };
    });
  }, []);

  function getImages(): VisualizerContextImages {
    if (!ready) {
      throw new Error(
        "Tried accessing visualizer images before they are loaded",
      );
    }

    return images.current!;
  }

  return (
    <VisualizerContext.Provider value={{ getImages, ready }}>
      {children}
    </VisualizerContext.Provider>
  );
}

export function useVisualizer() {
  const context = React.useContext(VisualizerContext);

  if (context === null) {
    throw new Error(
      "useVisualizer should be used within the VisualizerProvider",
    );
  }

  return context;
}
