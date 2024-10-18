import { ZombieSurvival } from "@/simulators/zombie-survival";

export function MapStatus({ map }: { map: string[][] }) {
  const isWin = ZombieSurvival.isWin(map);

  return (
    <div className={`font-bold ${isWin ? "text-green-500" : "text-red-500"}`}>
      {isWin ? "WON" : "LOST"}
    </div>
  );
}
