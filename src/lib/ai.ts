import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-5.6-terra";
}
