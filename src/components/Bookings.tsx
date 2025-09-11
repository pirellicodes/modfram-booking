"use client";

import { useState, useMemo } from "react";
import { useBookings, Booking } from "@/hooks/use-bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  FilterIcon,
  MoreHorizontalIcon,
  EyeIcon,
  XCircleIcon,
  RefreshCwIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  SearchIcon,
  Plus,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, isToday, isTomorrow } from "date-fns";

export function Bookings() {
  const { data: bookings, loading, error, refetch } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getBookingStatus = (booking: Booking) => {
    const now = new Date();
    const startTime = parseISO(booking.start_time);
    const endTime = parseISO(booking.end_time);

    if (isAfter(startTime, now)) return "upcoming";
    if (isBefore(endTime, now)) return "completed";
    return "in-progress";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <ClockIcon className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            <RefreshCwIcon className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((booking) => {
        const status = getBookingStatus(booking);
        if (activeTab === "upcoming") return status === "upcoming";
        if (activeTab === "completed") return status === "completed";
        if (activeTab === "today") return isToday(parseISO(booking.start_time));
        if (activeTab === "tomorrow") return isTomorrow(parseISO(booking.start_time));
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((booking) =>
        booking.session_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }, [bookings, activeTab, searchQuery]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        date: format(date, "MMM d, yyyy"),
        time: format(date, "h:mm a"),
        dayOfWeek: format(date, "EEEE"),
        fullDateTime: format(date, "EEEE, MMM d, yyyy 'at' h:mm a"),
      };
    } catch {
      return {
        date: "Invalid Date",
        time: "Invalid Time",
        dayOfWeek: "Invalid Day",
        fullDateTime: "Invalid DateTime",
      };
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));

      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return "Unknown";
    }
  };

  const getClientInitials = (clientName?: string) => {
    if (!clientName) return "?";
    return clientName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your photography session bookings.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your photography session bookings.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <XCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Error loading bookings</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={refetch} className="mt-4" variant="outline">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all your photography session bookings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({bookings.filter(b => getBookingStatus(b) === "upcoming").length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Today ({bookings.filter(b => isToday(parseISO(b.start_time))).length})
          </TabsTrigger>
          <TabsTrigger value="tomorrow">
            Tomorrow ({bookings.filter(b => isTomorrow(parseISO(b.start_time))).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({bookings.filter(b => getBookingStatus(b) === "completed").length})
          </TabsTrigger>
        </TabsList>

        {/* All Tabs Content */}
        {["all", "upcoming", "today", "tomorrow", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No bookings match your search" : `No ${tab === "all" ? "" : tab} bookings found`}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Session Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const status = getBookingStatus(booking);
                      const startDateTime = formatDateTime(booking.start_time);
                      const duration = formatDuration(booking.start_time, booking.end_time);

                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getClientInitials(booking.client?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {booking.client?.name || "Unknown Client"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.client?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.session_type}</div>
                              {booking.category && (
                                <div className="text-sm text-muted-foreground">
                                  {booking.category}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{startDateTime.date}</div>
                              <div className="text-sm text-muted-foreground">
                                {startDateTime.time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{duration}</div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircleIcon className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Details Dialog */}
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
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {getClientInitials(selectedBooking.client?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedBooking.client?.name || "Unknown Client"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.client?.email || "No email"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Session Type</label>
                  <p className="mt-1">{selectedBooking.session_type}</p>
                </div>
                {selectedBooking.category && (
                  <div>
                    <label className="font-medium text-muted-foreground">Category</label>
                    <p className="mt-1">{selectedBooking.category}</p>
                  </div>
                )}
                <div>
                  <label className="font-medium text-muted-foreground">Date</label>
                  <p className="mt-1">{formatDateTime(selectedBooking.start_time).date}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Time</label>
                  <p className="mt-1">
                    {formatDateTime(selectedBooking.start_time).time} - {formatDateTime(selectedBooking.end_time).time}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Duration</label>
                  <p className="mt-1">{formatDuration(selectedBooking.start_time, selectedBooking.end_time)}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <p className="mt-1">{getStatusBadge(getBookingStatus(selectedBooking))}</p>
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Booking ID</label>
                <p className="mt-1 font-mono text-sm">{selectedBooking.id}</p>
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Created</label>
                <p className="mt-1 text-sm">{formatDateTime(selectedBooking.created_at).fullDateTime}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
