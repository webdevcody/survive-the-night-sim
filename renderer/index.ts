import { type Entity, EntityType } from "@/simulators/zombie-survival";

export interface RendererAssets {
  bg: HTMLImageElement;
  box: HTMLImageElement;
  player: HTMLImageElement;
  rock: HTMLImageElement;
  zombie: HTMLImageElement;
}

export class Renderer {
  private readonly assets: RendererAssets;
  private readonly cellSize: number;
  private readonly h: number;
  private readonly w: number;

  private ctx: CanvasRenderingContext2D;

  public constructor(
    assets: RendererAssets,
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
  }

  public render(entities: Entity[]) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawBg();

    for (const entity of entities) {
      this.drawEntity(entity);
    }

    this.ctx.globalAlpha = 1.0;
  }

  private drawBg() {
    const canvasRatio = this.w / this.h;
    const bgRatio = this.assets.bg.width / this.assets.bg.height;

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
    this.ctx.drawImage(this.assets.bg, offsetX, offsetY, drawWidth, drawHeight);
    this.ctx.globalAlpha = 1.0;
  }

  private drawEntity(entity: Entity) {
    const entityImage = this.getEntityImage(entity);
    const entityPosition = entity.getPosition();
    const entityOffset = this.getEntityOffset(entity);

    this.ctx.globalAlpha =
      entity.getType() === EntityType.Zombie && entity.getHealth() === 1
        ? 0.5
        : 1;

    this.ctx.drawImage(
      entityImage,
      entityPosition.x * this.cellSize + entityOffset.x,
      entityPosition.y * this.cellSize + entityOffset.y,
      this.cellSize,
      this.cellSize,
    );
  }

  private getEntityImage(entity: Entity): HTMLImageElement {
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
        return this.assets.zombie;
      }
    }
  }

  private getEntityOffset(entity: Entity): { x: number; y: number } {
    return {
      x: entity.getType() === EntityType.Zombie ? 16 : 0,
      y: 0,
    };
  }
}
