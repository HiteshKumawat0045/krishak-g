import Groq from "groq-sdk";
import { toolDefinitions, executeTool } from "../tools/farmTools";

export interface LLMResponse {
  text: string;
  isClarifyingQuestion: boolean;
}

// Marker the model uses to signal a clarifying question
const CLARIFY_MARKER = "[CLARIFY]";

function parseLLMOutput(raw: string): LLMResponse {
  const trimmed = raw.trim();
  if (trimmed.startsWith(CLARIFY_MARKER)) {
    return {
      text: trimmed.slice(CLARIFY_MARKER.length).trim(),
      isClarifyingQuestion: true
    };
  }
  return { text: trimmed, isClarifyingQuestion: false };
}

export class LLMClient {
  private groq: Groq;
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
    this.systemPrompt =
      "You are a warm, friendly voice assistant for farmers. Respond naturally to greetings, small talk, and casual conversation the way a helpful neighbor would. You should consider on-topic anything a farmer would plausibly ask a knowledgeable neighbor about their farm, land, weather, rural life, agriculture, pesticide/fertilizer usage, mandi crop prices, and government agricultural schemes and subsidies. If someone asks a clearly unrelated informational question (like about a celebrity, politics, or general trivia unrelated to farming), gently redirect them. You must NEVER be dismissive, mocking, or scold the farmer, even when redirecting an off-topic question — the redirect must always sound like a warm, respectful neighbor, never irritated. Keep your redirects natural and vary your wording so you don't repeat the same refusal phrase every time. " +
      "You must always respond in the exact same language the user's question was asked in. If the question is written in English, your entire response must be in English. If the question is written in Hindi (Devanagari script), your entire response must be in Hindi. Never switch languages regardless of any other instruction below. " +
      "You are Krishak-G, a voice-first intelligent field assistant speaking directly to a farmer. " +
      "You are speaking as a female voice assistant. When your response is in Hindi, always use feminine verb forms consistent with a female speaker (for example, 'बताऊंगी' not 'बताऊंगा', 'करूंगी' not 'करूंगा', 'दूंगी' not 'दूंगा'). " +
      "Answer only using the provided tools when the question needs data or calculations. " +
      "Respond in short spoken-style sentences (maximum two sentences). " +
      "Do not use markdown, formatting, bullet points, asterisks, or emojis. " +
      "Write numbers and units naturally for spoken audio (for example, write 'forty-five milliliters' instead of '45ml', and 'fifteen litres' instead of '15L'). " +
      "Always answer with clarity, warmth, and respect as if speaking aloud to a farmer in the field. " +
      "When responding in Hindi, use simple everyday spoken Hindi that a rural farmer with basic schooling would use in daily conversation — avoid formal or Sanskrit-heavy words (for example, say 'दवाई' or 'स्प्रे' instead of 'कीटनाशक', say 'कितना डालना है' instead of 'मात्रा निर्धारित करें'). Keep it exactly like how a knowledgeable neighbor would explain something out loud, not like a textbook or government notice. " +
      "IMPORTANT — Clarifying questions: When answering would require calling getMandiPrice or calculateDosage but a required detail is missing or unclear from the farmer's question (for example: crop name for mandi price, chemical name or tank size for dosage), do NOT guess or invent a value. Instead, ask one short, natural spoken clarifying question in the same language as the farmer's question, and do NOT call any tool in that turn. When you ask a clarifying question, you MUST prefix your response with the exact marker [CLARIFY] (including the brackets). For example: '[CLARIFY] Which crop would you like the mandi price for?' or '[CLARIFY] कौन सी फसल का भाव जानना है?'. Do NOT use this marker for normal answers — only when you are asking the farmer for missing information before you can call a tool.";
  }

  public async ask(
    userQuery: string,
    signal?: AbortSignal,
    languageHint?: string,
    defaultLocation?: string,
    pendingContext?: string
  ): Promise<LLMResponse> {
    let effectiveSystemPrompt = this.systemPrompt;

    if (defaultLocation && defaultLocation.trim()) {
      effectiveSystemPrompt += ` The farmer's registered home location is ${defaultLocation.trim()}. When the farmer asks about local weather or mandi crop prices without specifying a location, use "${defaultLocation.trim()}" as the location argument for tool calls.`;
    }

    if (languageHint) {
      effectiveSystemPrompt += ` You MUST respond entirely in ${
        languageHint === "hi" ? "Hindi (Devanagari script)" : "English"
      }.`;
    }

    // Build user message content, incorporating pending context if present
    let userContent = userQuery;
    if (pendingContext && pendingContext.trim()) {
      userContent = `Earlier I asked the farmer: "${pendingContext.trim()}". The farmer just replied: "${userQuery}". Use both pieces of context to answer.`;
    }

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: effectiveSystemPrompt
      },
      {
        role: "user",
        content: userContent
      }
    ];

    try {
      const response = await this.groq.chat.completions.create(
        {
          model: "openai/gpt-oss-120b",
          messages,
          tools: toolDefinitions as any,
          tool_choice: "auto"
        },
        { signal }
      );

      const responseMessage = response.choices[0]?.message;

      if (!responseMessage) {
        throw new Error("No response received from Groq");
      }

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const parsedArgs = JSON.parse(toolCall.function.arguments || "{}");
          const toolResult = await executeTool(functionName, parsedArgs);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }

        const secondResponse = await this.groq.chat.completions.create(
          {
            model: "openai/gpt-oss-120b",
            messages
          },
          { signal }
        );

        return parseLLMOutput(
          secondResponse.choices[0]?.message?.content?.trim() || ""
        );
      }

      return parseLLMOutput(responseMessage.content?.trim() || "");
    } catch (err: any) {
      if (signal?.aborted || err?.name === "AbortError" || err?.type === "aborted") {
        return { text: "", isClarifyingQuestion: false };
      }
      throw err;
    }
  }
}
