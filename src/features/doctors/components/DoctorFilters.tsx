"use client";

import { ActiveFilterChips, type Chip } from "@/components/data-table/ActiveFilterChips";
import { DateRangeFilter } from "@/components/data-table/DateRangeFilter";
import { FacetedFilter } from "@/components/data-table/FacetedFilter";
import { SearchInput } from "@/components/data-table/SearchInput";
import { describeRange } from "@/lib/date-presets";
import { useDoctorFacetsQuery } from "../hooks";
import type { DoctorListParams } from "../types";

type Props = {
  params: DoctorListParams;
  onFilter: (patch: Partial<DoctorListParams>, opts?: { replace?: boolean }) => void;
  onClearAll: () => void;
};

export function DoctorFilters({ params, onFilter, onClearAll }: Props) {
  const facets = useDoctorFacetsQuery();
  const toOptions = (v?: string[]) => (v ?? []).map((s) => ({ value: s, label: s }));

  const chips: Chip[] = [
    ...params.specialization.map((s) => ({
      key: `spec:${s}`,
      label: `Specialization: ${s}`,
      onRemove: () => onFilter({ specialization: params.specialization.filter((x) => x !== s) }),
    })),
    ...params.hospital.map((h) => ({
      key: `hosp:${h}`,
      label: `Hospital: ${h}`,
      onRemove: () => onFilter({ hospital: params.hospital.filter((x) => x !== h) }),
    })),
    ...(params.from || params.to
      ? [
          {
            key: "range",
            label: `Added: ${describeRange(params.from, params.to)}`,
            onRemove: () => onFilter({ from: null, to: null }),
          },
        ]
      : []),
    ...(params.q
      ? [{ key: "q", label: `Search: “${params.q}”`, onRemove: () => onFilter({ q: "" }) }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.q}
          onCommit={(q) => onFilter({ q }, { replace: true })}
          placeholder="Search name, specialty, hospital, email…"
          label="Search doctors"
        />
        <FacetedFilter
          title="Specialization"
          options={toOptions(facets.data?.specializations)}
          selected={params.specialization}
          onChange={(specialization) => onFilter({ specialization })}
          loading={facets.isLoading}
        />
        <FacetedFilter
          title="Hospital"
          options={toOptions(facets.data?.hospitals)}
          selected={params.hospital}
          onChange={(hospital) => onFilter({ hospital })}
          loading={facets.isLoading}
        />
        <DateRangeFilter
          title="Date added"
          from={params.from}
          to={params.to}
          onChange={(r) => onFilter(r)}
        />
      </div>
      <ActiveFilterChips chips={chips} onClearAll={onClearAll} />
    </div>
  );
}
