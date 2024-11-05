import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Map } from "@/components/Map";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/convex/constants";
import { useAITesting } from "@/hooks/useAITesting";

interface TestModeProps {
  level: number;
  map: string[][];
}

export default function TestMode({ level, map }: TestModeProps) {
  const [selectedModel, setSelectedModel] = useState<string>(
    AI_MODELS["gpt-4o"].slug,
  );
  const [showOriginalMap, setShowOriginalMap] = useState(true);
  const {
    isSimulating,
    gameResult,
    aiError,
    aiReasoning,
    aiPromptTokensUsed,
    aiOutputTokensUsed,
    aiTotalTokensUsed,
    aiTotalRunCost,
    resultMap,
    runTest,
    resetAITest,
  } = useAITesting({ testingType: "MODEL", level });

  const handleAITest = async () => {
    setShowOriginalMap(false);
    await runTest(selectedModel, map);
  };

  const handleReset = () => {
    setShowOriginalMap(true);
    resetAITest();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {showOriginalMap && (
        <div className="mb-8">
          <Map map={map} />
        </div>
      )}
      <div className="mb-4 flex gap-4">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AI_MODELS).map((model) => (
              <SelectItem key={model.slug} value={model.slug}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAITest} disabled={isSimulating}>
          {isSimulating ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test AI Model"
          )}
        </Button>
        {!showOriginalMap && (
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        )}
      </div>
      {aiError && <div className="mt-4 text-red-500">{aiError}</div>}
      {gameResult && (
        <div className="mx-auto mt-4 flex max-w-4xl flex-col items-center gap-8">
          <Visualizer map={resultMap} autoStart onReset={handleReset} />
          <div className="flex flex-1 flex-col gap-4">
            <div
              className={`text-2xl font-bold ${
                gameResult === "WON" ? "text-green-500" : "text-red-500"
              }`}
            >
              AI {gameResult}
            </div>
            {aiReasoning && (
              <div className="p-4">
                <h3 className="mb-2 font-semibold">AI Reasoning:</h3>
                <p>{aiReasoning}</p>
              </div>
            )}
            <div className="p-4">
              <h3 className="mb-2 font-semibold">Token Usage:</h3>
              <ul className="space-y-1 text-sm">
                <li>Prompt Tokens: {aiPromptTokensUsed ?? "N/A"}</li>
                <li>Output Tokens: {aiOutputTokensUsed ?? "N/A"}</li>
                <li>Total Tokens: {aiTotalTokensUsed ?? "N/A"}</li>
                <li>
                  Total Cost:{" "}
                  {aiTotalRunCost ? `$${aiTotalRunCost.toFixed(6)}` : "N/A"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
