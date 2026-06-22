import { useEffect, useRef } from "react";

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  charGapMs?: number;
  repeatDelayMs?: number;
  enabled?: boolean;
  submitKeys?: string[];
  shouldIgnoreEvent?: (event: KeyboardEvent) => boolean;
}

const defaultShouldIgnoreEvent = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tag = target.tagName;
  const editable = target.isContentEditable;

  if (editable) return true;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;

  return false;
};

const useBarcodeScanner = ({
  onScan,
  minLength = 8,
  charGapMs = 50,
  repeatDelayMs = 2000,
  enabled = true,
  submitKeys = ["Enter"],
  shouldIgnoreEvent = defaultShouldIgnoreEvent,
}: UseBarcodeScannerOptions): void => {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const lastScanRef = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const resetBuffer = () => {
      bufferRef.current = "";
      lastKeyTimeRef.current = 0;
    };

    const tryEmitScan = (raw: string) => {
      const code = raw.trim();
      const now = Date.now();

      if (code.length < minLength) return;

      const isRepeat =
        code === lastScanRef.current.code &&
        now - lastScanRef.current.time < repeatDelayMs;

      if (isRepeat) return;

      lastScanRef.current = { code, time: now };
      onScanRef.current(code);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreEvent(event)) return;

      const now = Date.now();
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > charGapMs) {
        bufferRef.current = "";
      }

      if (submitKeys.includes(event.key)) {
        if (bufferRef.current) {
          tryEmitScan(bufferRef.current);
        }
        resetBuffer();
        return;
      }

      if (event.key.length !== 1) return;

      bufferRef.current += event.key;
      lastKeyTimeRef.current = now;
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, minLength, charGapMs, repeatDelayMs, submitKeys, shouldIgnoreEvent]);
};

export default useBarcodeScanner;
