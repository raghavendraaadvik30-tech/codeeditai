/*types/index.ts contains shared TypeScript interfaces that define 
  the structure and allowed values of application data such as users, 
authenticated users, documents, and reference links;
 it does not store or fetch data,and 
 when the backend is connected the types may need to be adjusted or mapped to match the real API response, 
 especially removing the plain-text password from User.*/



export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Stored to simulate database authentication
  phone: string;
  role: "Admin" | "Author" | "Reviewer";
  status: "Active" | "Inactive" | "Suspended";
  createdDate: string;
  lastLogin?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Author" | "Reviewer";
  phone?: string;
  status?: "Active" | "Inactive" | "Suspended";
  lastLogin?: string;
}

export interface DocumentInfo {
  id: string;
  title: string;
  protocolNo: string;
  studyPhase: string;
  indication: string;
  synopsis: string;
  objectives: string;
  classification: string;
  pages: number;
}

export interface ReferenceLink {
  id: string;
  label: string;
  type: string; // e.g. 'Internal', 'External'
  status: "Valid" | "Warning" | "Error";
  subLabel: string;
}

