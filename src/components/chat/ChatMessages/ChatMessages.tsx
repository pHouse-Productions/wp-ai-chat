import { ChatHookType } from "@/hooks/chat";
import { FC } from "react";
import { ChatMessage } from "./ChatMessage";

type ChatMessagesProps = ChatHookType;

export const ChatMessages: FC<ChatMessagesProps> = ({
  history: messages,
  state,
  rateMessage,
}) => {
  const isWaiting = state !== "idle";
  return (
    <>
      {messages.map((m) => (
        <ChatMessage
          message={m}
          key={m.id}
          onThumbDown={() => rateMessage(m.id, m.rating === -1 ? 0 : -1)}
          onThumbUp={() => rateMessage(m.id, m.rating === 1 ? 0 : 1)}
        />
      ))}
      {isWaiting && (
        <ChatMessage
          message={{
            id: "typing",
            date: new Date(),
            from: "Bot",
            message: isWaiting ? "..." : "",
          }}
        />
      )}
    </>
  );
};
