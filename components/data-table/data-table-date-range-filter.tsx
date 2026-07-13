import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { Column } from "@tanstack/react-table"

import { Button } from "../ui/Button"
import { Popover } from "../ui/Popover"
import { Calendar } from "../ui/Calendar"
import { cn } from "../../lib/utils"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/Badge"

interface DataTableDateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title,
}: DataTableDateRangeFilterProps<TData, TValue>) {
    const filterValue = column?.getFilterValue() as { from: string; to: string } | undefined
    const [dateRange, setDateRange] = React.useState<{ from: string; to: string }>(
        filterValue || { from: "", to: "" }
    )

    // Sync local state with column filter
    React.useEffect(() => {
        if (filterValue) {
            setDateRange(filterValue)
        } else {
            setDateRange({ from: "", to: "" })
        }
    }, [filterValue])

    const handleDateChange = (range: { from: string; to: string }) => {
        setDateRange(range)
        // If both dates are selected, apply filter
        if (range.from && range.to) {
            column?.setFilterValue(range)
        } else if (range.from && !range.to) {
             // Maybe wait for 'to'? Or clear?
             // Usually we wait.
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setDateRange({ from: "", to: "" })
        column?.setFilterValue(undefined)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString()
    }

    const Content = (
        <div className="bg-white">
            <Calendar dateRange={dateRange} onDateChange={handleDateChange} />
             <div className="flex justify-end p-2 border-t">
                 <Button 
                    size="sm" 
                    onClick={() => column?.setFilterValue(dateRange.to ? dateRange : undefined)}
                    disabled={!dateRange.from || !dateRange.to}
                 >
                    Apply
                 </Button>
            </div>
        </div>
    )

    const hasFilter = !!filterValue?.from

    return (
        <Popover
            trigger={
                <Button variant="outline" size="sm" className="h-8 border-dashed group">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {title}
                    {hasFilter && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {formatDate(filterValue.from)} - {formatDate(filterValue.to)}
                            </Badge>
                             <div 
                                className="ml-1 rounded-sm hover:bg-slate-200 p-0.5 cursor-pointer"
                                onClick={handleClear}
                             >
                                <X className="h-3 w-3" />
                             </div>
                        </>
                    )}
                </Button>
            }
            content={Content}
            align="start"
        />
    )
}
