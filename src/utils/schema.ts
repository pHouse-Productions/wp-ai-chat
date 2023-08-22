import { z } from "zod";

export const RateRequestSchema = z.object({
  messageId: z.string(),
  rating: z.number().min(-1).max(1).int(),
});
export type RateRequest = z.infer<typeof RateRequestSchema>;

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  id: z.string(),
  response: z.string(),
  references: z.array(z.string()),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  from: z.enum(["User", "Bot"]),
  message: z.string(),
  references: z.array(z.string()).optional(),
  rating: z.number().min(-1).max(1).int().optional(),
  date: z.coerce.date(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const UserSchema = z.object({
  userId: z.string(),
  picUrl: z.string().url(),
});
export type User = z.infer<typeof UserSchema>;
