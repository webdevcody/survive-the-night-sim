import { type Entity, EntityType } from "@/simulators/zombie-survival";

export interface RendererAssets {
  loading: boolean;
  loaded: boolean;
  bg: HTMLImageElement | null;
  box: HTMLImageElement | null;
  player: HTMLImageElement | null;
  rock: HTMLImageElement | null;
  zombie: HTMLImageElement | null;
  zombieHit: HTMLImageElement | null;
}

const assets: RendererAssets = {
  loading: false,
  loaded: false,
  bg: null,
  box: null,
  player: null,
  rock: null,
  zombie: null,
  zombieHit: null,
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
  assets.zombieHit = zombieHit;
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
      if (entity.getHealth() === 1) {
        return assets.zombieHit;
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

  private ctx: CanvasRenderingContext2D;

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

    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("Unable to get 2d context");
    }

    this.ctx = ctx;

    canvas.setAttribute("height", `${this.h * window.devicePixelRatio}`);
    canvas.setAttribute("width", `${this.w * window.devicePixelRatio}`);
    canvas.style.height = `${this.h}px`;
    canvas.style.width = `${this.w}px`;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    void loadAssets();
  }

  public render(entities: Entity[]) {
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
    const entityImage = getEntityImage(entity);

    if (entityImage === null) {
      return;
    }

    const entityPosition = entity.getPosition();

    this.ctx.globalAlpha =
      entity.getType() === EntityType.Zombie && entity.getHealth() === 1
        ? 0.5
        : 1;

    this.ctx.drawImage(
      entityImage,
      entityPosition.x * this.cellSize,
      entityPosition.y * this.cellSize,
      this.cellSize,
      this.cellSize,
    );

    this.ctx.globalAlpha = 1;
  }
}
