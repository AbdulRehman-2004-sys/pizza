"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { TableFormModal, TableItem } from "@/components/tables/table-form-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid2X2, Plus, Edit2, Trash2, Users, CheckCircle2, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";

export default function TablesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tables, setTables] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tables");
      const json = await res.json();
      if (res.ok && json.success) {
        setTables(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to load dining tables");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleDelete = async () => {
    if (!deletingTableId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tables/${deletingTableId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete table");
        return;
      }

      toast.success("Table deleted successfully!");
      setDeletingTableId(null);
      fetchTables();
    } catch (error) {
      console.error("Delete table error:", error);
      toast.error("Network error deleting table");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.tableNumber.toString().includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || table.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length;
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const reservedCount = tables.filter((t) => t.status === "RESERVED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-500">
            <Grid2X2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Table & Seating Management</h1>
            <p className="text-xs text-slate-500">Overview of dining floor tables and capacity</p>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setEditingTable(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Dining Table
          </Button>
        )}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Tables</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{tables.length}</p>
          </div>
          <div className="rounded-xl p-2 bg-slate-100 text-slate-700">
            <Grid2X2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase">Available</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{availableCount}</p>
          </div>
          <div className="rounded-xl p-2 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-amber-100 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-bold uppercase">Occupied</p>
            <p className="text-xl font-black text-amber-700 mt-0.5">{occupiedCount}</p>
          </div>
          <div className="rounded-xl p-2 bg-amber-50 text-amber-600">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-blue-100 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase">Reserved</p>
            <p className="text-xl font-black text-blue-700 mt-0.5">{reservedCount}</p>
          </div>
          <div className="rounded-xl p-2 bg-blue-50 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "AVAILABLE", "OCCUPIED", "RESERVED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? "bg-pizza-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search table # or name..."
          />
        </div>
      </div>

      {/* Table Layout Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="rounded-2xl bg-white p-5 border border-slate-200 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-slate-900 text-base font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    Table #{table.tableNumber}
                  </span>
                  <Badge
                    variant={
                      table.status === "AVAILABLE"
                        ? "success"
                        : table.status === "OCCUPIED"
                        ? "warning"
                        : "info"
                    }
                  >
                    {table.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{table.tableName}</h3>
                {table.notes && <p className="text-xs text-slate-500 mt-1">{table.notes}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{table.capacity} Seats</span>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTable(table);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Table"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTableId(table.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No dining tables found"
          description="Try adjusting your filter or search query."
          icon={Grid2X2}
        />
      )}

      {/* Table Modal Form */}
      <TableFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTables}
        initialData={editingTable}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingTableId}
        onClose={() => setDeletingTableId(null)}
        onConfirm={handleDelete}
        title="Delete Dining Table"
        description="Are you sure you want to delete this table? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
