export const CELL_SIZE = 32;

export function getCellImage(cell: string) {
  if (cell === "Z") {
    return (
      <img
        src="/entities/zombie_alive_1.svg"
        alt="Zombie"
        className="w-full h-full"
      />
    );
  }
  if (cell === "P") {
    return (
      <img
        src="/entities/player_alive_1.svg"
        alt="Player"
        className="w-full h-full"
      />
    );
  }
  if (cell === "R") {
    return (
      <img src="/entities/rocks.png" alt="Block" className="w-full h-full" />
    );
  }
  if (cell === "B") {
    return (
      <img src="/entities/block.svg" alt="Block" className="w-full h-full" />
    );
  }
  return null;
}

export function Map({ map }: { map: string[][] }) {
  return (
    <div className="relative">
      <img
        src="/map.png"
        alt="Background Map"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="relative z-10">
        {map.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`size-16 border dark:border-gray-300 border-gray-700 flex items-center justify-center text-2xl bg-transparent`}
              >
                {getCellImage(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
