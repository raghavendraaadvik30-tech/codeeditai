import { z } from "zod";

export const styleSchema = z.object({
  name: z.string().min(1),

  font: z.string().min(1),

  size: z.number()
    .min(6)
    .max(96),

  weight: z.number()
    .min(100)
    .max(900),

  color: z.string().optional(),

  italic: z.boolean().optional(),

  underline: z.boolean().optional(),

  align: z.enum([
    "left",
    "center",
    "right",
    "justify",
  ]).optional(),

  lineHeight: z.number()
    .min(0.5)
    .max(5)
    .optional(),

  leftIndent: z.number()
    .min(0)
    .max(300)
    .optional(),

  rightIndent: z.number()
    .min(0)
    .max(300)
    .optional(),

  specialIndent: z.enum([
    "none",
    "hanging",
    "firstLine",
  ]).optional(),

  specialIndentBy: z.number()
    .min(0)
    .max(300)
    .optional(),

  spaceBefore: z.number()
    .min(0)
    .max(200)
    .optional(),

  spaceAfter: z.number()
    .min(0)
    .max(200)
    .optional(),

  lineSpacingType: z.enum([
    "single",
    "1.5lines",
    "double",
    "atLeast",
    "exactly",
    "multiple",
  ]).optional(),

  lineSpacingAt: z.number()
    .min(0)
    .max(200)
    .optional(),

  hiddenFromGallery:
    z.boolean().optional(),
});

export const styleOverrideSchema =
  styleSchema.partial();