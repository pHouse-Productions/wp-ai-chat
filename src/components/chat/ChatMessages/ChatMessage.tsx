import { useUser } from "@/hooks/chat";
import { cn } from "@/lib/utils";
import { ChatMessage as Message } from "@/utils/schema";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleNotch,
  faThumbsDown as faThumbsDownSolid,
  faThumbsUp as faThumbsUpSolid,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useMemo } from "react";

export const ChatMessage: FC<{
  message: Message;
  onThumbUp?: () => void;
  onThumbDown?: () => void;
}> = ({ message, onThumbDown, onThumbUp }) => {
  const botLogo = "https://i.ibb.co/RDDTDWf/sacra.png";

  const isFromBot = message.from === "Bot";

  const userInfo = useUser();

  const profilePicture = isFromBot ? botLogo : userInfo?.picUrl;

  const botMessageStyles: React.CSSProperties = useMemo(() => {
    if (!isFromBot) return {};
    return {
      backgroundColor: "var(--secondary-background)",
      borderRadius: "0.375rem",
    };
  }, [isFromBot]);

  const chatMessageContainerStyles: React.CSSProperties = useMemo(() => {
    return {
      display: "flex",
      color: "var(--text-color)",
      padding: "1.25rem",
      gap: "1.25rem",
      ...botMessageStyles,
    };
  }, [botMessageStyles]);

  const imageStyles = useMemo(() => {
    return {
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "0.375rem",
    };
  }, []);

  const defaultImageStyles = useMemo(() => {
    return {
      ...imageStyles,
      backgroundColor: "var(--secondary-background)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--primary-color)",
    };
  }, [imageStyles]);

  const chatBodyStyles = useMemo(() => {
    return {
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: isFromBot ? 400 : 600,
      color: "var(--text-color)",
      whiteSpace: "pre-wrap" as React.CSSProperties["whiteSpace"],
    };
  }, [isFromBot]);

  return (
    <div style={chatMessageContainerStyles}>
      {/* Avatar */}
      <div
        style={{
          flexShrink: 0,
        }}
      >
        {profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img style={imageStyles} src={profilePicture} alt="Profile pic" />
        ) : (
          <div style={defaultImageStyles}>
            <FontAwesomeIcon icon={faUser} />
          </div>
        )}
      </div>

      {/* Message */}
      <div
        style={{
          marginTop: "0.5rem",
          width: "100%",
        }}
      >
        <div style={chatBodyStyles}>
          {message.message === "..." ? (
            <FontAwesomeIcon icon={faCircleNotch} spin />
          ) : (
            <div>{message.message}</div>
          )}
        </div>
      </div>
      {isFromBot && message.message !== "..." && (
        <div className="flex gap-4">
          <FontAwesomeIcon
            className={cn(
              "cursor-pointer",
              message.rating === -1 && "opacity-0 hover:opacity-100"
            )}
            icon={message.rating === 1 ? faThumbsUpSolid : faThumbsUp}
            onClick={onThumbUp}
          />
          <FontAwesomeIcon
            className={cn(
              "cursor-pointer",
              message.rating === 1 && "opacity-0 hover:opacity-100"
            )}
            icon={message.rating === -1 ? faThumbsDownSolid : faThumbsDown}
            onClick={onThumbDown}
          />
        </div>
      )}
    </div>
  );
};
