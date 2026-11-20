import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTablePagination, pageList } from "@/components/data-table/DataTablePagination";
import type { PageMeta } from "@/types/api";

const meta = (page: number, total = 134, limit = 10): PageMeta => {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

describe("pageList", () => {
  it("shows everything for small totals", () => expect(pageList(2, 5)).toEqual([1, 2, 3, 4, 5]));
  it("uses ellipses for large totals", () => {
    expect(pageList(1, 14)).toEqual([1, 2, 3, 4, "…", 14]);
    expect(pageList(7, 14)).toEqual([1, "…", 6, 7, 8, "…", 14]);
    expect(pageList(14, 14)).toEqual([1, "…", 11, 12, 13, 14]);
  });
});

describe("DataTablePagination", () => {
  it("labels the visible range", () => {
    render(<DataTablePagination meta={meta(2)} onPageChange={() => {}} onLimitChange={() => {}} />);
    expect(screen.getByText("Showing 11–20 of 134")).toBeInTheDocument();
  });

  it("clamps the last page label", () => {
    render(
      <DataTablePagination meta={meta(14)} onPageChange={() => {}} onLimitChange={() => {}} />,
    );
    expect(screen.getByText("Showing 131–134 of 134")).toBeInTheDocument();
  });

  it("disables Previous/First on page 1 and Next/Last on the last page", () => {
    const { rerender } = render(
      <DataTablePagination meta={meta(1)} onPageChange={() => {}} onLimitChange={() => {}} />,
    );
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("First page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeEnabled();
    rerender(
      <DataTablePagination meta={meta(14)} onPageChange={() => {}} onLimitChange={() => {}} />,
    );
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Last page")).toBeDisabled();
  });

  it("emits page changes", () => {
    const onPage = vi.fn();
    render(<DataTablePagination meta={meta(5)} onPageChange={onPage} onLimitChange={() => {}} />);
    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByLabelText("Previous page"));
    fireEvent.click(screen.getByLabelText("First page"));
    fireEvent.click(screen.getByLabelText("Last page"));
    expect(onPage.mock.calls.map((c) => c[0])).toEqual([6, 4, 1, 14]);
  });

  it("marks the current page", () => {
    render(<DataTablePagination meta={meta(3)} onPageChange={() => {}} onLimitChange={() => {}} />);
    expect(screen.getByLabelText("Page 3")).toHaveAttribute("aria-current", "page");
  });
});
