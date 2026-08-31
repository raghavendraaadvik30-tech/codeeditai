/**
 * Centralized application roles.
 * Used for role-based navigation, permissions, and access control.
 * Backend authorization should also validate the user's role.
 */
export enum Role {
  Admin = "admin",
  Author = "author",
 }