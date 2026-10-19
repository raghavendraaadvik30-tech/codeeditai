/**
 * UserManagement.tsx
 * The Status column has been removed from the users table.
 * Status data and status display in the View User dialog are preserved.
 * Reconstructed from the supplied Markdown code dump; verify in your project.
 */

import React, { useState } from "react";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import * as XLSX from "xlsx";

import { useUsersStore } from "@/shared/stores/usersStore";

import type { User } from "../types/dashboard.types";

import {

  Plus,

  Search,

  Trash2,

  Edit3,

  Eye,

  X,

  Mail,

  User as UserIcon,

  Calendar,

  Layers,

  AlertCircle,

  FileSpreadsheet,

  Copy,

  Check,

  ExternalLink,

  Share2,

  EyeOff,

} from "lucide-react";

import { Card } from "@/shared/components/ui/card";

import { Input } from "@/shared/components/ui/input";

import { Button } from "@/shared/components/ui/button";

import { Label } from "@/shared/components/ui/label";

import {

  Dialog,

  DialogContent,

  DialogHeader,

  DialogTitle,

  DialogFooter,

} from "@/shared/components/ui/dialog";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/shared/components/ui/select";

/* ADD USER FORM */

type UserRole = "Admin" | "Author";

interface AddUserFormInput {

  fullName: string;

  email: string;

  password: string;

  role: UserRole;

}

/* EDIT USER FORM */

interface EditUserFormInput {

  fullName: string;

  email: string;

  password?: string;

  role: UserRole;

}

/* ADD USER VALIDATION */

const addUserFormSchema = z.object({

  fullName: z

    .string()

    .min(3, {

      message: "Full Name must contain at least 3 characters",

    }),

  email: z

    .string()

    .min(1, {

      message: "Email address is required",

    })

    .email({

      message: "Provide a valid email address",

    }),

  password: z.string().min(6, {

    message: "Password must contain at least 6 characters",

  }),

  role: z.enum(["Admin", "Author"]),

});

/* EDIT USER VALIDATION */

const editUserFormSchema = z.object({

  fullName: z

    .string()

    .min(3, {

      message: "Full Name must contain at least 3 characters",

    }),

  email: z

    .string()

    .min(1, {

      message: "Email address is required",

    })

    .email({

      message: "Provide a valid email address",

    }),

  password: z.string().optional().refine(

    (value) => !value || value.length >= 6,

    { message: "Password must contain at least 6 characters" }

  ),

  role: z.enum(["Admin", "Author"]),

});

/* COMPONENT */

