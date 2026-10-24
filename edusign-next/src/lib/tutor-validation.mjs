import { z } from "zod";

const language = z.enum(["fr", "en"]).default("fr");
const history = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(4000),
    }),
  )
  .max(20)
  .default([]);
export const actionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("practice"),
    exercise_id: z.enum(["name", "count", "language"]).default("name"),
  }),
  z.object({
    kind: z.literal("answer"),
    exercise_id: z.enum(["name", "count", "language"]),
    choice: z.number().int().min(0).max(2),
  }),
]);
export const tutorChatSchema = z.object({
  intent: z.enum(["sign", "coach"]).default("coach"),
  collection: z.enum(["project", "lsf"]).default("lsf"),
  message: z.string().trim().min(1).max(2000),
  language,
  conversationHistory: history,
  action: actionSchema.optional(),
});
export const transcriptionSchema = z.object({
  audio: z
    .string()
    .min(1)
    .max(10_000_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  mimeType: z
    .enum(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"])
    .default("audio/webm"),
  language,
});
export const voiceChatSchema = transcriptionSchema.extend({
  intent: z.enum(["sign", "coach"]).default("coach"),
  collection: z.enum(["project", "lsf"]).default("lsf"),
  conversationHistory: history,
  voiceEnabled: z.boolean().default(true),
});
export const speechSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  voice: z
    .enum([
      "alloy",
      "echo",
      "fable",
      "onyx",
      "nova",
      "shimmer",
      "coral",
      "sage",
      "ash",
      "ballad",
      "verse",
      "marin",
      "cedar",
    ])
    .default("coral"),
  language,
});
export { safeTutorResource } from "./tutor-resources.mjs";
