import { type RendererEffect, type RendererEffectType } from "./Effect";
import { type Position } from "@/simulator";

export class RendererItem {
  data: HTMLImageElement | string;
  effects: RendererEffect[] = [];
  height: number;
  position: Position;
  width: number;
  label?: string;

  constructor(
    data: HTMLImageElement | string,
    position: Position,
    width: number,
    height: number,
    label?: string,
  ) {
    this.data = data;
    this.height = height;
    this.position = position;
    this.width = width;
    this.label = label;
  }

  public getDisplayName(): string {
    return this.label ?? "";
  }

  public hasDisplayName(): boolean {
    return this.label !== undefined;
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
