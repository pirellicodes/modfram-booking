"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/use-dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  PlusIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  Calendar,
  Mail,
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

const statusOptions = [
  {
    value: "upcoming",
    label: "Upcoming",
    color: "bg-blue-500/10 text-blue-700",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-500/10 text-green-700",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-500/10 text-red-700",
  },
  { value: "no-show", label: "No Show", color: "bg-gray-500/10 text-gray-700" },
];

export function Bookings() {
  const { data: bookings, loading, error } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithClient | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const getBookingStatus = (booking: BookingWithClient) => {
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (endTime < now) return "completed";
    if (startTime > now) return "upcoming";
    return "in-progress";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status) || {
      label: status,
      color: "bg-gray-500/10 text-gray-700",
    };

    return (
      <Badge variant="secondary" className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clients.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.session_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.category &&
        booking.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const bookingStatus = getBookingStatus(booking);
    const matchesStatus =
      statusFilter === "all" || bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (booking: BookingWithClient) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleCancelBooking = (booking: BookingWithClient) => {
    // TODO: Implement cancel functionality with Supabase
    console.log("Cancelling booking:", booking.id);
  };

  const handleRescheduleBooking = (booking: BookingWithClient) => {
    // TODO: Implement reschedule functionality
    console.log("Rescheduling booking:", booking.id);
  };

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    return {
      date: format(date, "MMM d, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">
              Manage all your appointments and sessions
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">
              Manage all your appointments and sessions
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <CalendarIcon className="h-6 w-6" />
            Bookings
          </h2>
          <p className="text-muted-foreground">
            Manage all your appointments and sessions
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <FilterIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            {filteredBookings.length} booking
            {filteredBookings.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No bookings found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first booking."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const { date, time } = formatDateTime(booking.start_time);
                  const status = getBookingStatus(booking);

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {booking.clients.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">
                              {booking.clients.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.clients.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.session_type}
                          </div>
                          {booking.category && (
                            <div className="text-sm text-muted-foreground">
                              {booking.category}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{date}</div>
                          <div className="text-sm text-muted-foreground">
                            {time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          {formatDuration(booking.start_time, booking.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(booking)}
                            >
                              <UserIcon className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {status === "upcoming" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRescheduleBooking(booking)
                                  }
                                >
                                  <EditIcon className="mr-2 h-4 w-4" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancelBooking(booking)}
                                  className="text-destructive"
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking session.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedBooking.clients.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {selectedBooking.clients.name}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedBooking.clients.email}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Session Type
                  </label>
                  <div>{selectedBooking.session_type}</div>
                </div>

                {selectedBooking.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <div>{selectedBooking.category}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(selectedBooking.start_time).date} at{" "}
                    {formatDateTime(selectedBooking.start_time).time}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    {formatDuration(
                      selectedBooking.start_time,
                      selectedBooking.end_time
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(getBookingStatus(selectedBooking))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Booked
                  </label>
                  <div>
                    {formatDistanceToNow(new Date(selectedBooking.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
