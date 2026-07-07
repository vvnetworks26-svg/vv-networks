import { z } from "zod";

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort:  z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function buildSortObj(
  sort = "createdAt",
  order: "asc" | "desc" = "desc"
): Record<string, 1 | -1> {
  return { [sort]: order === "asc" ? 1 : -1 };
}
