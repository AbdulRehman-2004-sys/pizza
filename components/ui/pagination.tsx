import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  canPreviousPage,
  canNextPage,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
      <div>
        Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
        <span className="font-bold text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
