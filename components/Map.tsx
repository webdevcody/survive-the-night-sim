export const CELL_SIZE = 32;

export function getCellImage(cell: string) {
  if (cell === "Z") {
    return (
      <img
        src="/entities/zombie-idle.svg"
        alt="Zombie"
        className="relative -top-5 left-0 h-full w-full"
      />
    );
  }
  if (cell === "P") {
    return (
      <img
        src="/entities/player-idle.svg"
        alt="Player"
        className="relative -top-5 left-0 h-full w-full"
      />
    );
  }
  if (cell === "R") {
    return (
      <img src="/entities/rock.svg" alt="Block" className="h-full w-full" />
    );
  }
  if (cell === "B") {
    return (
      <img src="/entities/box.svg" alt="Block" className="h-full w-full" />
    );
  }
  if (cell === "L") {
    return (
      <img
        src="/entities/block.svg"
        alt="Block"
        className="h-full w-full"
        style={{
          position: "relative",
          top: "0px",
          left: "0px",
        }}
      />
    );
  }
  return null;
}

export function Map({ map, size = 64 }: { map: string[][]; size?: number }) {
  return (
    <div className="relative">
      <img
        src="/map.webp"
        alt="Background Map"
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="test relative z-10">
        {map.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                className="flex items-center justify-center border border-gray-700 bg-transparent text-2xl dark:border-gray-300"
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
