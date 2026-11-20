import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "@/components/data-table/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("commits once, after the debounce, with the final text", () => {
    const onCommit = vi.fn();
    render(<SearchInput value="" onCommit={onCommit} />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "k" } });
    fireEvent.change(input, { target: { value: "ka" } });
    fireEvent.change(input, { target: { value: "kar" } });
    expect(onCommit).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("kar");
  });

  it("Escape clears immediately", () => {
    const onCommit = vi.fn();
    render(<SearchInput value="abc" onCommit={onCommit} />);
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(onCommit).toHaveBeenCalledWith("");
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("an external value change (Clear all) wins and cancels a pending commit", () => {
    const onCommit = vi.fn();
    const { rerender } = render(<SearchInput value="abc" onCommit={onCommit} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "abcd" } });
    rerender(<SearchInput value="" onCommit={onCommit} />);
    expect(screen.getByRole("searchbox")).toHaveValue("");
    act(() => void vi.advanceTimersByTime(500));
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("'/' focuses the field", () => {
    render(<SearchInput value="" onCommit={() => {}} />);
    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});
