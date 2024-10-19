export const CELL_SIZE = 32;

export function getCellImage(cell: string) {
  if (cell === "Z") {
    return (
      <img
        src="/entities/zombie_alive_1.svg"
        alt="Zombie"
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          top: "-20px",
          left: "4px",
        }}
      />
    );
  }
  if (cell === "P") {
    return (
      <img
        src="/entities/player_alive_1.svg"
        alt="Player"
        className="w-full h-full"
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
      <img src="/entities/rocks.svg" alt="Block" className="w-full h-full" />
    );
  }
  if (cell === "B") {
    return (
      <img
        src="/entities/block.svg"
        alt="Block"
        className="w-full h-full"
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
        src="/map.png"
        alt="Background Map"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="relative z-10 test">
        {map.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                className={`border dark:border-gray-300 border-gray-700 flex items-center justify-center text-2xl bg-transparent`}
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
