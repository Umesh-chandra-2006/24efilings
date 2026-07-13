import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { Column } from "@tanstack/react-table"

import { cn } from "../../lib/utils"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import {
  Popover,
} from "../ui/Popover"
import { Separator } from "../ui/separator"
import { Checkbox } from "../ui/checkbox"

interface DataTableFacetedFilterProps<TData, TValue> {
  key?: React.Key | null
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const [search, setSearch] = React.useState("")
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (value: string) => {
     const newSelectedValues = new Set(selectedValues)
     if (newSelectedValues.has(value)) {
       newSelectedValues.delete(value)
     } else {
       newSelectedValues.add(value)
     }
     const filterValues = Array.from(newSelectedValues)
     column?.setFilterValue(
       filterValues.length ? filterValues : undefined
     )
  }

  const handleClear = () => {
      column?.setFilterValue(undefined)
  }

  const Content = (
    <div className="w-[200px] p-2">
       <input 
          type="text" 
          placeholder={title}
          className="w-full mb-2 px-2 py-1 text-sm border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
       />
       <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filteredOptions.length === 0 && <p className="text-xs text-center p-2 text-muted-foreground">No results found.</p>}
          {filteredOptions.map((option) => {
            const isSelected = selectedValues.has(option.value)
            return (
              <div 
                key={option.value} 
                className="flex items-center space-x-2 p-1 rounded hover:bg-slate-100 cursor-pointer text-slate-900"
                onClick={() => handleSelect(option.value)}
              >
                <div
                    className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                    >
                    <Check className={cn("h-4 w-4 text-white")} />
                </div>
                {option.icon && (
                  <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm flex-1 text-slate-900">{option.label}</span>
                {facets?.get(option.value) && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                    {facets.get(option.value)}
                  </span>
                )}
              </div>
            )
          })}
       </div>
       {selectedValues.size > 0 && (
        <>
          <Separator className="my-2" />
          <div className="flex justify-center">
            <button
                onClick={handleClear}
                className="text-xs text-primary hover:underline"
            >
                Clear filters
            </button>
          </div>
        </>
       )}
    </div>
  )

  return (
    <Popover
        trigger={
            <Button variant="outline" size="sm" className="h-8 border-dashed">
                <PlusCircle className="mr-2 h-4 w-4" />
                {title}
                {selectedValues?.size > 0 && (
                <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                    >
                    {selectedValues.size}
                    </Badge>
                    <div className="hidden space-x-1 lg:flex">
                    {selectedValues.size > 2 ? (
                        <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                        >
                        {selectedValues.size} selected
                        </Badge>
                    ) : (
                        options
                        .filter((option) => selectedValues.has(option.value))
                        .map((option) => (
                            <Badge
                            variant="secondary"
                            key={option.value}
                            className="rounded-sm px-1 font-normal"
                            >
                            {option.label}
                            </Badge>
                        ))
                    )}
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
