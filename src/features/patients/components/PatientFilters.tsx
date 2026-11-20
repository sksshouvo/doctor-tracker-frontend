"use client";

import { ActiveFilterChips, type Chip } from "@/components/data-table/ActiveFilterChips";
import { DateRangeFilter } from "@/components/data-table/DateRangeFilter";
import { FacetedFilter } from "@/components/data-table/FacetedFilter";
import { SearchInput } from "@/components/data-table/SearchInput";
import { DoctorCombobox } from "@/components/common/DoctorCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup } from "./ToggleGroup";
import { CONDITIONS, CONDITION_MAP, GENDERS } from "@/lib/constants";
import { describeRange } from "@/lib/date-presets";
import type { Condition } from "@/types/api";
import type { PatientListParams } from "../types";

type Props = {
  params: PatientListParams;
  onFilter: (patch: Partial<PatientListParams>, opts?: { replace?: boolean }) => void;
  onClearAll: () => void;
  /** Hide the doctor filter on the doctor-detail page. */
  showDoctorFilter: boolean;
};

const conditionOptions = CONDITIONS.map((c) => ({
  value: c.value,
  label: c.label,
  dotClass: c.dot,
}));

export function PatientFilters({ params, onFilter, onClearAll, showDoctorFilter }: Props) {
  const rangeLabel = params.dateField === "visitDate" ? "Visit date" : "Date added";
  const chips: Chip[] = [
    ...(params.q
      ? [{ key: "q", label: `Search: “${params.q}”`, onRemove: () => onFilter({ q: "" }) }]
      : []),
    ...params.condition.map((c) => ({
      key: `cond:${c}`,
      label: `Condition: ${CONDITION_MAP[c as Condition]?.label ?? c}`,
      onRemove: () => onFilter({ condition: params.condition.filter((x) => x !== c) }),
    })),
    ...(params.gender
      ? [
          {
            key: "gender",
            label: `Gender: ${params.gender}`,
            onRemove: () => onFilter({ gender: null }),
          },
        ]
      : []),
    ...(showDoctorFilter && params.doctorId
      ? [{ key: "doctor", label: "Doctor filter", onRemove: () => onFilter({ doctorId: null }) }]
      : []),
    ...(params.from || params.to
      ? [
          {
            key: "range",
            label: `${rangeLabel}: ${describeRange(params.from, params.to)}`,
            onRemove: () => onFilter({ from: null, to: null }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.q}
          onCommit={(q) => onFilter({ q }, { replace: true })}
          placeholder="Search name, diagnosis, phone, email…"
          label="Search patients"
        />
        <FacetedFilter
          title="Condition"
          options={conditionOptions}
          selected={params.condition}
          onChange={(condition) => onFilter({ condition })}
          searchable={false}
        />
        {showDoctorFilter && (
          <div className="w-52">
            <DoctorCombobox
              className="h-9"
              clearable
              placeholder="All doctors"
              value={params.doctorId}
              onChange={(id) => onFilter({ doctorId: id })}
            />
          </div>
        )}
        <Select
          value={params.gender ?? "any"}
          onValueChange={(v) => onFilter({ gender: v === "any" ? null : v })}
        >
          <SelectTrigger
            size="sm"
            className="h-9 w-32"
            aria-label={`Gender filter, ${GENDERS.find((g) => g.value === params.gender)?.label ?? "Any gender"}`}
          >
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any gender</SelectItem>
            {GENDERS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter
          title={rangeLabel}
          from={params.from}
          to={params.to}
          onChange={(r) => onFilter(r)}
        />
        <ToggleGroup
          label="Date filter applies to"
          value={params.dateField}
          onChange={(dateField) => onFilter({ dateField })}
          options={[
            { value: "visitDate", label: "Visit date" },
            { value: "createdAt", label: "Date added" },
          ]}
        />
      </div>
      <ActiveFilterChips chips={chips} onClearAll={onClearAll} />
    </div>
  );
}
