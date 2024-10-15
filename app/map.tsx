export const CELL_SIZE = 32;

export function Map({ map }: { map: string[][] }) {
  return (
    <div>
      {map.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`size-8 border flex items-center justify-center text-2xl bg-slate-950`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
