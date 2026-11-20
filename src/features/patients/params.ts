import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";

export const patientParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  sort: parseAsString.withDefault("-visitDate"),
  condition: parseAsArrayOf(parseAsString).withDefault([]),
  doctorId: parseAsString,
  gender: parseAsString,
  dateField: parseAsStringLiteral(["visitDate", "createdAt"] as const).withDefault("visitDate"),
  from: parseAsString,
  to: parseAsString,
};
export const PATIENT_DEFAULT_SORT = "-visitDate";

/** The doctor-detail page embeds the table, so its URL keys are prefixed to avoid collisions. */
export const patientUrlKeys = {
  q: "pq",
  page: "ppage",
  limit: "plimit",
  sort: "psort",
  condition: "pcondition",
  doctorId: "pdoctor",
  gender: "pgender",
  dateField: "pdatefield",
  from: "pfrom",
  to: "pto",
} as const;
