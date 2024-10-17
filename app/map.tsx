export const CELL_SIZE = 32;

export function Map({ map }: { map: string[][] | undefined }) {
  return (
    <div>
      {map?.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`size-16 border flex items-center justify-center text-2xl dark:bg-black bg-slate-50`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
