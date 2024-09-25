import { z } from "zod";

// validators
export const categorySchema = z.object({
  name: z.string({ required_error: "Category name is required" }),
});

export const severitySchema = z.object({
  name: z.string({ required_error: "Severity name is required" }),
  order: z.coerce.number({ required_error: "Order number is required" }),
  color: z.string({ required_error: "Color is required" }),
});

export const foodSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string({ required_error: "Category name is required" }),
  severity: z.string({ required_error: "Severity name is required" }),
  notes: z.string().optional(),
});

// Types
export type Category = z.infer<typeof categorySchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Food = z.infer<typeof foodSchema>;
