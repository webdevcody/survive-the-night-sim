export const CELL_SIZE = 32;

export function getCellImage(cell: string) {
  if (cell === "Z") {
    return (
      <img
        src="/entities/zombie_alive_1.svg"
        alt="Zombie"
        className="h-full w-full"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          top: "-20px",
          left: "16px",
        }}
      />
    );
  }
  if (cell === "P") {
    return (
      <img
        src="/entities/player_alive_1.svg"
        alt="Player"
        className="h-full w-full"
        style={{
          position: "relative",
          top: "-20px",
          left: "4px",
        }}
      />
    );
  }
  if (cell === "R") {
    return (
      <img src="/entities/rocks.svg" alt="Block" className="h-full w-full" />
    );
  }
  if (cell === "B") {
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
                className={`flex items-center justify-center border border-gray-700 bg-transparent text-2xl dark:border-gray-300`}
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
