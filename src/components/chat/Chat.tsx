import { useChat } from "@/hooks/chat";
import { useEffect, useMemo, useRef, useState } from "react";
import { StickToBottomOverflowContainer } from "../StickToBottomOverflowContainer";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessages } from "./ChatMessages/ChatMessages";

export const Chat = () => {
  const chat = useChat();

  const scrollContainer = useRef<HTMLDivElement>();
  const chatInputRef = useRef<HTMLTextAreaElement>();

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [scrollToBottomRequested, setScrollToBottomRequested] = useState(false);
  useEffect(() => {
    if (!scrollToBottomRequested) return;
    setIsScrolledToBottom(true);
    setScrollToBottomRequested(false);
  }, [scrollToBottomRequested]);

  const chatContainerStyles = useMemo(() => {
    return {
      padding: "0.5rem",
      flex: "1 1 0%",
      height: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as React.CSSProperties["flexDirection"],
      justifyContent: "space-between",
    };
  }, []);

  return (
    <div style={chatContainerStyles}>
      <StickToBottomOverflowContainer
        style={{ overflowY: "auto" }}
        stickToBottom={isScrolledToBottom}
        onScroll={setIsScrolledToBottom}
        ref={scrollContainer}
      >
        <ChatMessages {...chat} />
      </StickToBottomOverflowContainer>
      <ChatInputBar
        chatInputRef={chatInputRef}
        onSend={(input: string) => {
          if (input.trim().length === 0) return;
          chat.sendMessage(input);
          setScrollToBottomRequested(true);
        }}
      />
    </div>
  );
};
