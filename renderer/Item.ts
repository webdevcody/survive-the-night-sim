import { type RendererEffect, type RendererEffectType } from "./Effect";
import { type Position } from "@/simulators/zombie-survival";

export class RendererItem {
  data: HTMLImageElement;
  effects: RendererEffect[] = [];
  height: number;
  position: Position;
  width: number;

  constructor(
    data: HTMLImageElement,
    height: number,
    position: Position,
    width: number,
  ) {
    this.data = data;
    this.height = height;
    this.position = position;
    this.width = width;
  }

  public addEffect(...effects: RendererEffect[]) {
    this.effects.push(...effects);
    return this;
  }

  public getEffect<T extends RendererEffectType>(type: T) {
    const effect = this.effects.find((effect) => effect.type === type);

    if (effect === undefined) {
      throw new Error("Unable to find effect of this type");
    }

    return effect as Extract<RendererEffect, { type: T }>;
  }

  public hasEffect(type: RendererEffectType): boolean {
    return this.effects.some((effect) => effect.type === type);
  }
}
