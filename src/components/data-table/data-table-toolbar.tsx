import React from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableDateRangeFilter } from "./data-table-date-range-filter"

export interface FilterConfig {
    columnKey: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  filters?: FilterConfig[]
  dateFilterColumnKey?: string
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filters,
  dateFilterColumnKey
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchKey && (
            <Input
            placeholder="Search..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
            />
        )}
        
        {filters?.map(filter => {
            const column = table.getColumn(filter.columnKey)
            if (!column) return null
            return (
                <DataTableFacetedFilter
                    key={filter.columnKey}
                    column={column}
                    title={filter.title}
                    options={filter.options}
                />
            )
        })}

        {dateFilterColumnKey && table.getColumn(dateFilterColumnKey) && (
            <DataTableDateRangeFilter
                column={table.getColumn(dateFilterColumnKey)}
                title="Date Range"
            />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
