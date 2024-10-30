import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useAction } from "convex/react";
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
import { api } from "@/convex/_generated/api";
import { AI_MODELS } from "@/convex/constants";
import { errorMessage } from "@/lib/utils";

interface TestModeProps {
  level: number;
  map: string[][];
}

export default function TestMode({ level, map }: TestModeProps) {
  const [playerMap, setPlayerMap] = useState<string[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState<"WON" | "LOST" | null>(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].model);
  const testAIModel = useAction(api.maps.testAIModel);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [aiPromptTokensUsed, setAiPromptTokensUsed] = useState<number | null>(
    null,
  );
  const [aiOutputTokensUsed, setAiOutputTokensUsed] = useState<number | null>(
    null,
  );
  const [aiTotalTokensUsed, setAiTotalTokensUsed] = useState<number | null>(
    null,
  );
  const [aiTotalRunCost, setAiTotalRunCost] = useState<number | null>(null);

  const [showOriginalMap, setShowOriginalMap] = useState(true);

  const handleAITest = async () => {
    setIsSimulating(true);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);
    setShowOriginalMap(false);

    try {
      const result = await testAIModel({
        level,
        modelId: selectedModel,
      });

      if (!result.map) {
        throw new Error("No map found");
      }

      setPlayerMap(result.map);
      setGameResult(result.isWin ? "WON" : "LOST");
      setAiReasoning(result.reasoning);
      setAiPromptTokensUsed(result.promptTokens ?? null);
      setAiOutputTokensUsed(result.outputTokens ?? null);
      setAiTotalTokensUsed(result.totalTokensUsed ?? null);
      setAiTotalRunCost(result.totalRunCost);
    } catch (error) {
      console.error("Error testing AI model:", error);
      setAiError(errorMessage(error));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setShowOriginalMap(true);
    setPlayerMap([]);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);
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
            {AI_MODELS.map((model) => (
              <SelectItem key={model.model} value={model.model}>
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
          <Visualizer map={playerMap} autoStart onReset={handleReset} />
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
                <li>Prompt Tokens: {aiPromptTokensUsed ?? "Not available"}</li>
                <li>Output Tokens: {aiOutputTokensUsed ?? "Not available"}</li>
                <li>Total Tokens: {aiTotalTokensUsed ?? "Not available"}</li>
                <li>
                  Total Cost:{" "}
                  {aiTotalRunCost
                    ? `$${aiTotalRunCost.toFixed(6)}`
                    : "Not available"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
