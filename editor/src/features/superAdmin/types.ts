
export type UserRole = "ADMIN" | "AUTHOR" | "REVIEWER" | "EDITOR";

export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  clientWorkspace: string;
  assignedAdmin?: string;
  assignedAdminEmail?: string;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
  lastLogin: string;
  password?: string;
  workspaceName?: string;
  workspaceCode?: string;
  workspaceStatus?: string;
  branchName?: string;
  subBranch?: string;
}

export interface ActivityLog {
  id: string;
  performedBy: string;
  performedByRole: string;
  activity: string;
  activityDescription: string;
  affectedUser: string;
  affectedTarget: string;
  dateTime: string;
  status: string;
  category: string;
}
