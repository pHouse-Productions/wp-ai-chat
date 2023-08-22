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
import { FC } from "react";

export const ChatMessage: FC<{
  message: Message;
  onThumbUp?: () => void;
  onThumbDown?: () => void;
}> = ({ message, onThumbDown, onThumbUp }) => {
  const botLogo = "https://i.ibb.co/RDDTDWf/sacra.png";

  const isFromBot = message.from === "Bot";

  const userInfo = useUser();

  const profilePicture = isFromBot ? botLogo : userInfo?.picUrl;

  return (
    <div
      className={cn("flex p-6 gap-4 round-sm", isFromBot ? "bg-gray-50" : "")}
    >
      <div
        style={{
          flexShrink: 0,
        }}
      >
        {profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-10 w-10 rounded-md"
            src={profilePicture}
            alt="Profile pic"
          />
        ) : (
          <div className="h-10 w-10 rounded-md p-2 bg-gray-400">
            <FontAwesomeIcon className="h-full w-full" icon={faUser} />
          </div>
        )}
      </div>

      {/* Message */}
      <div
        style={{
          width: "100%",
        }}
      >
        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            isFromBot ? "font-medium" : ""
          )}
        >
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
