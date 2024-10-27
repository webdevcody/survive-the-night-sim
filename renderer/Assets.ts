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

export const assets: RendererAssets = {
  loading: false,
  loaded: false,
  bg: null,
  box: null,
  player: null,
  rock: null,
  zombie: null,
  zombieWalking: null,
};

export async function loadAssets() {
  if (assets.loading || assets.loaded) {
    return;
  }

  assets.loading = true;

  const [bg, box, player, rock, zombie, zombieHit] = await Promise.all([
    loadAssetImage("/map.webp"),
    loadAssetImage("/entities/box.svg"),
    loadAssetImage("/entities/player-attacking.svg"),
    loadAssetImage("/entities/rock.svg"),
    loadAssetImage("/entities/zombie-idle.svg"),
    loadAssetImage("/entities/zombie-walking.svg"),
  ]);

  assets.loaded = true;
  assets.bg = bg;
  assets.box = box;
  assets.player = player;
  assets.rock = rock;
  assets.zombie = zombie;
  assets.zombieWalking = zombieHit;
}

export async function loadAssetImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = src;
  });
}
