"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function EmployeeSelect({
  employees,
  value,
  onSelect,
  onChange,
}: {
  employees: { id: string; first_name: string; last_name: string }[];
  value: { id: string; name: string } | null;
  onSelect: (val: { id: string; name: string } | null) => void;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {value ? value.name : "Search employee..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search employee..."
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>
            {employees.map((emp) => {
              const name = emp.first_name + " " + emp.last_name;
              return (
                <CommandItem
                  key={emp.id}
                  value={name}
                  onSelect={() => {
                    onSelect({ id: emp.id, name });
                    setOpen(false); // close dropdown
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === emp.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {name}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
