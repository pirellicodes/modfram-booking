"use client";

import { useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Page() {
  const [open, setOpen] = useState(true);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Go">
          <CommandItem onSelect={() => setOpen(false)}>Dashboard</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
