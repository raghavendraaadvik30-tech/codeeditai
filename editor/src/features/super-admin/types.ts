// export type UserRole = "ADMIN" | "AUTHOR" | "REVIEWER" | "SUPER ADMIN";
// export type UserStatus = "Active" | "Inactive" | "Suspended";

// export interface Branch {
//   id: string;
//   code: string;
//   name: string;
//   country: string;
//   city: string;
//   state?: string;
//   subBranches: string[];
// }

// export interface SuperAdminUser {
//   id: string;
//   name: string;
//   phone: string;
//   email: string;
//   clientWorkspace: string;
//   workspaceCode?: string;
//   workspaceName?: string;
//   workspaceStatus?: "Client Active" | "Client Suspended";
//   assignedAdmin: string;
//   assignedAdminEmail?: string;
//   role: UserRole;
//   status: UserStatus;
//   lastLogin: string;
//   createdDate: string;
//   password?: string;
//   branchName?: string;
//   subBranch?: string;
// }

// export interface ActivityLog {
//   id: string;
//   performedBy: string;
//   performedByRole: string;
//   activity: string;
//   activityDescription: string;
//   affectedUser: string;
//   affectedTarget: string;
//   dateTime: string;
//   status: "Successful" | "Failed";
//   category: "Admin Activity" | "User Operations" | "Subscription & Billing" | "Security & Auth";
// }

// export interface ClientWorkspace {
//   id: string;
//   name: string;
//   code: string;
//   plan: string;
//   status: "Active" | "Suspended";
//   userCount: number;
//   adminName: string;
//   branchName?: string;
// }

// export interface WorkspaceSubBranch {
//   id: string;
//   workspaceId: string;
//   workspaceName: string;
//   code: string;
//   address: string;
//   branchId?: string;
//   branchName?: string;
//   createdAt: string;
// }
