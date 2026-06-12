import React, { useEffect, useRef, useState } from "react";

interface LineClampCellProps {
  text: string | null;
  animate?: boolean;
}

const LineClampAnimation: React.FC<LineClampCellProps> = ({
  text,
  animate = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (container && content) {
      setIsOverflowing(content.scrollWidth > container.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`text-ellipsis-wrapper text-animation-trick-parent ${animate ? "text-animation-trick-parent-accepted" : ""}`}
    >
      {isOverflowing ? (
        <div className="text-ellipsis-track">
          <span ref={contentRef} className="text-ellipsis-content">
            {text}
          </span>
          <span className="text-ellipsis-content">{text}</span>
        </div>
      ) : (
        <span ref={contentRef} className="inline-block">
          {text ?? "-"}
        </span>
      )}
    </div>
  );
};

export default LineClampAnimation;
