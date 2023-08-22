import { cn } from "@/lib/utils";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export const ChatInputBar = ({
  onSend,
}: {
  onSend: (input: string) => void;
}) => {
  const [input, setInput] = useState("");

  return (
    <div className="flex items-end border rounded-sm px-3 py-2 gap-4">
      <Textarea
        className="flex-1"
        resize
        name="input"
        value={input}
        rows={1}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(input);
            setInput("");
          }
        }}
      />
      <FontAwesomeIcon
        icon={faPaperPlane}
        className="transition-opacity ease-in-out duration-200 cursor-pointer hover:opacity-100 opacity-50"
        onClick={() => {
          onSend(input);
          setInput("");
        }}
      />
    </div>
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, resize, ...props }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const handleResize = useCallback(() => {
      if (!innerRef.current) return;
      if (!containerRef.current) return;
      if (!resize) {
        innerRef.current.style.height = "";
      } else {
        innerRef.current.style.height = "0px";
        innerRef.current.style.height = innerRef.current.scrollHeight + "px";
        containerRef.current.style.height = innerRef.current.style.height;
      }
    }, [resize]);

    useEffect(() => {
      props.value;
      handleResize();
    }, [handleResize, props.value]);

    useEffect(() => {
      if (!containerRef.current) return;
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, [handleResize]);

    const o = (
      <textarea
        className={cn(
          "w-full",
          resize ? `resize-none overflow-hidden outline-none` : "",
          resize ? "" : className
        )}
        ref={innerRef}
        {...props}
      />
    );

    return resize ? (
      <div className={resize ? className : ""} ref={containerRef}>
        {o}
      </div>
    ) : (
      o
    );
  }
);
