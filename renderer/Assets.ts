export interface RendererAssets {
  loading: boolean;
  loaded: boolean;
  bg: HTMLImageElement | null;
  box: HTMLImageElement | null;
  landmine: HTMLImageElement | null;
  player: HTMLImageElement | null;
  rock: HTMLImageElement | null;
  zombie: HTMLImageElement | null;
  zombieDead: HTMLImageElement | null;
  zombieWalking: HTMLImageElement | null;
}

export const assets: RendererAssets = {
  loading: false,
  loaded: false,
  bg: null,
  box: null,
  landmine: null,
  player: null,
  rock: null,
  zombie: null,
  zombieDead: null,
  zombieWalking: null,
};

export async function loadAssets() {
  if (assets.loading || assets.loaded) {
    return;
  }

  assets.loading = true;

  const [bg, box, landmine, player, rock, zombie, zombieDead, zombieWalking] =
    await Promise.all([
      loadAssetImage("/map.webp"),
      loadAssetImage("/entities/box.svg"),
      loadAssetImage("/entities/landmine.svg"),
      loadAssetImage("/entities/player-attacking.svg"),
      loadAssetImage("/entities/rock.svg"),
      loadAssetImage("/entities/zombie-idle.svg"),
      loadAssetImage("/entities/zombie-dead.svg"),
      loadAssetImage("/entities/zombie-walking.svg"),
    ]);

  assets.loaded = true;
  assets.bg = bg;
  assets.box = box;
  assets.landmine = landmine;
  assets.player = player;
  assets.rock = rock;
  assets.zombie = zombie;
  assets.zombieDead = zombieDead;
  assets.zombieWalking = zombieWalking;
}

export async function loadAssetImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = src;
  });
}
