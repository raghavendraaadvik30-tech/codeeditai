/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Zod Validation Schemas
 * Description:
 * Runtime data validation schemas for tracked changes, 
 * and payloads.
 * --------------------------------------------------------
 */

import { z } from "zod";



export const TrackedChangeSchema = z.object({
  id: z.string().min(1, "Change ID is required"),
  author: z.string().min(1, "Author name is required"),
  timestamp: z.number().int().positive("Invalid timestamp"),
  type: z.enum(["insert", "delete", "edit"]),
  originalText: z.string().default(""),
  newText: z.string().default(""),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  label: z.string().optional(),
  pageId: z.string().optional(),
  selector: z.string().optional(),
});

export const CreateTrackedChangePayloadSchema = z.object({
  author: z.string().min(1, "Author is required"),
  type: z.enum(["insert", "delete", "edit"]),
  originalText: z.string().optional(),
  newText: z.string().optional(),
  pageId: z.string().optional(),
  label: z.string().optional(),
});

export const UpdateTrackedChangePayloadSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  label: z.string().optional(),
});
