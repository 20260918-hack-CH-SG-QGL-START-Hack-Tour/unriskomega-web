import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import type { Position } from "./types";

const initial = { x: 0, y: 0, scale: 1 };
export function useGraphCamera(onSelect: (id: string) => void) {
  const [camera, setCamera] = useState(initial);
  const [moved, setMoved] = useState<Record<string, Position>>({});
  const drag = useRef<{
    node: string | null;
    point: Position;
    origin?: Position;
    moved: boolean;
  } | null>(null);
  const zoom = useCallback(
    (factor: number) =>
      setCamera((c) => ({
        ...c,
        scale: Math.max(0.35, Math.min(3.5, c.scale * factor)),
      })),
    [],
  );
  const reset = () => {
    setCamera(initial);
    setMoved({});
  };
  const start = (
    event: PointerEvent<SVGSVGElement>,
    positions: Record<string, Position>,
  ) => {
    const id =
      (event.target as Element)
        .closest("[data-node-id]")
        ?.getAttribute("data-node-id") ?? null;
    drag.current = {
      node: id,
      point: svgPoint(event),
      origin: id ? positions[id] : undefined,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const state = drag.current;
    if (!state) return;
    const point = svgPoint(event),
      dx = point.x - state.point.x,
      dy = point.y - state.point.y;
    if (Math.abs(dx) + Math.abs(dy) < 2) return;
    state.moved = true;
    state.point = point;
    if (state.node && state.origin) {
      state.origin = {
        x: state.origin.x + dx / camera.scale,
        y: state.origin.y + dy / camera.scale,
      };
      const position = state.origin,
        id = state.node;
      setMoved((current) => ({ ...current, [id]: position }));
    } else setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  };
  const end = () => {
    if (drag.current?.node && !drag.current.moved) onSelect(drag.current.node);
    drag.current = null;
  };
  const keyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    const amount = event.shiftKey ? 80 : 30;
    const direction = {
      ArrowLeft: [amount, 0],
      ArrowRight: [-amount, 0],
      ArrowUp: [0, amount],
      ArrowDown: [0, -amount],
    }[event.key];
    if (direction) {
      event.preventDefault();
      setCamera((c) => ({
        ...c,
        x: c.x + direction[0],
        y: c.y + direction[1],
      }));
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoom(1.2);
    }
    if (event.key === "-") {
      event.preventDefault();
      zoom(1 / 1.2);
    }
    if (event.key === "0") {
      event.preventDefault();
      reset();
    }
  };
  return { camera, moved, zoom, reset, start, move, end, keyboard };
}
function svgPoint(event: PointerEvent<SVGSVGElement>): Position {
  const point = event.currentTarget.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = event.currentTarget.getScreenCTM();
  return matrix ? point.matrixTransform(matrix.inverse()) : point;
}
