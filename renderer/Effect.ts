import { type Position } from "@/simulators/zombie-survival";

export enum RendererEffectType {
  HueRotate,
  Move,
  Opacity,
}

export type RendererEffect =
  | {
      type: RendererEffectType.HueRotate;
      degree: number;
    }
  | {
      type: RendererEffectType.Move;
      duration: number;
      startedAt: number;
      to: Position;
    }
  | {
      type: RendererEffectType.Opacity;
      value: number;
    };
