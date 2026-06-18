import { Prisma } from "@prisma/client";

export function serializeForJson<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, current) => {
      if (typeof current === "bigint") return Number(current);
      if (current instanceof Prisma.Decimal) return Number(current);
      return current;
    }),
  );
}
