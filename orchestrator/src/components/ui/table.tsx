import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ class名称, ...props }, ref) => (
  <div class名称="w-full overflow-auto">
    <table
      ref={ref}
      class名称={cn("w-full caption-bottom text-sm", class名称)}
      {...props}
    />
  </div>
));
Table.display名称 = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ class名称, ...props }, ref) => (
  <thead ref={ref} class名称={cn("[&_tr]:border-b", class名称)} {...props} />
));
TableHeader.display名称 = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ class名称, ...props }, ref) => (
  <tbody
    ref={ref}
    class名称={cn("[&_tr:last-child]:border-0", class名称)}
    {...props}
  />
));
TableBody.display名称 = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ class名称, ...props }, ref) => (
  <tfoot
    ref={ref}
    class名称={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      class名称,
    )}
    {...props}
  />
));
TableFooter.display名称 = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ class名称, ...props }, ref) => (
  <tr
    ref={ref}
    class名称={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      class名称,
    )}
    {...props}
  />
));
TableRow.display名称 = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ class名称, ...props }, ref) => (
  <th
    ref={ref}
    class名称={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      class名称,
    )}
    {...props}
  />
));
TableHead.display名称 = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ class名称, ...props }, ref) => (
  <td
    ref={ref}
    class名称={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      class名称,
    )}
    {...props}
  />
));
TableCell.display名称 = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ class名称, ...props }, ref) => (
  <caption
    ref={ref}
    class名称={cn("mt-4 text-sm text-muted-foreground", class名称)}
    {...props}
  />
));
TableCaption.display名称 = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