export default function UsersManagement() {

  /* USER STORE */

  const {

    users,

    addUser,

    updateUser,

    deleteUser,

    searchQuery,

    setSearchQuery,

    roleFilter,

    setRoleFilter,

  } = useUsersStore();

  /* MODAL STATE */

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [showAddPassword, setShowAddPassword] = useState(false);

  const [showEditPassword, setShowEditPassword] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  /* SELECTED USER STATE */

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const [inviteUser, setInviteUser] = useState<User | null>(null);
  // Temporarily retain the password for the invitation preview.
  const [invitePassword, setInvitePassword] = useState<string>("");
  // Passwords are retained only in component memory so the invitation// opened for a newly provisioned user can display and copy the password.
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});

  /* COPY STATE */

  const [copiedField, setCopiedField] = useState<string | null>(null);

  /* SEARCH */

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); };

  /* ADD USER FORM */

  const {

    register: registerAdd,

    handleSubmit: handleAddSubmit,

    control: controlAdd,

    reset: resetAdd,

    formState: { errors: errorsAdd },

  } = useForm<AddUserFormInput>({

    resolver: zodResolver(addUserFormSchema),

    defaultValues: {

      fullName: "",

      email: "",

      password: "",

      role: "Author",

    },

  });

  /* EDIT USER FORM */

  const {

    register: registerEdit,

    handleSubmit: handleEditSubmit,

    control: controlEdit,

    setValue: setEditValue,

    reset: resetEdit,

    formState: { errors: errorsEdit },

  } = useForm<EditUserFormInput>({

    resolver: zodResolver(editUserFormSchema),

    defaultValues: {

      fullName: "",

      email: "",

      password: "",

      role: "Author",

    },

  });

  /* ADD USER */

  const onAddSubmit = (data: AddUserFormInput) => {

    addUser({

      fullName: data.fullName,

      email: data.email,

      phone: "",

      role: data.role,

      status: "Active",

    });

    setIsAddOpen(false);
    // Keep the entered password for the invitation preview.
    setInvitePassword(data.password);

    resetAdd();

    setShowAddPassword(false);

    /* Open invitation preview for the newly created user.The password entered during provisioning is shown in the invitation preview so it can be copied. */

    setTimeout(() => {

      const allUsers = useUsersStore.getState().users;

      const newlyAdded = allUsers.find(

        (user) => user.email === data.email

      );

      if (newlyAdded) {

        setUserPasswords((current) => ({

          ...current,

          [newlyAdded.id]: data.password,

        }));

        setInvitePassword(data.password);

        setInviteUser(newlyAdded);

        setCopiedField(null);

        setIsInviteOpen(true);

      }

    }, 100);

  };

  /* EDIT USER */

  const onEditSubmit = (data: EditUserFormInput) => {

    if (!selectedUser) {

      return;

    }

    updateUser(selectedUser.id, {

      fullName: data.fullName,

      email: data.email,

      role: data.role,

      status: selectedUser.status || "Active",

    });

    setIsEditOpen(false);

    setSelectedUser(null);

    resetEdit();

    setShowEditPassword(false);

  };

  /* OPEN EDIT MODAL */

  const openEditModal = (user: User) => {

    setSelectedUser(user);

    setEditValue("fullName", user.fullName);

    setEditValue("email", user.email);

    setEditValue("password", "");

    setEditValue("role", user.role === "Admin" ? "Admin" : "Author");

    setIsEditOpen(true);

  };

  /* OPEN VIEW MODAL */

  const openViewModal = (user: User) => {

    setSelectedUser(user);

    setIsViewOpen(true);

  };

  /* DELETE */

  const handleDeleteClick = (

    id: string,

    name: string) => {

    setUserToDelete({

      id,

      name,

    });

    setIsDeleteOpen(true);

  };

  const confirmDeleteAction = () => {

    if (!userToDelete) {

      return;

    }

    deleteUser(userToDelete.id);

    setIsDeleteOpen(false);

    setUserToDelete(null);

  };

  /* EXPORT TO EXCEL */

  const handleExportToExcel = () => {

    const dataToExport = filteredUsers.map((user) => ({

      "Full Name": user.fullName,

      "Email Address": user.email,

      Role: user.role,

      Status: user.status || "Active",

      "Created Date": user.createdDate,

    }));

    const worksheet =

      XLSX.utils.json_to_sheet(dataToExport);

    const workbook =

      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      "Users"

    );

    XLSX.writeFile(

      workbook,

      "system_users_directory.xlsx"

    );

  };

  /* SEARCH + ROLE FILTER */

  const filteredUsers = users.filter((user) => {

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =

      user.fullName.toLowerCase().includes(query) ||

      user.email.toLowerCase().includes(query) ||

      user.role.toLowerCase().includes(query) ||

      (user.status || "Active")

        .toLowerCase()

        .includes(query);

    const matchesRole =

      roleFilter === "All" ||

      user.role === roleFilter;

    return matchesSearch && matchesRole;

  });

  /* COPY HELPER */

  const handleCopy = async (

    value: string,

    field: string

  ) => {

    try {

      await navigator.clipboard.writeText(value);

      setCopiedField(field);

      setTimeout(() => {

        setCopiedField(null);

      }, 2000);

    } catch (error) {

      console.error(

        "Failed to copy value:",

        error

      );

    }

  };

  /* INVITATION CONTENT */

  const invitationText = inviteUser

    ? `Dear ${inviteUser.fullName},

You have been provisioned as a ${inviteUser.role} on our clinical platform.

Secure Portal Link: ${window.location.origin}

Registered Email: ${inviteUser.email}

Password: ${invitePassword}

Assigned Role: ${inviteUser.role}

Please use the credentials above to access the secure portal.`

    : "";

  /* RENDER */

  return (

    <div

      className="space-y-6"

      id="users-module-container"

    >

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>


          <h1 className="text-2xl md:text-3xl font-extrabold text-[#172033] dark:text-white  text-foreground tracking-tight">
            User Directory

          </h1>

        </div>

      </div>

      {/* SEARCH / FILTER / ACTIONS */}

      <div className="flex flex-col md:flex-row gap-3 items-center w-full">

        {/* Search */}

        <div className="relative flex-1 w-full">

          <Search

            className="

              absolute

              left-3.5

              top-1/2

              -translate-y-1/2

              h-4

              w-4

              text-muted-foreground

            "

          />

          <Input

            value={searchQuery}

            onChange={handleSearchChange}

            type="text"

            placeholder="Search by name or email..."

            className="

          h-10

          pl-10

          border-secondary

          bg-card

          rounded-xl

          text-xs

          sm:text-sm

          focus-visible:ring-primary/20

          "

            id="system-users-search-input"

          />

          {searchQuery && (

            <button

              type="button"

              onClick={() => setSearchQuery("")}

              className="

                absolute

                right-3

                top-1/2

                -translate-y-1/2

                 text-muted-foreground

                hover:text-secondary-foreground

                transition-colors

              "

              title="Clear search"

              aria-label="Clear search"

            >

              <X className="h-3.5 w-3.5" />

            </button>

          )}

        </div>

        {/* Filters + Actions */}

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center shrink-0">

          {/* Role Filter */}

          <div className="w-full sm:w-44 shrink-0">

            <Select

              value={roleFilter}

              onValueChange={(value) => {

                if (value)

                  setRoleFilter(value);

              }}

            >

              <SelectTrigger

                className="

                  h-10

                  border-secondary

                  bg-card

                  rounded-xl

                  text-xs

                  sm:text-sm

                  text-foreground

                  focus:ring-primary/20

                "

              >

                <SelectValue placeholder="Filter roles" />

              </SelectTrigger>

              <SelectContent className="bg-card border-secondary">

                <SelectItem value="All">

                  All

                </SelectItem>

                <SelectItem value="Admin">

                  Admin

                </SelectItem>

                <SelectItem value="Author">

                  Author

                </SelectItem>

              </SelectContent>

            </Select>

          </div>

          {/* Export */}

          <Button

            onClick={handleExportToExcel}

            variant="outline"

            className="

              w-full

              sm:w-auto

              h-10

              px-4

              rounded-xl

              text-secondary-foreground

              hover:text-foreground

              border-secondary

              bg-card

              flex

              items-center

              justify-center

              gap-2

              text-xs

              font-bold

              transition-all

              hover:bg-muted

            "

            title="Export to Excel"

            id="export-to-excel-btn"

          >

            <FileSpreadsheet className="h-4 w-4 text-success-600" />

            <span>Export to Excel</span>

          </Button>

          {/* Add User */}

          <Button

            onClick={() => setIsAddOpen(true)}

            className="

              w-full

              sm:w-auto

              bg-button-primary

              hover:bg-button-primary-hover

              text-button-primary-foreground

              font-bold

              h-10

              px-4

              rounded-xl

              shadow-sm

              shadow-primary/10

              hover:shadow-primary/20

              transition-all

              gap-2

              flex

              items-center

              justify-center

            "

            id="add-user-trigger-btn"

          >

            <Plus className="h-4 w-4" />

            <span>Add User</span>

          </Button>

        </div>

      </div>

      {/* ====================================================== USERS TABLE ====================================================== */}

      <Card

        className="

          border

          border-secondary

          bg-card

          rounded-2xl

          overflow-hidden

          shadow-sm

          shadow-muted/50

        "

      >

        <div className="overflow-x-auto">




          <table
            className="w-full table-fixed border-collapse text-left"
            id="users-data-table-node"
          >
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />

            </colgroup>

            {/* Table Header */}
            <thead>
              <tr className="bg-muted/60 border-b border-secondary">
                <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Full Name
                </th>
                <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Email Address
                </th>
                <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Role
                </th>
                <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Created Date
                </th>
                <th className="px-2 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Invitation
                </th>
                <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-secondary bg-card">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-muted/40"
                  >
                    {/* Full Name */}
                    <td className="px-3 py-2.5 text-xs font-bold text-foreground">
                      {user.fullName}
                    </td>

                    {/* Email Address */}
                    <td className="break-all px-3 py-2.5 text-xs text-secondary-foreground font-normal">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-3 py-2.5 text-xs font-medium text-foreground">
                      {user.role}
                    </td>

                    {/* Created Date */}
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      {user.createdDate}
                    </td>

                    {/* Invitation */}
                    <td className="px-2 py-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInviteUser(user);
                          setInvitePassword(userPasswords[user.id] || "");
                          setCopiedField(null);
                          setIsInviteOpen(true);
                        }}
                        className="inline-flex h-7.5 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-primary/25 bg-[#F0F4F8] px-3 text-[11px] font-semibold text-primary shadow-none transition-colors hover:bg-primary/10"
                        title="Prepare email invitation"
                        id={`invite-action-btn-${user.id}`}
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>Invite</span>
                      </Button>
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-secondary bg-card text-primary transition-colors hover:bg-muted"
                          title="Edit user"
                          aria-label={`Edit ${user.fullName}`}
                          id={`edit-action-btn-${user.id}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(user.id, user.fullName)
                          }
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-secondary bg-card text-destructive transition-colors hover:bg-muted"
                          title="Delete user"
                          aria-label={`Delete ${user.fullName}`}
                          id={`delete-action-btn-${user.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm font-medium text-muted-foreground"
                  >
                    No users found matching your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>




        </div>

      </Card>

      {/* ====================================================== ADD USER MODAL ====================================================== */}

      <Dialog

        open={isAddOpen}

        onOpenChange={(open) => {

          setIsAddOpen(open);

          if (!open) {

            resetAdd();

            setShowAddPassword(false);

          }

        }}

      >

        <DialogContent

          className="

            sm:max-w-110

            border

            border-secondary

            bg-card

            p-6

            rounded-2xl

            shadow-xl

            text-foreground

          "

        >

          <DialogHeader className="border-b border-muted pb-3">

            <DialogTitle className="text-lg font-extrabold text-foreground">

              Provision User Account

            </DialogTitle>

          </DialogHeader>

          <form

            onSubmit={handleAddSubmit(onAddSubmit)}

            className="space-y-4 pt-3"

          >

            {/* Full Name */}

            <div className="space-y-1">

              <Label htmlFor="add-fullName">

                Full Name

              </Label>

              <Input

                id="add-fullName"

                type="text"

                placeholder="e.g. Dr. Arthur S. Vance"

                {...registerAdd("fullName")}

              />

              {errorsAdd.fullName && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsAdd.fullName.message}

                </p>

              )}

            </div>

            {/* Email */}

            <div className="space-y-1">

              <Label htmlFor="add-email">

                Email Address

              </Label>

              <Input

                id="add-email"

                type="email"

                placeholder="a.vance@example.com"

                {...registerAdd("email")}

              />

              {errorsAdd.email && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsAdd.email.message}

                </p>

              )}

            </div>

            {/* Password */}

            <div className="space-y-1">

              <Label htmlFor="add-password">

                Password

              </Label>

              <div className="relative">

                <Input

                  id="add-password"

                  type={showAddPassword ? "text" : "password"}

                  placeholder="Enter password"

                  className="pr-10"

                  {...registerAdd("password")}

                />

                <button

                  type="button"

                  onClick={() =>

                    setShowAddPassword((value) => !value)

                  }

                  aria-label={

                    showAddPassword

                      ? "Hide password"

                      : "Show password"

                  }

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground transition-colors"

                >

                  {showAddPassword ? (

                    <Eye className="h-4 w-4" />

                  ) : (

                    <EyeOff className="h-4 w-4" />

                  )}

                </button>

              </div>

              {errorsAdd.password && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsAdd.password.message}

                </p>

              )}

            </div>

            {/* Role */}

            <div className="space-y-1">

              <Label>

                Role

              </Label>

              <Controller

                name="role"

                control={controlAdd}

                render={({ field }) => (

                  <Select

                    value={field.value}

                    onValueChange={field.onChange}

                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select role" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="Admin">

                        Admin

                      </SelectItem>

                      <SelectItem value="Author">

                        Author

                      </SelectItem>

                    </SelectContent>

                  </Select>

                )}

              />

              {errorsAdd.role && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsAdd.role.message}

                </p>

              )}

            </div>

            <DialogFooter className="pt-3 border-t border-muted mt-2">

              <Button

                type="button"

                variant="outline"

                onClick={() => {

                  setIsAddOpen(false);

                  resetAdd();

                  setShowAddPassword(false);

                }}

              >

                Cancel

              </Button>

              <Button

                type="submit"

                className="bg-button-primary hover:bg-button-primary-hover text-button-primary-foreground"

              >

                Create User

              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* ====================================================== EDIT USER MODAL ====================================================== */}

      <Dialog

        open={isEditOpen}

        onOpenChange={(open) => {

          setIsEditOpen(open);

          if (!open) {

            setSelectedUser(null);

            resetEdit();

            setShowEditPassword(false);

          }

        }}

      >

        <DialogContent

          className="

            sm:max-w-110

            border

            border-secondary

            bg-card

            p-6

            rounded-2xl

            shadow-xl

            text-foreground

          "

        >

          <DialogHeader className="border-b border-muted pb-3">

            <DialogTitle className="text-lg font-extrabold text-foreground">

              Edit User

            </DialogTitle>
          </DialogHeader>

          <form

            onSubmit={handleEditSubmit(onEditSubmit)}

            className="space-y-4 pt-3"

          >

            {/* Full Name */}

            <div className="space-y-1">

              <Label htmlFor="edit-fullName">

                Full Name

              </Label>

              <Input

                id="edit-fullName"

                type="text"

                placeholder="e.g. Dr. Arthur S. Vance"

                {...registerEdit("fullName")}

              />

              {errorsEdit.fullName && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsEdit.fullName.message}

                </p>

              )}

            </div>

            {/* Email */}

            <div className="space-y-1">

              <Label htmlFor="edit-email">

                Email Address

              </Label>

              <Input

                id="edit-email"

                type="email"

                placeholder="a.vance@example.com"

                {...registerEdit("email")}

              />

              {errorsEdit.email && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsEdit.email.message}

                </p>

              )}

            </div>

            {/* Password */}

            <div className="space-y-1">

              <Label htmlFor="edit-password">

                Password

              </Label>

              <div className="relative">

                <Input

                  id="edit-password"

                  type={showEditPassword ? "text" : "password"}

                  placeholder="Enter new password"

                  className="pr-10"

                  {...registerEdit("password")}

                />

                <button

                  type="button"

                  onClick={() =>

                    setShowEditPassword((value) => !value)

                  }

                  aria-label={

                    showEditPassword

                      ? "Hide password"

                      : "Show password"

                  }

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground transition-colors"

                >

                  {showEditPassword ? (

                    <Eye className="h-4 w-4" />

                  ) : (

                    <EyeOff className="h-4 w-4" />

                  )}

                </button>

              </div>

              {errorsEdit.password && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsEdit.password.message}

                </p>

              )}

            </div>

            {/* Role */}

            <div className="space-y-1">

              <Label>

                Role

              </Label>

              <Controller

                name="role"

                control={controlEdit}

                render={({ field }) => (

                  <Select

                    value={field.value}

                    onValueChange={field.onChange}

                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select role" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="Admin">

                        Admin

                      </SelectItem>

                      <SelectItem value="Author">

                        Author

                      </SelectItem>

                    </SelectContent>

                  </Select>

                )}

              />

              {errorsEdit.role && (

                <p className="text-11px text-destructive flex items-center gap-1">

                  <AlertCircle className="h-3 w-3" />

                  {errorsEdit.role.message}

                </p>

              )}

            </div>

            <DialogFooter className="pt-3 border-t border-muted mt-2">

              <Button

                type="button"

                variant="outline"

                onClick={() => {

                  setIsEditOpen(false);

                  setSelectedUser(null);

                  resetEdit();

                  setShowEditPassword(false);

                }}

              >

                Cancel

              </Button>

              <Button

                type="submit"

                className="bg-button-primary hover:bg-button-primary-hover text-button-primary-foreground"

              >

                Save Changes

              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* ====================================================== VIEW USER MODAL ====================================================== */}

      <Dialog

        open={isViewOpen}

        onOpenChange={setIsViewOpen}

      >

        <DialogContent

          className="

            sm:max-w-110

            border

            border-secondary

            bg-card

            p-6

            rounded-2xl

            shadow-xl

            text-foreground

          "

        >

          <DialogHeader className="border-b border-muted pb-4">

            <div className="flex items-center gap-3">

              <div

                className="

                  h-10

                  w-10

                  bg-muted

                  rounded-full

                  flex

                  items-center

                  justify-center

                  text-secondary-foreground

                "

              >

                <UserIcon className="h-5 w-5" />

              </div>

              <div className="overflow-hidden">

                <DialogTitle

                  className="

                    text-base

                    font-extrabold

                    text-foreground

                    truncate

                  "

                >

                  {selectedUser?.fullName}

                </DialogTitle>

                <span className="text-10px text-muted-foreground font-semibold font-mono">

                  USER ACCOUNT {selectedUser?.id}

                </span>

              </div>

            </div>

          </DialogHeader>

          <div className="py-4 space-y-3.5 text-xs">

            <div className="flex items-center justify-between border-b border-muted pb-2">

              <span className="text-muted-foreground font-semibold flex items-center gap-1">

                <Mail className="h-3.5 w-3.5" />

                Email Address

              </span>

              <span className="font-medium text-foreground">

                {selectedUser?.email}

              </span>

            </div>

            <div className="flex items-center justify-between border-b border-muted pb-2">

              <span className="text-muted-foreground font-semibold flex items-center gap-1">

                <Layers className="h-3.5 w-3.5" />

                Role

              </span>

              <span

                className="

                  inline-flex

                  items-center

                  px-2

                  py-0.5

                  rounded

                  text-10px

                  font-bold

                  bg-primary/15

                  text-primary

                "

              >

                {selectedUser?.role}

              </span>

            </div>

            <div className="flex items-center justify-between border-b border-muted pb-2">

              <span className="text-muted-foreground font-semibold">

                Status

              </span>

              <span

                className={`

                  inline-flex

                  items-center

                  gap-1.5

                  px-2.5

                  py-0.5

                  rounded-full

                  text-10px

                  font-bold

                  uppercase

                  ${selectedUser?.status === "Active"

                    ? "bg-success-50 text-success-700"

                    : selectedUser?.status === "Inactive"

                      ? "bg-muted text-secondary-foreground"

                      : "bg-ember-50 text-ember-700"

                  }

                `}

              >

                <span

                  className={`

                    h-1.5

                    w-1.5

                    rounded-full

                    ${selectedUser?.status === "Active"

                      ? "bg-success-500"

                      : selectedUser?.status === "Inactive"

                        ? "bg-muted-foreground"

                        : "bg-ember-500"

                    }

                  `}

                />

                {selectedUser?.status || "Active"}

              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground font-semibold flex items-center gap-1">

                <Calendar className="h-3.5 w-3.5" />

                Created Date

              </span>

              <span className="font-mono text-foreground">

                {selectedUser?.createdDate}

              </span>

            </div>

          </div>

          <DialogFooter className="pt-3 border-t border-muted">

            <Button

              onClick={() => {

                setIsViewOpen(false);

                setSelectedUser(null);

              }}

              className="

                h-9

                rounded-xl

                bg-muted

                hover:bg-secondary

                text-foreground

              "

            >

              Close

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ====================================================== DELETE CONFIRMATION ====================================================== */}

      <Dialog

        open={isDeleteOpen}

        onOpenChange={setIsDeleteOpen}

      >

        <DialogContent

          className="

            sm:max-w-110

            border

            border-secondary

            bg-card

            p-6

            rounded-2xl

            shadow-xl

            text-foreground

          "

        >

          <DialogHeader className="border-b border-destructive/10 pb-4">

            <div className="flex items-center gap-3">

              <div

                className="

                  h-10

                  w-10

                  bg-destructive/10

                  rounded-full

                  flex

                  items-center

                  justify-center

                  text-destructive

                "

              >

                <Trash2 className="h-5 w-5" />

              </div>

              <div>

                <DialogTitle className="text-base font-extrabold text-foreground">

                  Delete

                </DialogTitle>

              </div>

            </div>

          </DialogHeader>

          <div className="py-4 space-y-3.5 text-xs">

            <p className="text-secondary-foreground font-medium leading-relaxed">

              Are you sure you want to revoke and delete{" "}

              <strong className="text-foreground">

                {userToDelete?.name}

              </strong>

              's system account?

            </p>



          </div>

          <DialogFooter className="pt-3 border-t border-muted">

            <Button

              variant="outline"

              onClick={() => {

                setIsDeleteOpen(false);

                setUserToDelete(null);

              }}

            >

              Cancel

            </Button>

            <Button

              onClick={confirmDeleteAction}

              className="

                h-9

                rounded-xl

                bg-destructive

                hover:bg-destructive

                text-primary-foreground

              "

            >

              Delete

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ====================================================== INVITATION MODAL ====================================================== */}

      <Dialog

        open={isInviteOpen}

        onOpenChange={(open) => {

          setIsInviteOpen(open);

          if (!open) {

            setInviteUser(null);

            setInvitePassword("");

            setCopiedField(null);

          }

        }}

      >

        <DialogContent

          className="

            sm:max-w-110

            border

            border-secondary

            bg-card

            p-5

            rounded-xl

            shadow-xl

            text-foreground

          "

        >

          <DialogHeader className="pb-2">

            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">

              <div

                className="

                  p-1

                  bg-primary/10

                  text-primary

                  rounded

                "

              >

                <Mail className="h-4 w-4" />

              </div>

              <span>

                Send Invitation

              </span>

            </DialogTitle>

          </DialogHeader>

          {inviteUser && (

            <div className="space-y-4">

              {/* Email Preview */}

              <div

                className="

                  border

                  border-secondary

                  rounded-lg

                  overflow-hidden

                  bg-card

                  shadow-sm

                  text-xs

                "

              >

                {/* Invitation Header */}

                <div

                  className="

                    bg-muted/80

                    px-3

                    py-2

                    border-b

                    border-muted

                    space-y-1.5

                  "

                >

                  <div className="flex items-center gap-2">

                    <span className="text-muted-foreground font-medium w-12">

                      To:

                    </span>

                    <div className="flex items-center gap-1.5 overflow-hidden">

                      <span className="font-semibold text-foreground truncate">

                        {inviteUser.fullName}

                      </span>

                      <span className="text-muted-foreground font-mono truncate">

                        {inviteUser.email}

                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="text-muted-foreground font-medium w-12">

                      Role:

                    </span>

                    <span

                      className="

                        bg-primary/15

                        text-primary

                        text-10px

                        font-bold

                        px-1.5

                        py-0.5

                        rounded

                        uppercase

                      "

                    >

                      {inviteUser.role}

                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="text-muted-foreground font-medium w-12">

                      Subject:

                    </span>

                    <span className="text-secondary-foreground font-semibold truncate">

                      Invitation to Workspace

                    </span>

                  </div>

                </div>

                {/* Invitation Body */}

                <div

                  className="

                    p-4

                    space-y-3

                    bg-card

                    text-secondary-foreground

                    leading-relaxed

                  "

                >

                  <p>

                    Dear{" "}

                    <strong className="text-foreground">

                      {inviteUser.fullName}

                    </strong>

                    ,

                  </p>

                  <p>

                    You have been provisioned as a{" "}

                    <strong className="text-foreground">

                      {inviteUser.role}

                    </strong>{" "}

                    on our  platform.

                    Please use the secure portal link below to

                    complete account activation and password setup.

                  </p>

                  {/* Secure Invitation Details */}

                  <div

                    className="

                      bg-muted/50

                      rounded-lg

                      border

                      border-muted

                      p-3

                      space-y-2

                      text-11px

                    "

                  >

                    {/* Portal Link */}

                    <div

                      className="

                        flex

                        items-center

                        justify-between

                        gap-3

                        pb-1.5

                        border-b

                        border-muted

                      "

                    >

                      <div className="overflow-hidden min-w-0">

                        <span className="text-muted-foreground font-medium uppercase text-9px block">

                          Secure Portal Link

                        </span>

                        <span

                          className="

                            text-primary

                            font-mono

                            truncate

                            block

                          "

                          title={window.location.origin}

                        >

                          {window.location.origin}

                        </span>

                      </div>

                      <Button

                        type="button"

                        onClick={() =>

                          handleCopy(

                            window.location.origin,

                            "link"

                          )

                        }

                        size="icon"

                        variant="ghost"

                        className="h-6 w-6"

                        title="Copy portal link"

                      >

                        {copiedField === "link" ? (

                          <Check className="h-3.5 w-3.5 text-success-600" />

                        ) : (

                          <Copy className="h-3 w-3" />

                        )}

                      </Button>

                    </div>

                    {/* Email */}

                    <div

                      className="

                        flex

                        items-center

                        justify-between

                        gap-3

                        pb-1.5

                        border-b

                        border-muted

                      "

                    >

                      <div className="overflow-hidden min-w-0">

                        <span className="text-muted-foreground font-medium uppercase text-9px block">

                          Registered Email

                        </span>

                        <span

                          className="text-secondary-foreground font-mono truncate block"

                          title={inviteUser.email}

                        >

                          {inviteUser.email}

                        </span>

                      </div>

                      <Button

                        type="button"

                        onClick={() =>

                          handleCopy(

                            inviteUser.email,

                            "email"

                          )

                        }

                        size="icon"

                        variant="ghost"

                        className="h-6 w-6"

                        title="Copy email"

                      >

                        {copiedField === "email" ? (

                          <Check className="h-3.5 w-3.5 text-success-600" />

                        ) : (

                          <Copy className="h-3 w-3" />

                        )}

                      </Button>

                    </div>

                    {/* Password */}

                    <div

                      className="flex items-center justify-between gap-3 pb-1.5 border-b border-muted"

                    >

                      <div className="overflow-hidden min-w-0">

                        <span className="text-muted-foreground font-medium uppercase text-9px block">

                          Password

                        </span>

                        <span

                          className={`font-mono truncate block ${invitePassword

                            ? "text-secondary-foreground"

                            : "text-muted-foreground italic"

                            }`}

                          title={invitePassword || "Password not available"}

                        >

                          {invitePassword || "Password not available"}

                        </span>

                      </div>

                      <Button

                        type="button"

                        onClick={() => {

                          if (invitePassword) {

                            handleCopy(invitePassword, "password");

                          }

                        }}

                        size="icon"

                        variant="ghost"

                        className={`h-6 w-6 ${!invitePassword ? "opacity-40 cursor-not-allowed" : ""

                          }`}

                        disabled={!invitePassword}

                        title={invitePassword ? "Copy password" : "Password not available"}

                      >

                        {copiedField === "password" ? (

                          <Check className="h-3.5 w-3.5 text-success-600" />

                        ) : (

                          <Copy className="h-3 w-3" />

                        )}

                      </Button>

                    </div>

                    {/* Role */}

                    <div

                      className="

                        flex

                        items-center

                        justify-between

                        gap-3

                      "

                    >

                      <div className="overflow-hidden min-w-0">

                        <span className="text-muted-foreground font-medium uppercase text-9px block">

                          Role Type

                        </span>

                        <span className="text-secondary-foreground font-semibold block">

                          {inviteUser.role}

                        </span>

                      </div>

                      <Button

                        type="button"

                        onClick={() =>

                          handleCopy(

                            inviteUser.role,

                            "role"

                          )

                        }

                        size="icon"

                        variant="ghost"

                        className="h-6 w-6"

                        title="Copy role"

                      >

                        {copiedField === "role" ? (

                          <Check className="h-3.5 w-3.5 text-success-600" />

                        ) : (

                          <Copy className="h-3 w-3" />

                        )}

                      </Button>

                    </div>

                  </div>

                  <p className="text-[10.5px] text-muted-foreground leading-normal">

                    Copy the password above and share these credentials with the user through a secure channel.

                  </p>

                </div>

              </div>

              {/* Invitation Actions */}

              <div className="grid grid-cols-2 gap-2">

                {/* Copy Invitation */}

                <Button

                  type="button"

                  onClick={() =>

                    handleCopy(

                      invitationText,

                      "full-invite"

                    )

                  }

                  variant="outline"

                  className="

                    h-9

                    px-3

                    rounded-lg

                    border-secondary

                    text-secondary-foreground

                    text-xs

                    font-semibold

                    flex

                    items-center

                    justify-center

                    gap-1.5

                  "

                >

                  {copiedField === "full-invite" ? (

                    <>

                      <Check className="h-3.5 w-3.5 text-success-600" />

                      <span>Copied!</span>

                    </>

                  ) : (

                    <>

                      <Share2 className="h-3.5 w-3.5 text-muted-foreground" />

                      <span>Copy Invitation</span>

                    </>

                  )}

                </Button>

                {/* Open Email Client */}

                <Button

                  type="button"

                  onClick={() => {

                    const subject =

                      encodeURIComponent(

                        "Invitation to join Clinical Workspace"

                      );

                    const body =

                      encodeURIComponent(

                        invitationText

                      );

                    const mailtoUrl =

                      `mailto:${inviteUser.email}` +

                      `?subject=${subject}` +

                      `&body=${body}`;

                    window.location.href =

                      mailtoUrl;

                  }}

                  className="

                    h-9

                    px-3

                    rounded-lg

                    bg-button-primary

                    hover:bg-button-primary-hover

                    text-button-primary-foreground

                    text-xs

                    font-bold

                    flex

                    items-center

                    justify-center

                    gap-1.5

                  "

                >

                  <ExternalLink className="h-3.5 w-3.5" />

                  <span>Email</span>

                </Button>

              </div>

              {/* Close */}

              <div className="flex justify-end pt-1 border-t border-muted">

                <Button

                  type="button"

                  onClick={() => {

                    setIsInviteOpen(false);

                    setInvitePassword("");

                    setInviteUser(null);

                    setCopiedField(null);

                  }}

                  variant="ghost"

                  className="

                    h-8

                    px-4

                    rounded-lg

                    text-muted-foreground

                  "

                >

                  Close

                </Button>

              </div>

            </div>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );

}
