import { REPLAY_SPEED } from "@/constants/visualizer";
import {
  type Entity,
  EntityType,
  Position,
  ZombieSurvival,
  move,
} from "@/simulators/zombie-survival";
import { ChangeType } from "@/simulators/zombie-survival/Change";

export interface AnimatedEntity {
  entity: Entity;
  duration: number;
  startedAt: number;
  from: Position;
  to: Position;
}

export interface RendererAssets {
  loading: boolean;
  loaded: boolean;
  bg: HTMLImageElement | null;
  box: HTMLImageElement | null;
  player: HTMLImageElement | null;
  rock: HTMLImageElement | null;
  zombie: HTMLImageElement | null;
  zombieWalking: HTMLImageElement | null;
}

const assets: RendererAssets = {
  loading: false,
  loaded: false,
  bg: null,
  box: null,
  player: null,
  rock: null,
  zombie: null,
  zombieWalking: null,
};

async function loadAssets() {
  if (assets.loading || assets.loaded) {
    return;
  }

  assets.loading = true;

  const [bg, box, player, rock, zombie, zombieHit] = await Promise.all([
    loadImage("/map.webp"),
    loadImage("/entities/box.svg"),
    loadImage("/entities/player-attacking.svg"),
    loadImage("/entities/rock.svg"),
    loadImage("/entities/zombie-idle.svg"),
    loadImage("/entities/zombie-walking.svg"),
  ]);

  assets.loaded = true;
  assets.bg = bg;
  assets.box = box;
  assets.player = player;
  assets.rock = rock;
  assets.zombie = zombie;
  assets.zombieWalking = zombieHit;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = src;
  });
}

export class Renderer {
  private readonly assets: RendererAssets;
  private readonly cellSize: number;
  private readonly h: number;
  private readonly w: number;

  private canvas2: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctx2: CanvasRenderingContext2D;
  private req: number | null = null;
  private simulator: ZombieSurvival | null = null;

  public constructor(
    boardHeight: number,
    boardWidth: number,
    canvas: HTMLCanvasElement,
    cellSize: number,
  ) {
    this.assets = assets;
    this.cellSize = cellSize;
    this.h = boardHeight * cellSize;
    this.w = boardWidth * cellSize;

    this.canvas2 = document.createElement("canvas");

    const ctx = canvas.getContext("2d");
    const ctx2 = this.canvas2.getContext("2d");

    if (ctx === null || ctx2 === null) {
      throw new Error("Unable to get 2d context");
    }

    this.ctx = ctx;
    this.ctx2 = ctx2;

    canvas.height = this.h * window.devicePixelRatio;
    canvas.width = this.w * window.devicePixelRatio;
    canvas.style.height = `${this.h}px`;
    canvas.style.width = `${this.w}px`;

    this.canvas2.width = this.cellSize * window.devicePixelRatio;
    this.canvas2.height = this.cellSize * window.devicePixelRatio;
    this.canvas2.style.height = `${this.cellSize}px`;
    this.canvas2.style.width = `${this.cellSize}px`;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx2.scale(window.devicePixelRatio, window.devicePixelRatio);

    void loadAssets();
  }

  public render(simulator: ZombieSurvival) {
    if (this.req !== null) {
      window.cancelAnimationFrame(this.req);
      this.req = null;
    }

    this.simulator = simulator;
    this.draw();
  }

  private draw() {
    if (this.simulator === null) {
      return;
    }

    const entities = this.simulator.getAllEntities();

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawBg();

    for (const entity of entities) {
      this.drawEntity(entity);
    }

    if (this.hasEntitiesToAnimate()) {
      this.req = window.requestAnimationFrame(() => {
        this.req = null;
        this.draw();
      });
    }
  }

  private drawBg() {
    if (assets.bg === null) {
      return;
    }

    const canvasRatio = this.w / this.h;
    const bgRatio = assets.bg.width / assets.bg.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (bgRatio > canvasRatio) {
      drawWidth = this.h * bgRatio;
      drawHeight = this.h;
      offsetX = (this.w - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = this.w;
      drawHeight = this.w / bgRatio;
      offsetX = 0;
      offsetY = (this.h - drawHeight) / 2;
    }

    this.ctx.globalAlpha = 0.5;
    this.ctx.drawImage(assets.bg, offsetX, offsetY, drawWidth, drawHeight);
    this.ctx.globalAlpha = 1.0;
  }

  private drawEntity(entity: Entity) {
    if (entity.dead()) {
      return;
    }

    const entityImage = this.getEntityImage(entity);

    if (entityImage === null) {
      return;
    }

    const entityPosition = entity.getPosition();
    let x = entityPosition.x;
    let y = entityPosition.y;

    if (entity.hasChange(ChangeType.Walking)) {
      const change = entity.getChange(ChangeType.Walking);
      const timePassed = Date.now() - change.startedAt;
      const delta = timePassed / change.duration;
      const { to, from } = change;

      x = from.x + (to.x - from.x) * delta;
      y = from.y + (to.y - from.y) * delta;
    }

    x *= this.cellSize;
    y *= this.cellSize;

    if (entity.hasChange(ChangeType.Hit)) {
      this.ctx2.clearRect(0, 0, this.cellSize, this.cellSize);

      this.ctx2.filter = "hue-rotate(300deg)";
      this.ctx2.drawImage(entityImage, 0, 0, this.cellSize, this.cellSize);
      this.ctx2.filter = "none";

      this.ctx2.globalCompositeOperation = "destination-in";
      this.ctx2.fillRect(0, 0, this.cellSize, this.cellSize);
      this.ctx2.globalCompositeOperation = "source-over";

      this.ctx.drawImage(this.canvas2, x, y, this.cellSize, this.cellSize);
      return;
    }

    this.ctx.drawImage(entityImage, x, y, this.cellSize, this.cellSize);
  }

  private getEntityImage(entity: Entity): HTMLImageElement | null {
    switch (entity.getType()) {
      case EntityType.Box: {
        return this.assets.box;
      }
      case EntityType.Player: {
        return this.assets.player;
      }
      case EntityType.Rock: {
        return this.assets.rock;
      }
      case EntityType.Zombie: {
        if (entity.hasChange(ChangeType.Walking)) {
          return this.assets.zombieWalking;
        } else {
          return this.assets.zombie;
        }
      }
    }
  }

  private hasEntitiesToAnimate(): boolean {
    if (this.simulator === null) {
      return false;
    }

    const entities = this.simulator.getAllEntities();
    return entities.some((entity) => entity.animating());
  }
}
