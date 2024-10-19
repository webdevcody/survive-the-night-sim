import React from "react";
import { Button } from "@/components/ui/button";
import {
  type Entity,
  EntityType,
  Position,
  ZombieSurvival,
} from "@/simulators/zombie-survival";
import {
  type VisualizerContextImages,
  useVisualizer,
} from "./VisualizerProvider";

const AUTO_REPLAY_SPEED = 1_500;
const REPLAY_SPEED = 600;

function getEntityImage(
  entity: Entity,
  images: VisualizerContextImages,
): HTMLImageElement {
  switch (entity.getType()) {
    case EntityType.Box: {
      return images.box;
    }
    case EntityType.Player: {
      return images.player;
    }
    case EntityType.Rock: {
      return images.rock;
    }
    case EntityType.Zombie: {
      return images.zombie;
    }
  }
}

function getImageOffset(entity: Entity): Position {
  if (entity.getType() === EntityType.Zombie) {
    return { x: 16, y: 0 };
  }
  return { x: 0, y: 0 };
}

function cloneMap(map: string[][]): string[][] {
  return JSON.parse(JSON.stringify(map));
}

export function Visualizer({
  autoReplay = false,
  autoStart = false,
  controls = true,
  cellSize = "64",
  map,
  onSimulationEnd,
}: {
  autoReplay?: boolean;
  autoStart?: boolean;
  controls?: boolean;
  cellSize?: string;
  map: string[][];
  onSimulationEnd?: (isWin: boolean) => unknown;
}) {
  const visualizer = useVisualizer();
  const simulator = React.useRef<ZombieSurvival>(new ZombieSurvival(map));
  const interval = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvas = React.useRef<HTMLCanvasElement | null>(null);
  const running = React.useRef(false);
  const cellSizeNum = Number.parseInt(cellSize, 10);
  const h = ZombieSurvival.boardHeight(map) * cellSizeNum;
  const w = ZombieSurvival.boardWidth(map) * cellSizeNum;

  React.useEffect(() => {
    if (canvas.current !== null && visualizer.ready) {
      setupCanvas(canvas.current);
    }
  }, [visualizer.ready]);

  function setupCanvas(canvas: HTMLCanvasElement) {
    canvas.setAttribute("height", `${h * window.devicePixelRatio}`);
    canvas.setAttribute("width", `${w * window.devicePixelRatio}`);
    canvas.style.height = `${h}px`;
    canvas.style.width = `${w}px`;

    const ctx = canvas.getContext("2d");

    if (ctx !== null) {
      setupContext(ctx);
    }
  }

  function setupContext(ctx: CanvasRenderingContext2D) {
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  React.useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
  }, [autoStart]);

  function startSimulation() {
    simulator.current = new ZombieSurvival(map);
    running.current = true;
    interval.current = setInterval(stepSimulation, REPLAY_SPEED);
  }

  function stepSimulation() {
    if (simulator.current === null && running) {
      return;
    }

    if (!simulator.current.finished()) {
      simulator.current.step();
      render();
      return;
    }

    clearInterval(interval.current!);
    interval.current = null;

    if (autoReplay) {
      timeout.current = setTimeout(() => {
        timeout.current = null;
        startSimulation();
      }, AUTO_REPLAY_SPEED);

      return;
    }

    running.current = false;

    if (onSimulationEnd) {
      onSimulationEnd(!simulator.current.getPlayer().dead());
    }
  }

  function render() {
    if (canvas.current !== null) {
      const ctx = canvas.current.getContext("2d");

      if (ctx !== null) {
        renderCtx(ctx);
      }
    }
  }

  function renderCtx(ctx: CanvasRenderingContext2D) {
    renderCtxBg(ctx);

    const entities = simulator.current.getAllAliveEntities();
    const images = visualizer.getImages();

    for (const entity of entities) {
      const entityImage = getEntityImage(entity, images);
      const entityPosition = entity.getPosition();

      ctx.globalAlpha =
        entity.getType() === EntityType.Zombie && entity.getHealth() === 1
          ? 0.5
          : 1;

      const offset = getImageOffset(entity);

      ctx.drawImage(
        entityImage,
        entityPosition.x * cellSizeNum + offset.x,
        entityPosition.y * cellSizeNum + offset.y,
        cellSizeNum,
        cellSizeNum,
      );
    }

    ctx.globalAlpha = 1.0;
  }

  function renderCtxBg(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, w, h);

    const canvasRatio = w / h;
    const images = visualizer.getImages();
    const bgRatio = images.bg.width / images.bg.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (bgRatio > canvasRatio) {
      drawWidth = h * bgRatio;
      drawHeight = h;
      offsetX = (w - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = w;
      drawHeight = w / bgRatio;
      offsetX = 0;
      offsetY = (h - drawHeight) / 2;
    }

    ctx.globalAlpha = 0.5;
    ctx.drawImage(images.bg, offsetX, offsetY, drawWidth, drawHeight);
    ctx.globalAlpha = 1.0;
  }

  React.useEffect(() => {
    if (canvas.current === null) {
      return;
    }

    const observer = new IntersectionObserver(handleObserving);
    observer.observe(canvas.current);

    return () => {
      if (canvas.current) {
        observer.unobserve(canvas.current);
      }
    };
  }, [canvas]);

  function handleObserving([entry]: IntersectionObserverEntry[]) {
    running.current = !entry.isIntersecting;
  }

  React.useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} />
      <div>
        {controls && (
          <div className="flex gap-2 justify-center py-2">
            <Button onClick={startSimulation} disabled={running.current}>
              Replay
            </Button>
            <Button
              disabled={running.current}
              onClick={() => {
                simulator.current = new ZombieSurvival(map);
                running.current = false;
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
