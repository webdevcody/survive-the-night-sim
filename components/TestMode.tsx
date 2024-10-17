import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Visualizer } from "@/app/visualizer";
import { Map } from "@/app/map";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/convex/constants";
import { Id } from "@/convex/_generated/dataModel";


const TestMode = ({ map, level }: { map: Maps | null | undefined; level: number }) => {
  const [playerMap, setPlayerMap] = useState<string[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState<"WON" | "LOST" | null>(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].model);
  const testAIModel = useAction(api.maps.testAIModel);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [showOriginalMap, setShowOriginalMap] = useState(true);

  const handleAITest = async () => {
    if (!map) return;

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

      setPlayerMap(result.map);
      setGameResult(result.isWin ? "WON" : "LOST");
      setAiReasoning(result.reasoning);
    } catch (error) {
      console.error("Error testing AI model:", error);
      setAiError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
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
    <div className="flex flex-col items-center gap-4 w-full">
      {showOriginalMap && (
        <div className="mb-8">
          <Map map={map?.grid} />
        </div>
      )}
      <div className="flex gap-4 mb-4">
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
      {aiError && <div className="text-red-500 mt-4">{aiError}</div>}
      {gameResult && (
        <div className="mt-4 flex flex-col items-center gap-8 max-w-4xl mx-auto">
          <Visualizer map={playerMap} autoStart={true} />
          <div className="flex flex-col gap-4 flex-1">
            <div
              className={`text-2xl font-bold ${
                gameResult === "WON" ? "text-green-500" : "text-red-500"
              }`}
            >
              AI {gameResult}
            </div>
            {aiReasoning && (
              <div className="p-4">
                <h3 className="font-semibold mb-2">AI Reasoning:</h3>
                <p>{aiReasoning}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TestMode;
