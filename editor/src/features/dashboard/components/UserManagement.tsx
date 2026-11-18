/**
 * UserManagement.tsx
 * Users are loaded from and created through the backend via useUsersStore.
 * View and Invite are supported; edit/delete are removed until the store exposes them.
 */

import React, { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as XLSX from "xlsx"
import { useUsersStore } from "@/shared/stores/usersStore"
import type { User } from "@/shared/types/index"
import {
  Plus,
  Search,
  Eye,
  EyeOff,
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
  Loader2,
  Trash2,
} from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

/* ADD USER FORM */

type UserRole = "Admin" | "Author"

interface AddUserFormInput {
  fullName: string
  email: string
  password: string
  role: UserRole
}

const addUserFormSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full Name must contain at least 3 characters" }),

  email: z
    .string()
    .min(1, { message: "Email address is required" })
    .email({ message: "Provide a valid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters." })
    .refine((password) => new TextEncoder().encode(password).length <= 72, {
      message: "Password must not exceed 72 bytes.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number.",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character.",
    }),

  role: z.enum(["Admin", "Author"]),
})

const dialogClass =
  "sm:max-w-110 border border-secondary bg-card p-6 rounded-2xl shadow-xl text-foreground"

/* COMPONENT */

export default function UsersManagement() {
  /* USER STORE */
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    addUser,
    clearError,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    changeUserPassword,
    deleteUser, // ADD THIS
  } = useUsersStore()

  /* LOAD USERS FROM BACKEND */
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  /* MODAL STATE */
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  /* SELECTED USER STATE */
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [inviteUser, setInviteUser] = useState<User | null>(null)
  // Password shown in the invitation preview.
  const [invitePassword, setInvitePassword] = useState<string>("")
  // Passwords are kept only in component memory (the backend never returns them),
  // so an invitation opened for a newly created user can display and copy it.
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({})

  /* COPY STATE */
  const [copiedField, setCopiedField] = useState<string | null>(null)

  /* SEARCH */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [passwordUser, setPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  /* ADD USER FORM */
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    control: controlAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isAdding },
  } = useForm<AddUserFormInput>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "Author",
    },
  })

  const [userToDelete, setUserToDelete] = useState<
    (typeof users)[number] | null
  >(null)

  const openDeleteModal = (user: (typeof users)[number]) => {
    setUserToDelete(user)
  }

  /* ADD USER */
  const onAddSubmit = async (data: AddUserFormInput) => {
    try {
      // Store creates the user on the backend, then refetches the list.
      await addUser({
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      })
    } catch {
      // Store already sets `error`; keep the dialog open so the user can retry.
      return
    }

    setIsAddOpen(false)
    resetAdd()
    setShowAddPassword(false)

    // List was refreshed by the store, so the new user can be looked up directly.
    const newlyAdded = useUsersStore
      .getState()
      .users.find((user) => user.email === data.email)

    if (newlyAdded) {
      setUserPasswords((current) => ({
        ...current,
        [newlyAdded.id]: data.password,
      }))
      setInvitePassword(data.password)
      setInviteUser(newlyAdded)
      setCopiedField(null)
      setIsInviteOpen(true)
    }
  }

  /* OPEN VIEW MODAL */
  const openViewModal = (user: User) => {
    setSelectedUser(user)
    setIsViewOpen(true)
  }

  /* SEARCH + ROLE FILTER */
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase()

    const fullName = String(user.fullName ?? "")
    const email = String(user.email ?? "")
    const role = String(user.role ?? "")
    const status = String(user.status ?? "Active")

    const matchesSearch =
      fullName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)

    const matchesRole =
      roleFilter === "All" || role.toLowerCase() === roleFilter.toLowerCase()

    return matchesSearch && matchesRole
  })

  /* EXPORT TO EXCEL */
  const handleExportToExcel = () => {
    const dataToExport = filteredUsers.map((user) => ({
      "Full Name": user.fullName,
      "Email Address": user.email,
      Role: user.role,
      Status: user.status || "Active",
      "Created Date": user.createdDate,
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users")
    XLSX.writeFile(workbook, "system_users_directory.xlsx")
  }

  /* COPY HELPER */
  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (copyError) {
      console.error("Failed to copy value:", copyError)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordUser) return

    setPasswordError("")

    // Password validation
    if (newPassword.length < 8) {
      setPasswordError("Password must contain at least 8 characters.")
      return
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setPasswordError("Password must not exceed 72 bytes.")
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter.")
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one lowercase letter.")
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one number.")
      return
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one special character.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    setIsChangingPassword(true)

    try {
      await changeUserPassword(passwordUser.id, newPassword)

      setIsPasswordOpen(false)
      setPasswordUser(null)
      setNewPassword("")
      setConfirmPassword("")
      setShowNewPassword(false)
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string
            detail?: string
          }
        }
        message?: string
      }

      setPasswordError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to change password."
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  /* DELETE USER */
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setDeleteError("")
    setIsDeleting(true)

    try {
      await deleteUser(userToDelete.id)

      // Close modal after successful deletion
      setUserToDelete(null)
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string
            detail?: string
          }
        }
        message?: string
      }

      setDeleteError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to delete user. Please try again."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  /* INVITATION CONTENT */
  const invitationText = inviteUser
    ? `Dear ${inviteUser.fullName},

You have been provisioned as a ${inviteUser.role} on our clinical platform.

Secure Portal Link: ${window.location.origin}

Registered Email: ${inviteUser.email}

Password: ${invitePassword}

Assigned Role: ${inviteUser.role}

Please use the credentials above to access the secure portal.`
    : ""

  /* RENDER */
  return (
    <div className="space-y-6" id="users-module-container">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#172033] text-foreground md:text-3xl dark:text-white">
            User Directory
          </h1>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-[11px]"
              onClick={() => {
                clearError()
                fetchUsers()
              }}
            >
              Retry
            </Button>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="text-destructive hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* SEARCH / FILTER / ACTIONS */}
      <div className="flex w-full flex-col items-center gap-3 md:flex-row">
        {/* Search */}
        <div className="relative w-full flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            type="text"
            placeholder="Search by name or email..."
            className="h-10 rounded-xl border-secondary bg-card pl-10 text-xs focus-visible:ring-primary/20 sm:text-sm"
            id="system-users-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-secondary-foreground"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters + Actions */}
        <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:flex-row md:w-auto">
          {/* Role Filter */}
          <div className="w-full shrink-0 sm:w-44">
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                if (value) setRoleFilter(value)
              }}
            >
              <SelectTrigger className="h-10 rounded-xl border-secondary bg-card text-xs text-foreground focus:ring-primary/20 sm:text-sm">
                <SelectValue placeholder="Filter roles" />
              </SelectTrigger>
              <SelectContent className="border-secondary bg-card">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Author">Author</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export */}
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            disabled={filteredUsers.length === 0}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border-secondary bg-card px-4 text-xs font-bold text-secondary-foreground transition-all hover:bg-muted hover:text-foreground sm:w-auto"
            title="Export to Excel"
            id="export-to-excel-btn"
          >
            <FileSpreadsheet className="h-4 w-4 text-success-600" />
            <span>Export to Excel</span>
          </Button>

          {/* Add User */}
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-button-primary px-4 font-bold text-button-primary-foreground shadow-sm shadow-primary/10 transition-all hover:bg-button-primary-hover hover:shadow-primary/20 sm:w-auto"
            id="add-user-trigger-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* USERS TABLE */}
      <Card className="overflow-hidden rounded-2xl border border-secondary bg-card shadow-sm shadow-muted/50">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[950px] table-auto border-collapse text-left"
            id="users-data-table-node"
          >
            <colgroup>
              <col className="w-[19%]" />
              <col className="w-[25%]" />
              <col className="w-[10%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[7%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-secondary bg-muted/60">
                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Full Name
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Email Address
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Role
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Created Date
                </th>

                <th className="px-3 py-3 text-center text-xs font-bold tracking-wider uppercase">
                  Invitation
                </th>

                <th className="px-3 py-3 text-center text-xs font-bold tracking-wider uppercase">
                  Password
                </th>

                <th className="px-3 py-3 text-center text-xs font-bold tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary bg-card">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-sm font-medium text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
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
                    <td className="px-3 py-2.5 text-xs font-normal break-all text-secondary-foreground">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-3 py-2.5 text-xs font-medium text-foreground">
                      {user.role}
                    </td>

                    {/* Created Date */}
                    <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-muted-foreground">
                      {user.createdDate}
                    </td>

                    {/* Invitation */}
                    <td className="px-2 py-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInviteUser(user)
                          setInvitePassword(userPasswords[user.id] || "")
                          setCopiedField(null)
                          setIsInviteOpen(true)
                        }}
                        className="inline-flex h-7.5 items-center justify-center gap-1.5 rounded-full border border-primary/25 bg-[#F0F4F8] px-3 text-[11px] font-semibold whitespace-nowrap text-primary shadow-none transition-colors hover:bg-primary/10"
                        title="Prepare email invitation"
                        id={`invite-action-btn-${user.id}`}
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>Invite</span>
                      </Button>
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPasswordUser(user)
                          setNewPassword("")
                          setConfirmPassword("")
                          setPasswordError("")
                          setIsPasswordOpen(true)
                        }}
                        className="h-7 rounded-full border-secondary px-3 text-[11px]"
                      >
                        Change Password
                      </Button>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => openViewModal(user)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-card text-primary transition-colors hover:bg-muted"
                          title="View user"
                          aria-label={`View ${user.fullName}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(user)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-card text-destructive transition-colors hover:bg-destructive/10"
                          title="Delete user"
                          aria-label={`Delete ${user.fullName}`}
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
                    colSpan={7}
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

      {/* ADD USER MODAL */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (isAdding) return
          setIsAddOpen(open)
          if (!open) {
            resetAdd()
            setShowAddPassword(false)
            clearError()
          }
        }}
      >
        <DialogContent className={dialogClass}>
          <DialogHeader className="border-b border-muted pb-3">
            <DialogTitle className="text-lg font-extrabold text-foreground">
              Provision User Account
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleAddSubmit(onAddSubmit)}
            className="space-y-4 pt-3"
          >
            {/* Backend error (e.g. duplicate email) */}
            {error && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="add-fullName">Full Name</Label>
              <Input
                id="add-fullName"
                type="text"
                placeholder="e.g. Dr. Arthur S. Vance"
                {...registerAdd("fullName")}
              />
              {errorsAdd.fullName && (
                <p className="flex items-center gap-1 text-11px text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errorsAdd.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="add-email">Email Address</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="a.vance@example.com"
                {...registerAdd("email")}
              />
              {errorsAdd.email && (
                <p className="flex items-center gap-1 text-11px text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errorsAdd.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="add-password">Password</Label>
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
                  onClick={() => setShowAddPassword((value) => !value)}
                  aria-label={
                    showAddPassword ? "Hide password" : "Show password"
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-secondary-foreground"
                >
                  {showAddPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errorsAdd.password && (
                <p className="flex items-center gap-1 text-11px text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errorsAdd.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label>Role</Label>
              <Controller
                name="role"
                control={controlAdd}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Author">Author</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errorsAdd.role && (
                <p className="flex items-center gap-1 text-11px text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errorsAdd.role.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-2 border-t border-muted pt-3">
              <Button
                type="button"
                variant="outline"
                disabled={isAdding}
                onClick={() => {
                  setIsAddOpen(false)
                  resetAdd()
                  setShowAddPassword(false)
                  clearError()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="gap-2 bg-button-primary text-button-primary-foreground hover:bg-button-primary-hover"
              >
                {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAdding ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW USER MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className={dialogClass}>
          <DialogHeader className="border-b border-muted pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-secondary-foreground">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <DialogTitle className="truncate text-base font-extrabold text-foreground">
                  {selectedUser?.fullName}
                </DialogTitle>
                <span className="font-mono text-10px font-semibold text-muted-foreground">
                  USER ACCOUNT {selectedUser?.id}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-4 text-xs">
            <div className="flex items-center justify-between border-b border-muted pb-2">
              <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </span>
              <span className="font-medium text-foreground">
                {selectedUser?.email}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-muted pb-2">
              <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                Role
              </span>
              <span className="inline-flex items-center rounded bg-primary/15 px-2 py-0.5 text-10px font-bold text-primary">
                {selectedUser?.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Created Date
              </span>
              <span className="font-mono text-foreground">
                {selectedUser?.createdDate}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-muted pt-3">
            <Button
              onClick={() => {
                setIsViewOpen(false)
                setSelectedUser(null)
              }}
              className="h-9 rounded-xl bg-muted text-foreground hover:bg-secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVITATION MODAL */}
      <Dialog
        open={isInviteOpen}
        onOpenChange={(open) => {
          setIsInviteOpen(open)
          if (!open) {
            setInviteUser(null)
            setInvitePassword("")
            setCopiedField(null)
          }
        }}
      >
        <DialogContent className="rounded-xl border border-secondary bg-card p-5 text-foreground shadow-xl sm:max-w-110">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <div className="rounded bg-primary/10 p-1 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <span>Send Invitation</span>
            </DialogTitle>
          </DialogHeader>

          {inviteUser && (
            <div className="space-y-4">
              {/* Email Preview */}
              <div className="overflow-hidden rounded-lg border border-secondary bg-card text-xs shadow-sm">
                {/* Invitation Header */}
                <div className="space-y-1.5 border-b border-muted bg-muted/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-medium text-muted-foreground">
                      To:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="truncate font-semibold text-foreground">
                        {inviteUser.fullName}
                      </span>
                      <span className="truncate font-mono text-muted-foreground">
                        {inviteUser.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-12 font-medium text-muted-foreground">
                      Role:
                    </span>
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-10px font-bold text-primary uppercase">
                      {inviteUser.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-12 font-medium text-muted-foreground">
                      Subject:
                    </span>
                    <span className="truncate font-semibold text-secondary-foreground">
                      Invitation to Workspace
                    </span>
                  </div>
                </div>

                {/* Invitation Body */}
                <div className="space-y-3 bg-card p-4 leading-relaxed text-secondary-foreground">
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
                    on our platform. Please use the secure portal link below to
                    complete account activation and password setup.
                  </p>

                  {/* Secure Invitation Details */}
                  <div className="space-y-2 rounded-lg border border-muted bg-muted/50 p-3 text-11px">
                    {/* Portal Link */}
                    <div className="flex items-center justify-between gap-3 border-b border-muted pb-1.5">
                      <div className="min-w-0 overflow-hidden">
                        <span className="block text-9px font-medium text-muted-foreground uppercase">
                          Secure Portal Link
                        </span>
                        <span
                          className="block truncate font-mono text-primary"
                          title={window.location.origin}
                        >
                          {window.location.origin}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          handleCopy(window.location.origin, "link")
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
                    <div className="flex items-center justify-between gap-3 border-b border-muted pb-1.5">
                      <div className="min-w-0 overflow-hidden">
                        <span className="block text-9px font-medium text-muted-foreground uppercase">
                          Registered Email
                        </span>
                        <span
                          className="block truncate font-mono text-secondary-foreground"
                          title={inviteUser.email}
                        >
                          {inviteUser.email}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleCopy(inviteUser.email, "email")}
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
                    <div className="flex items-center justify-between gap-3 border-b border-muted pb-1.5">
                      <div className="min-w-0 overflow-hidden">
                        <span className="block text-9px font-medium text-muted-foreground uppercase">
                          Password
                        </span>
                        <span
                          className={`block truncate font-mono ${
                            invitePassword
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
                            handleCopy(invitePassword, "password")
                          }
                        }}
                        size="icon"
                        variant="ghost"
                        className={`h-6 w-6 ${
                          !invitePassword ? "cursor-not-allowed opacity-40" : ""
                        }`}
                        disabled={!invitePassword}
                        title={
                          invitePassword
                            ? "Copy password"
                            : "Password not available"
                        }
                      >
                        {copiedField === "password" ? (
                          <Check className="h-3.5 w-3.5 text-success-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Role */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 overflow-hidden">
                        <span className="block text-9px font-medium text-muted-foreground uppercase">
                          Role Type
                        </span>
                        <span className="block font-semibold text-secondary-foreground">
                          {inviteUser.role}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleCopy(inviteUser.role, "role")}
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

                  <p className="text-[10.5px] leading-normal text-muted-foreground">
                    Copy the password above and share these credentials with the
                    user through a secure channel.
                  </p>
                </div>
              </div>

              {/* Invitation Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => handleCopy(invitationText, "full-invite")}
                  variant="outline"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border-secondary px-3 text-xs font-semibold text-secondary-foreground"
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

                <Button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(
                      "Invitation to join Clinical Workspace"
                    )
                    const body = encodeURIComponent(invitationText)
                    window.location.href =
                      `mailto:${inviteUser.email}` +
                      `?subject=${subject}` +
                      `&body=${body}`
                  }}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-button-primary px-3 text-xs font-bold text-button-primary-foreground hover:bg-button-primary-hover"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Email</span>
                </Button>
              </div>

              {/* Close */}
              <div className="flex justify-end border-t border-muted pt-1">
                <Button
                  type="button"
                  onClick={() => {
                    setIsInviteOpen(false)
                    setInvitePassword("")
                    setInviteUser(null)
                    setCopiedField(null)
                  }}
                  variant="ghost"
                  className="h-8 rounded-lg px-4 text-muted-foreground"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPasswordOpen}
        onOpenChange={(open) => {
          if (isChangingPassword) return

          setIsPasswordOpen(open)

          if (!open) {
            setPasswordUser(null)
            setNewPassword("")
            setConfirmPassword("")
            setPasswordError("")
            setShowNewPassword(false)
          }
        }}
      >
        <DialogContent className={dialogClass}>
          <DialogHeader className="border-b border-muted pb-3">
            <DialogTitle className="text-lg font-extrabold">
              Change User Password
            </DialogTitle>
          </DialogHeader>

          {passwordUser && (
            <div className="space-y-4 pt-3">
              <div className="rounded-lg bg-muted p-3 text-xs">
                <p className="font-semibold">{passwordUser.fullName}</p>
                <p className="text-muted-foreground">{passwordUser.email}</p>
              </div>

              <div className="space-y-1">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <p className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {passwordError}
                </p>
              )}

              <DialogFooter className="border-t border-muted pt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPasswordOpen(false)
                    setPasswordUser(null)
                    setNewPassword("")
                    setConfirmPassword("")
                    setPasswordError("")
                    setShowNewPassword(false)
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="gap-2 bg-button-primary text-button-primary-foreground"
                >
                  {isChangingPassword && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE USER MODAL */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (isDeleting) return

          if (!open) {
            setUserToDelete(null)
            setDeleteError("")
          }
        }}
      >
        <DialogContent className={dialogClass}>
          <DialogHeader className="border-b border-muted pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-foreground">
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              Delete User
            </DialogTitle>
          </DialogHeader>

          {userToDelete && (
            <div className="space-y-4 pt-3">
              <p className="text-sm text-secondary-foreground">
                Are you sure you want to permanently delete this user account?
                This action cannot be undone.
              </p>

              <div className="rounded-lg border border-secondary bg-muted/50 p-3">
                <p className="text-sm font-semibold text-foreground">
                  {userToDelete.fullName}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {userToDelete.email}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-primary/15 px-2 py-0.5 text-10px font-bold text-primary">
                    {userToDelete.role}
                  </span>

                  <span className="font-mono text-10px text-muted-foreground">
                    ID: {userToDelete.id}
                  </span>
                </div>
              </div>

              {/* DELETE ERROR */}
              {deleteError && (
                <p className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {deleteError}
                </p>
              )}

              <DialogFooter className="border-t border-muted pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => {
                    setUserToDelete(null)
                    setDeleteError("")
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteUser}
                  className="text-destructive-foreground gap-2 bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
