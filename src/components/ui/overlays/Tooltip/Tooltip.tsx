"use client";
import {
  type ComponentProps,
  cloneElement,
  type ReactElement,
  useId,
  useState,
} from "react";
import styles from "./TooltipStyles.module.css";

type TriggerProps = ComponentProps<"button">;
export function Tooltip({
  children,
  label,
  align = "start",
}: {
  children: ReactElement<TriggerProps>;
  label: string;
  align?: "start" | "end";
}) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const visible = (hovered || focused) && !dismissed;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Hover belongs to the wrapper so the tooltip remains hoverable; keyboard interaction stays on the native button.
    <span
      role="presentation"
      className={styles.anchor}
      onMouseEnter={() => {
        setHovered(true);
        setDismissed(false);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {cloneElement(children, {
        "aria-describedby":
          [children.props["aria-describedby"], visible ? id : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
        onFocus: (event) => {
          setFocused(true);
          setDismissed(false);
          children.props.onFocus?.(event);
        },
        onBlur: (event) => {
          setFocused(false);
          children.props.onBlur?.(event);
        },
        onKeyDown: (event) => {
          if (event.key === "Escape") {
            setDismissed(true);
            event.stopPropagation();
          }
          children.props.onKeyDown?.(event);
        },
      })}
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className={styles.tooltip}
        data-align={align}
      >
        {label}
      </span>
    </span>
  );
}
