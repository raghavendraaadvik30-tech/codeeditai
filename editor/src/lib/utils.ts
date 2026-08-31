// cn.ts
// PURPOSE:
// This file contains a small reusable CSS class utility.

// "cn" stands for "className".
// It combines:
// 1. clsx   -> Combines conditional class names.
// 2. tailwind-merge    -> Removes conflicting Tailwind classes and keeps the correct final class.
// This utility is commonly used in React + Tailwind + Shadcn projects.

// BACKEND:
// This file has NO backend logic.
// It does NOT call APIs.
// It does NOT contain business logic.
// It is purely a frontend styling utility.

/*
  clsx:
  Used to conditionally combine CSS class names.
  ClassValue:
  Type provided by clsx that describes the supported values that can be passed into clsx.
*/


import { clsx, type ClassValue } from "clsx"

/*
  twMerge:
  Intelligently merges Tailwind CSS classes.
  Example:
  "px-2 px-4"
  becomes:  "px-4"
  because px-4 overrides px-2.
*/
import { twMerge } from "tailwind-merge"


// cn()
// PURPOSE:
// Combines multiple className values and resolves conflicting Tailwind classes.
// Example:
// cn(
//   "text-sm",
//   isActive && "text-blue-600",
//   "px-4"
// )
//
// Returns one final className string.
//
// It can receive:
// - strings
// - conditional classes
// - arrays
// - objects supported by clsx

export function cn(...inputs: ClassValue[]) {

  /*
    STEP 1:
    clsx(inputs)
    Combines all provided class values into a single class string.
    Example:
    cn(
      "text-sm",
      true && "font-bold",
      false && "hidden"
    )
    clsx result:
    "text-sm font-bold"
  */


  /*
    STEP 2:
    twMerge(...)
    Checks the generated Tailwind classes for conflicts.
    Example:
    Input:
    "px-2 px-4 text-red-500 text-blue-500"
    twMerge result:
    "px-4 text-blue-500"
    The conflicting classes are intelligently resolved.
  */

  return twMerge(clsx(inputs))
}