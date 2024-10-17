import { Anthropic } from "@anthropic-ai/sdk";
import { type ModelHandler } from ".";

export const claude35sonnet: ModelHandler = async (prompt, map) => {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240307",
        max_tokens: 1024,
        temperature: 0,
        system: prompt,
        messages: [
            {
                role: "user",
                content: JSON.stringify(map),
            },
        ],
    });

    const content = response.content[0];

    if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
    }

    const parsedResponse = JSON.parse(content.text);

    // Validate the response structure
    if (
        !Array.isArray(parsedResponse.boxCoordinates) ||
        !Array.isArray(parsedResponse.playerCoordinates) ||
        typeof parsedResponse.reasoning !== "string"
    ) {
        throw new Error("Invalid response structure");
    }

    return {
        boxCoordinates: parsedResponse.boxCoordinates,
        playerCoordinates: parsedResponse.playerCoordinates,
        reasoning: parsedResponse.reasoning,
    };
};
