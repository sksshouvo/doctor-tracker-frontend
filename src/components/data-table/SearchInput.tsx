"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  /** Committed (URL) value. */
  value: string;
  /** Called once, `delay` ms after the user stops typing. */
  onCommit: (value: string) => void;
  placeholder?: string;
  delay?: number;
  label?: string;
};

/**
 * Typing is local state so the table does not re-render per keystroke; the URL/query only changes after
 * the debounce. `/` focuses the field, `Esc` clears it.
 */
export function SearchInput({
  value,
  onCommit,
  placeholder = "Search…",
  delay = 300,
  label = "Search",
}: Props) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value); // what the input currently shows (for the stale-timer guard)
  const inputRef = useRef<HTMLInputElement>(null);
  const commitRef = useRef(onCommit);

  useEffect(() => {
    commitRef.current = onCommit;
  });

  // External changes (Clear all, Back button) win over local text. Adjusting state while rendering is the
  // documented pattern for deriving state from a prop.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(value);
  }
  useEffect(() => {
    latest.current = value;
    if (timer.current) clearTimeout(timer.current);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const schedule = useCallback(
    (next: string, immediate = false) => {
      latest.current = next;
      if (timer.current) clearTimeout(timer.current);
      if (immediate) commitRef.current(next);
      else
        timer.current = setTimeout(() => {
          if (latest.current === next) commitRef.current(next);
        }, delay);
    },
    [delay],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full sm:w-80">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={label}
        value={local}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
        onChange={(e) => {
          setLocal(e.target.value);
          schedule(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && local) {
            setLocal("");
            schedule("", true);
          }
        }}
      />
      {local && (
        <button
          type="button"
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5"
          onClick={() => {
            setLocal("");
            schedule("", true);
            inputRef.current?.focus();
          }}
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
