import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

type Props = Omit<React.HTMLProps<HTMLDivElement>, "onScroll"> & {
  stickToBottom: boolean;
  onScroll: (isScrolledToBottom: boolean) => void;
};

export const StickToBottomOverflowContainer = forwardRef<any, Props>(
  function StickToBottomOverflowContainer(
    {
      className,
      stickToBottom: isStuckToBottom,
      onScroll,
      children,
      onClick,
      onTouchEnd,
      onTouchMove,
      onWheel,
      ...rest
    },
    ref
  ) {
    const scrollContainer = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => scrollContainer.current);

    // Programmatic scrolling triggers onScroll events so this is used to inform
    // the onScroll event that it's not the user scrolling.
    const scrollToBottom = useCallback(() => {
      const elem = scrollContainer.current;
      if (!elem) return;

      // Don't scroll if the user is already at the bottom. Doing so will cancel
      // any momentum that a user might have when they're scrolled to the bottom
      // themselves.
      if (isAtBottom()) return;

      elem.scrollTo({ top: elem.scrollHeight });
    }, [scrollContainer]);

    // This is here to ensure it's rendered stuck to the bottom so we don't see
    // a flicker.
    useLayoutEffect(() => {
      if (!isStuckToBottom) return;
      if (!children) return;
      scrollToBottom();
    }, [children, isStuckToBottom, scrollToBottom]);

    const isAtBottom = () => {
      const elem = scrollContainer.current;
      if (!elem) return true;
      const scrollBottom = Math.ceil(elem.scrollTop + elem.clientHeight);
      return scrollBottom >= elem.scrollHeight;
    };

    const notifyOnScroll = () => {
      onScroll?.(isAtBottom());
    };

    return (
      <div
        ref={scrollContainer}
        style={{
          position: "relative",
        }}
        className={`${className}`}
        onWheel={(e) => {
          onWheel?.(e);
          notifyOnScroll();
        }}
        onTouchMove={(e) => {
          onTouchMove?.(e);
          notifyOnScroll();
        }}
        onTouchEnd={(e) => {
          onTouchEnd?.(e);
          notifyOnScroll();
        }}
        onClick={(e) => {
          // if you are using select messages feature
          if (e.shiftKey || e.metaKey) return;

          onClick?.(e);
          notifyOnScroll();
        }}
        {...rest}
        // TODO: Account for momentum on mobile because TouchMove will stop firing
        // as soon as the user's finger lifts so we might think they're not at the
        // bottom but it'll glide to the bottom and we won't be aware.
      >
        {children}
      </div>
    );
  }
);
