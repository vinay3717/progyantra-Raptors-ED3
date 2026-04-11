import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);

  return trimmed;
}

export async function generateJsonWithGemini<T>(
  schema: z.ZodType<T>,
  prompt: string,
  options?: { temperature?: number; model?: string }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to .env.local (do not commit).");
  }

  const modelName = options?.model ?? process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: options?.temperature ?? 0.2,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonText = extractJson(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new Error(`Gemini returned non-JSON output: ${message}\n\nRaw:\n${text}`);
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Gemini returned JSON but it did not match schema:\n${validated.error.toString()}\n\nRaw:\n${jsonText}`
    );
  }

  return validated.data;
}

