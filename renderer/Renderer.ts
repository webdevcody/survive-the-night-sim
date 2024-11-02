import { assets, loadAssets } from "./Assets";
import * as Canvas from "./Canvas";
import { RendererEffectType } from "./Effect";
import { RendererItem } from "./Item";
import { REPLAY_SPEED } from "@/constants/visualizer";
import {
  type Entity,
  EntityType,
  type Position,
  type ZombieSurvival,
} from "@/simulators/zombie-survival";
import { ChangeType } from "@/simulators/zombie-survival/Change";

export class Renderer {
  private readonly cellSize: number;
  private readonly h: number;
  private readonly w: number;

  private canvas2: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctx2: CanvasRenderingContext2D;
  private items: RendererItem[] = [];
  private req: number | null = null;

  public constructor(
    boardHeight: number,
    boardWidth: number,
    canvas: HTMLCanvasElement,
    cellSize: number,
  ) {
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

    this.register(simulator);
    this.draw();
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    for (const item of this.items) {
      this.drawItem(item);
    }

    if (this.shouldAnimate()) {
      this.req = window.requestAnimationFrame(() => {
        this.req = null;
        this.draw();
      });
    }
  }

  private drawItem(item: RendererItem) {
    if (item.hasEffect(RendererEffectType.Opacity)) {
      const effect = item.getEffect(RendererEffectType.Opacity);
      this.ctx.globalAlpha = effect.value / 100;
    }

    let x = item.position.x;
    let y = item.position.y;

    if (item.hasEffect(RendererEffectType.PositionTo)) {
      const effect = item.getEffect(RendererEffectType.PositionTo);
      const timePassed = Date.now() - effect.startedAt;
      const delta = timePassed / effect.duration;

      x += (effect.to.x - x) * delta;
      y += (effect.to.y - y) * delta;
    }

    let source: HTMLImageElement = item.data;

    if (item.hasEffect(RendererEffectType.AssetSwap)) {
      const effect = item.getEffect(RendererEffectType.AssetSwap);
      const assets = [item.data, effect.to];
      const timePassed = Date.now() - effect.startedAt;
      const assetIdx = Math.floor((timePassed / effect.every) % assets.length);

      source = assets[assetIdx];
    }

    if (item.hasEffect(RendererEffectType.FlipHorizontal)) {
      this.ctx2.clearRect(0, 0, item.width, item.height);
      this.ctx2.save();
      this.ctx2.translate(item.width, 0);
      this.ctx2.scale(-1, 1);
      this.ctx2.drawImage(source, 0, 0, item.width, item.height);
      this.ctx2.restore();

      source = Canvas.toImage(this.canvas2);
    }

    if (item.hasEffect(RendererEffectType.HueRotate)) {
      const effect = item.getEffect(RendererEffectType.HueRotate);
      this.ctx2.clearRect(0, 0, item.width, item.height);

      this.ctx2.filter = `hue-rotate(${effect.degree}deg)`;
      this.ctx2.drawImage(source, 0, 0, item.width, item.height);
      this.ctx2.filter = "none";

      this.ctx2.globalCompositeOperation = "destination-in";
      this.ctx2.fillRect(0, 0, item.width, item.height);
      this.ctx2.globalCompositeOperation = "source-over";

      source = Canvas.toImage(this.canvas2);
    }

    this.ctx.drawImage(source, x, y, item.width, item.height);
    this.ctx.globalAlpha = 1;
  }

  private getEntityImage(entity: Entity): HTMLImageElement | null {
    switch (entity.getType()) {
      case EntityType.Box: {
        return assets.box;
      }
      case EntityType.Landmine: {
        return assets.landmine;
      }
      case EntityType.Player: {
        return assets.player;
      }
      case EntityType.Rock: {
        return assets.rock;
      }
      case EntityType.Zombie: {
        if (entity.hasChange(ChangeType.Killed)) {
          return assets.zombieDead;
        } else if (entity.hasChange(ChangeType.Walking)) {
          return assets.zombieWalking;
        } else {
          return assets.zombie;
        }
      }
    }
  }

  private register(simulator: ZombieSurvival) {
    this.items = [];
    this.registerBg();

    const entities = simulator.getAllEntities();

    for (const entity of entities) {
      this.registerEntity(entity);
    }
  }

  private registerBg() {
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

    const position: Position = {
      x: offsetX,
      y: offsetY,
    };

    const rendererItem = new RendererItem(
      assets.bg,
      drawHeight,
      position,
      drawWidth,
    );

    rendererItem.addEffect({
      type: RendererEffectType.Opacity,
      value: 50,
    });

    this.items.push(rendererItem);
  }

  private registerEntity(entity: Entity) {
    const entityImage = this.getEntityImage(entity);

    if (entityImage === null || (entity.dead() && !entity.hasChanges())) {
      return;
    }

    const position: Position = {
      x: entity.getPosition().x * this.cellSize,
      y: entity.getPosition().y * this.cellSize,
    };

    const rendererItem = new RendererItem(
      entityImage,
      this.cellSize,
      position,
      this.cellSize,
    );

    if (entity.hasChange(ChangeType.Hit)) {
      rendererItem.addEffect({
        type: RendererEffectType.HueRotate,
        degree: 300,
      });
    }

    if (entity.hasChange(ChangeType.Walking)) {
      const change = entity.getChange(ChangeType.Walking);
      const { to, from } = change;

      position.x = from.x * this.cellSize;
      position.y = from.y * this.cellSize;

      rendererItem.addEffect({
        type: RendererEffectType.PositionTo,
        duration: REPLAY_SPEED,
        startedAt: Date.now(),
        to: {
          x: to.x * this.cellSize,
          y: to.y * this.cellSize,
        },
      });

      if (from.x < to.x) {
        rendererItem.addEffect({
          type: RendererEffectType.FlipHorizontal,
        });
      }

      if (assets.zombieWalkingStep !== null) {
        rendererItem.addEffect({
          type: RendererEffectType.AssetSwap,
          duration: REPLAY_SPEED,
          every: REPLAY_SPEED / 6,
          startedAt: Date.now(),
          to: assets.zombieWalkingStep,
        });
      }
    }

    this.items.push(rendererItem);
  }

  private shouldAnimate(): boolean {
    for (const item of this.items) {
      if (item.effects.length === 0) {
        continue;
      }

      for (const effect of item.effects) {
        if (
          effect.type === RendererEffectType.AssetSwap ||
          effect.type === RendererEffectType.PositionTo
        ) {
          if (Date.now() < effect.startedAt + effect.duration) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
