"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { errorMessage } from "@/lib/utils";

interface UseAITestingProps {
  testingType: "MAP" | "MODEL";
  level?: number;
}

interface AITestResult {
  map?: string[][];
  isWin?: boolean;
  reasoning: string;
  promptTokens?: number;
  outputTokens?: number;
  totalTokensUsed?: number;
  totalRunCost?: number;
}

export function useAITesting({ testingType, level }: UseAITestingProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState<"WON" | "LOST" | null>(null);
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
  const [resultMap, setResultMap] = useState<string[][]>([]);

  const testAIModel = useAction(api.maps.testAIModel);
  const testMap = useAction(api.maps.testMap);

  const runTest = async (modelId: string, map: string[][]) => {
    setIsSimulating(true);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);

    try {
      let result: AITestResult | null = null;

      if (testingType === "MODEL") {
        if (!level) {
          console.error(
            "Error testing AI model:",
            "Level is required when testing a model",
          );
          setAiError("Level is required when testing a model");
          return;
        }
        result = await testAIModel({
          level,
          modelId,
        });
      } else if (testingType === "MAP") {
        result = await testMap({
          modelId,
          map,
        });
      }

      if (!result?.map) {
        throw new Error("No map found");
      }

      setResultMap(result.map);
      setGameResult(result.isWin ? "WON" : "LOST");
      setAiReasoning(result.reasoning);
      setAiPromptTokensUsed(result.promptTokens ?? null);
      setAiOutputTokensUsed(result.outputTokens ?? null);
      setAiTotalTokensUsed(result.totalTokensUsed ?? null);
      setAiTotalRunCost(result.totalRunCost ?? null);

      return result as AITestResult;
    } catch (error) {
      console.error("Error testing AI model:", error);
      setAiError(errorMessage(error));
      throw error;
    } finally {
      setIsSimulating(false);
    }
  };

  const resetAITest = () => {
    setResultMap([]);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);
    setAiPromptTokensUsed(null);
    setAiOutputTokensUsed(null);
    setAiTotalTokensUsed(null);
    setAiTotalRunCost(null);
  };

  return {
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
  };
}
