/**
 * NVIDIA NIM Client - Handles all AI inference
 * Uses OpenAI-compatible API format
 */
import { z } from "zod";

const NIM_BASE_URL = process.env.NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NIM_MODEL = process.env.NIM_MODEL || "nvidia/llama-3.3-70b-instruct";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function nimChat(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" };
  } = {}
): Promise<string> {
  const apiKey = process.env.NIM_API_KEY;
  if (!apiKey) {
    throw new Error("NIM_API_KEY environment variable is not set");
  }

  const body: Record<string, unknown> = {
    model: NIM_MODEL,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  };

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }

  const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NIM API error ${response.status}: ${errorText}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

/**
 * Parse JSON from NIM response, with retry on malformed output
 */
export async function nimChatJSON<T>(
  messages: ChatMessage[],
  schema: z.ZodSchema<T>,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<T> {
  // First attempt
  const raw = await nimChat(messages, {
    ...options,
    responseFormat: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
  } catch {
    // Parse failed, retry once
  }

  // Retry with explicit schema reminder
  const retryMessages: ChatMessage[] = [
    ...messages,
    {
      role: "user",
      content:
        "IMPORTANT: Return ONLY valid JSON that matches the schema exactly. No markdown, no explanation, just JSON.",
    },
  ];

  const retryRaw = await nimChat(retryMessages, {
    ...options,
    responseFormat: { type: "json_object" },
    temperature: 0.1,
  });

  try {
    const retryParsed = JSON.parse(retryRaw);
    const retryResult = schema.safeParse(retryParsed);
    if (retryResult.success) return retryResult.data;
    throw new Error(
      `Schema validation failed after retry: ${JSON.stringify(retryResult.error.issues)}`
    );
  } catch (e) {
    if (e instanceof z.ZodError) throw e;
    throw new Error(`Failed to parse NIM response as JSON after retry: ${retryRaw.slice(0, 200)}`);
  }
}
