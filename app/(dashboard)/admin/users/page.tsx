"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserModal } from "@/components/users/user-modal";
import { ResetPasswordModal } from "@/components/users/reset-password-modal";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserCheck,
  UserX,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@prisma/client";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();

  // State
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setUsers(json.data.users);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      } else {
        toast.error(json.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Network error loading users");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchUsers();
    }
  }, [fetchUsers, currentUser]);

  const handleCreateNew = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleResetPassword = (user: any) => {
    setUserToResetPassword(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = !user.isActive;
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update user status");
      }

      toast.success(`User ${newStatus ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleDeletePrompt = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete user");
      }

      toast.success(json.message || "User account updated");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // RBAC check
  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-3">
        <div className="rounded-full bg-rose-50 p-4 text-rose-600">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md">
          User & staff account management is restricted to Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">User & Staff Management</h1>
            <p className="text-xs text-slate-500">
              Manage POS staff access, assign Admin/Cashier roles, and reset passwords
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNew} leftIcon={<UserPlus className="h-4 w-4" />}>
            Add Staff User
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-pizza-500 focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin Only</option>
              <option value="CASHIER">Cashier Only</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Inactive Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-pizza-400 font-black text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {u.role === Role.ADMIN ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-black text-purple-700 border border-purple-200">
                          <Shield className="h-3 w-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700 border border-blue-200">
                          <Users className="h-3 w-3" />
                          CASHIER
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 border border-emerald-200">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-700 border border-rose-200">
                          <UserX className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 font-semibold">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditUser(u)}
                          title="Edit Profile"
                          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleResetPassword(u)}
                          title="Reset Password"
                          className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            u.isActive
                              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeletePrompt(u)}
                          title="Delete User"
                          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No staff accounts found</p>
            <p className="text-xs text-slate-400">Try clearing filters or add a new staff user.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Showing page {page} of {totalPages} ({total} total staff)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={fetchUsers}
        userToEdit={userToEdit}
      />

      {/* Admin Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        user={userToResetPassword}
      />

      {/* Delete Confirm Modal */}
      {isDeleteModalOpen && userToDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Staff Account?"
          description={`Are you sure you want to remove user "${userToDelete.name}" (${userToDelete.email})? Note: If this account has historical sales, order logs, or payments, it will be deactivated to preserve accounting audit records.`}
          confirmText="Delete Account"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
