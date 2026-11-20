import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs";

export const doctorParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  sort: parseAsString.withDefault("-createdAt"),
  specialization: parseAsArrayOf(parseAsString).withDefault([]),
  hospital: parseAsArrayOf(parseAsString).withDefault([]),
  from: parseAsString,
  to: parseAsString,
};
export const DOCTOR_DEFAULT_SORT = "-createdAt";
