export class RendererAssets extends EventTarget {
  public loaded: boolean = false;
  public bg: HTMLImageElement | null = null;
  public box: HTMLImageElement | null = null;
  public landmine: HTMLImageElement | null = null;
  public player: HTMLImageElement | null = null;
  public rock: HTMLImageElement | null = null;
  public zombieDead: HTMLImageElement | null = null;
  public zombieIdleFrame1: HTMLImageElement | null = null;
  public zombieIdleFrame2: HTMLImageElement | null = null;
  public zombieIdleFrame3: HTMLImageElement | null = null;
  public zombieIdleFrame4: HTMLImageElement | null = null;
  public zombieWalkingFrame1: HTMLImageElement | null = null;
  public zombieWalkingFrame2: HTMLImageElement | null = null;
  public zombieWalkingFrame3: HTMLImageElement | null = null;
  public zombieWalkingFrame4: HTMLImageElement | null = null;

  constructor() {
    super();
    void this.load();
  }

  private async load() {
    const [
      bg,
      box,
      landmine,
      player,
      rock,
      zombieDead,
      zombieIdleFrame1,
      zombieIdleFrame2,
      zombieIdleFrame3,
      zombieIdleFrame4,
      zombieWalkingFrame1,
      zombieWalkingFrame2,
      zombieWalkingFrame3,
      zombieWalkingFrame4,
    ] = await Promise.all([
      loadAssetImage("/map.webp"),
      loadAssetImage("/entities/box.svg"),
      loadAssetImage("/entities/landmine.svg"),
      loadAssetImage("/entities/player-attacking.svg"),
      loadAssetImage("/entities/rock.svg"),
      loadAssetImage("/entities/zombie-dead.png"),
      loadAssetImage("/entities/zombie-idle-frame1.png"),
      loadAssetImage("/entities/zombie-idle-frame2.png"),
      loadAssetImage("/entities/zombie-idle-frame3.png"),
      loadAssetImage("/entities/zombie-idle-frame4.png"),
      loadAssetImage("/entities/zombie-walking-frame1.png"),
      loadAssetImage("/entities/zombie-walking-frame2.png"),
      loadAssetImage("/entities/zombie-walking-frame3.png"),
      loadAssetImage("/entities/zombie-walking-frame4.png"),
    ]);

    assets.loaded = true;
    assets.bg = bg;
    assets.box = box;
    assets.landmine = landmine;
    assets.player = player;
    assets.rock = rock;
    assets.zombieDead = zombieDead;
    assets.zombieIdleFrame1 = zombieIdleFrame1;
    assets.zombieIdleFrame2 = zombieIdleFrame2;
    assets.zombieIdleFrame3 = zombieIdleFrame3;
    assets.zombieIdleFrame4 = zombieIdleFrame4;
    assets.zombieWalkingFrame1 = zombieWalkingFrame1;
    assets.zombieWalkingFrame2 = zombieWalkingFrame2;
    assets.zombieWalkingFrame3 = zombieWalkingFrame3;
    assets.zombieWalkingFrame4 = zombieWalkingFrame4;

    this.dispatchEvent(new Event("loaded"));
  }
}

export const assets = new RendererAssets();

export async function loadAssetImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = src;
  });
}
