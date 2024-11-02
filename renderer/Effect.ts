import { type Position } from "@/simulators/zombie-survival";

export enum RendererEffectType {
  AssetSwap,
  FlipHorizontal,
  HueRotate,
  Opacity,
  PositionTo,
}

export type RendererEffect =
  | {
      type: RendererEffectType.AssetSwap;
      duration: number;
      every: number;
      startedAt: number;
      to: HTMLImageElement;
    }
  | {
      type: RendererEffectType.FlipHorizontal;
    }
  | {
      type: RendererEffectType.HueRotate;
      degree: number;
    }
  | {
      type: RendererEffectType.Opacity;
      value: number;
    }
  | {
      type: RendererEffectType.PositionTo;
      duration: number;
      startedAt: number;
      to: Position;
    };
