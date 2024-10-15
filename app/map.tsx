export function Map({ map }: { map: string[][] }) {
  return (
    <div>
      {map.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className="size-16 border flex items-center justify-center text-2xl"
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
