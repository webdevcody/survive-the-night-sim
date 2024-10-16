import { Doc } from "@/convex/_generated/dataModel";

export function ResultStatus({ result }: { result: Doc<"results"> }) {
  return (
    <div
      className={`font-bold ${result.isWin ? "text-green-500" : "text-red-500"}`}
    >
      {result.isWin ? "Won" : "Lost"}
    </div>
  );
}
