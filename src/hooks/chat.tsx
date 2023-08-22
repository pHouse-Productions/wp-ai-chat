import {
  ChatMessage,
  ChatMessageSchema,
  ChatRequest,
  ChatResponseSchema,
  RateRequest,
  User,
  UserSchema,
} from "@/utils/schema";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { z } from "zod";

export const useUser = () => {
  const searchParams = useSearchParams();
  return useMemo<User>(() => {
    try {
      return UserSchema.parse({
        userId: searchParams.get("userId"),
        picUrl: searchParams.get("picUrl"),
      });
    } catch (e) {
      return { userId: "unknown", picUrl: "https://i.imgur.com/LGHTjW1.jpeg" };
    }
  }, [searchParams]);
};

export const useLocalStorage = <T,>(
  key: string,
  schema: z.ZodType<T>,
  defaultValue: T
) => {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key) || "";
      setValue(schema.parse(JSON.parse(raw)));
    } catch (e) {}
  }, [key, schema]);

  useEffect(() => {
    try {
      const fn = (e: StorageEvent) => {
        if (e.key !== key) return;
        setValue(schema.parse(JSON.parse(e.newValue || "")));
      };
      addEventListener("storage", fn);
      return () => removeEventListener("storage", fn);
    } catch (e) {}
  }, [key, schema]);

  const setValueFn = useCallback(
    (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        setValue(value);
      } catch (e) {}
    },
    [key]
  );

  return useMemo(() => [value, setValueFn] as const, [setValueFn, value]);
};

const ChatMessagesSchema = z.array(ChatMessageSchema);

export const useChat = () => {
  const [state, setState] = useState<"idle" | "awaiting_response">("idle");
  const [history, setHistory] = useLocalStorage(
    "history",
    ChatMessagesSchema,
    []
  );

  const rateMessage = useCallback(
    async (messageId: string, rating: number) => {
      const messageIndex = history.findIndex(
        (m) => m.id === messageId && m.from === "Bot"
      );
      if (messageIndex === -1) return;
      const body: RateRequest = {
        messageId,
        rating,
      };
      const a = history.concat();
      a[messageIndex] = {
        ...a[messageIndex],
        rating,
      };
      setHistory(a);
      await fetch("/api/rate", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    [history, setHistory]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      const msg: ChatMessage = {
        id: v4(),
        date: new Date(),
        from: "User",
        message,
      };
      let a = history.concat(msg);
      setHistory(a);

      const body: ChatRequest = {
        prompt: a
          .slice(-10)
          .map((m) =>
            `
From: ${m.from}
Body:
${m.message}
        `.trim()
          )
          .join("\n\n"),
      };

      setState("awaiting_response");
      const fetchResponse = await fetch("/api/prompt", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const response = ChatResponseSchema.parse(await fetchResponse.json());
      setState("idle");

      setHistory(
        a.concat({
          id: response.id,
          date: new Date(),
          from: "Bot",
          message: response.response,
          references: response.references,
        })
      );
    },
    [history, setHistory]
  );

  return useMemo(() => {
    return { history, sendMessage, state, rateMessage };
  }, [history, rateMessage, sendMessage, state]);
};
export type ChatHookType = ReturnType<typeof useChat>;
