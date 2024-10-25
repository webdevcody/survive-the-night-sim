import {
  type Entity,
  EntityType,
  ZombieSurvival,
} from "@/simulators/zombie-survival";
import { Change } from "@/simulators/zombie-survival/Change";

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

function getEntityImage(entity: Entity): HTMLImageElement | null {
  switch (entity.getType()) {
    case EntityType.Box: {
      return assets.box;
    }
    case EntityType.Player: {
      return assets.player;
    }
    case EntityType.Rock: {
      return assets.rock;
    }
    case EntityType.Zombie: {
      if (entity.getChanges().includes(Change.Walking)) {
        return assets.zombieWalking;
      } else {
        return assets.zombie;
      }
    }
  }
}

export class Renderer {
  private readonly assets: RendererAssets;
  private readonly cellSize: number;
  private readonly h: number;
  private readonly w: number;

  private canvas2: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctx2: CanvasRenderingContext2D;

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
    const entities = simulator.getAllEntities();

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawBg();

    for (const entity of entities) {
      this.drawEntity(entity);
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

    const entityImage = getEntityImage(entity);

    if (entityImage === null) {
      return;
    }

    const entityPosition = entity.getPosition();
    const x = entityPosition.x * this.cellSize;
    const y = entityPosition.y * this.cellSize;

    if (entity.getChanges().includes(Change.Hit)) {
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
}
