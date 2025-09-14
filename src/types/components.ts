// Component prop types and UI-specific interfaces

import type { ReactNode } from "react";

import type { EventTypeWithParsedFields } from "@/types/event-types";

// Define missing types locally since they're UI-specific
export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
};

export type CalendarSlotInfo = {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
};

export type ChartDataPoint = {
  name: string;
  value: number;
  [key: string]: unknown;
};

export type Booking = {
  id: string;
  status: "confirmed" | "pending" | "cancelled";
  [key: string]: unknown;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
};

export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  [key: string]: unknown;
};

export type BookingFilters = {
  status?: string;
  dateRange?: { start: Date; end: Date };
  [key: string]: unknown;
};

export type ClientFilters = {
  search?: string;
  [key: string]: unknown;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};
// Form component types (define locally since they're UI-specific)
export type SelectOption = {
  label: string;
  value: string;
};

export type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
};

export type DateFieldProps = FormFieldProps & {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
};

export type TimeFieldProps = FormFieldProps & {
  value?: string;
  onChange: (time: string) => void;
};

// Layout and navigation types
export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Calendar component types
export interface CalendarProps {
  events: CalendarEvent[];
  view?: "month" | "week" | "day" | "agenda";
  date?: Date;
  onNavigate?: (date: Date) => void;
  onView?: (view: string) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: CalendarSlotInfo) => void;
  onDoubleClickEvent?: (event: CalendarEvent) => void;
  selectable?: boolean;
  resizable?: boolean;
  className?: string;
  height?: number | string;
}

export interface EventCalendarProps extends CalendarProps {
  eventTypes?: EventTypeWithParsedFields[];
  availability?: Array<{
    weekday: number;
    slots: Array<{ start: string; end: string }>;
  }>;
  onCreateEvent?: (eventData: Partial<Event>) => void;
  onUpdateEvent?: (eventId: string, eventData: Partial<Event>) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export interface DatePickerProps extends Omit<DateFieldProps, "name"> {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (
    date: Date | Date[] | { from?: Date; to?: Date } | undefined
  ) => void;
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  numberOfMonths?: number;
  className?: string;
}

// Chart component types
export interface BaseChartProps {
  data: ChartDataPoint[];
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
}

export interface LineChartProps extends BaseChartProps {
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  orientation?: "horizontal" | "vertical";
}

export interface PieChartProps extends BaseChartProps {
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export interface RecentPaymentsChartProps {
  data: Array<{
    date: string;
    amount_cents: number;
    booking_count: number;
  }>;
  period?: "day" | "week" | "month";
  className?: string;
}

// Table and data display types
export interface Column<TData = Record<string, unknown>> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof TData;
  cell?: (data: TData) => ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<TData = Record<string, unknown>> {
  data: TData[];
  columns: Column<TData>[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  selectable?: boolean;
  selectedRows?: string[];
  onRowSelect?: (selectedRows: string[]) => void;
  actions?: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: (row: TData) => void;
    disabled?: (row: TData) => boolean;
  }>;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

// Form component types
export interface FormProps<TData = Record<string, unknown>> {
  data?: TData;
  onSubmit: (data: TData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Client) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface BookingFormProps {
  booking?: Booking;
  clients?: Client[];
  eventTypes?: EventTypeWithParsedFields[];
  onSubmit: (data: Booking) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface EventTypeFormProps {
  eventType?: EventTypeWithParsedFields;
  onSubmit: (data: EventTypeWithParsedFields) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

// Dialog and modal types
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  children: ReactNode;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export interface CreateEditDialogProps<TData = Record<string, unknown>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: TData;
  onSave: (data: TData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  title: string;
  children: ReactNode;
}

// Filter and search component types
export interface FilterProps<TFilters = Record<string, unknown>> {
  filters: TFilters;
  onFiltersChange: (filters: TFilters) => void;
  onReset: () => void;
  className?: string;
}

export interface BookingFiltersProps extends FilterProps<BookingFilters> {
  clients?: Client[];
  statuses?: Array<{ label: string; value: Booking["status"] }>;
}

export type ClientFiltersProps = FilterProps<ClientFilters>;

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  results?: Array<{
    id: string;
    label: string;
    description?: string;
    data: Client | Event | Booking;
  }>;
  onResultSelect?: (result: {
    id: string;
    label: string;
    description?: string;
    data: Client | Event | Booking;
  }) => void;
  className?: string;
}

// Status and badge types
export interface StatusBadgeProps {
  status: Booking["status"] | "active" | "inactive" | string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period: string;
  };
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

// Action types for buttons and menus
export interface ActionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

export interface ActionMenuProps {
  items: ActionItem[];
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export interface ButtonGroupProps {
  items: Array<{
    id: string;
    label: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }>;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Loading and error states
export interface LoadingStateProps {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  children?: ReactNode;
  className?: string;
}

export interface ErrorStateProps {
  error: string;
  retry?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

// Notification and toast types
export interface NotificationProps {
  id?: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Export utility type for component refs
export type ComponentRef<T extends React.ElementType> = React.ComponentRef<T>;
