    import React, { useEffect, useRef, useState } from "react";
    import { Tooltip } from "antd";

    interface LineClampCellProps {
      text: string | null;
    }

    const LineClampCell: React.FC<LineClampCellProps> = ({ text }) => {
      const spanRef = useRef<HTMLSpanElement>(null);
      const [showTooltip, setShowTooltip] = useState(false);

      const checkOverflow = () => {
        const el = spanRef.current;
        if (el) {
          const isOverflowing = el.scrollHeight > el.clientHeight;
          setShowTooltip(isOverflowing);
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
        <Tooltip
          title={showTooltip ? text : null}
          placement="topLeft"
          styles={{
            root:{
              pointerEvents: "none",
            }
          }}
        >
          <span
            ref={spanRef}
            className="line-clamp-1 overflow-hidden text-ellipsis"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
            }}
          >
            {text ?? "-"}
          </span>
        </Tooltip>
      );
    };

    export default LineClampCell;


