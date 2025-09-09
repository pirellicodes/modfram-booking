"use client";

import { useState } from "react";
import { useAvailability } from "@/hooks/use-dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClockIcon,
  PlusIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

const daysOfWeek = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "AM" : "PM";
  const time12 = `${hour12}:${minute} ${ampm}`;

  return { value: time24, label: time12 };
});

export function Availability() {
  const { data: availability, loading, error } = useAvailability();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  // Group availability by day of week
  const availabilityByDay = daysOfWeek.map((day) => ({
    ...day,
    slots: availability
      .filter((slot) => slot.day_of_week === day.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const handleCreateSlot = () => {
    // TODO: Implement create functionality with Supabase
    console.log("Creating availability slot:", formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditSlot = (slot: {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => {
    setSelectedSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week.toString(),
      start_time: slot.start_time,
      end_time: slot.end_time,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSlot = () => {
    // TODO: Implement update functionality with Supabase
    console.log("Updating availability slot:", selectedSlot.id, formData);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteSlot = (slot: { id: string }) => {
    // TODO: Implement delete functionality with Supabase
    console.log("Deleting availability slot:", slot.id);
  };

  const resetForm = () => {
    setFormData({
      day_of_week: "",
      start_time: "",
      end_time: "",
    });
    setSelectedSlot(null);
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
            <p className="text-muted-foreground">
              Manage your weekly availability schedule
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
            <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
            <p className="text-muted-foreground">
              Manage your weekly availability schedule
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
            <ClockIcon className="h-6 w-6" />
            Availability
          </h2>
          <p className="text-muted-foreground">
            Set your weekly availability for bookings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Slot</DialogTitle>
              <DialogDescription>
                Add a new time slot to your availability schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day" className="text-right">
                  Day
                </Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day_of_week: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_time" className="text-right">
                  Start Time
                </Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, start_time: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_time" className="text-right">
                  End Time
                </Label>
                <Select
                  value={formData.end_time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, end_time: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSlot}>Add Time Slot</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Schedule */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {availabilityByDay.map((day) => (
          <Card key={day.value}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {day.label}
                </span>
                {day.slots.length === 0 ? (
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-700"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Unavailable
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-700"
                  >
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Available
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {day.slots.length} time slot{day.slots.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {day.slots.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No availability set for {day.label.toLowerCase()}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {calculateDuration(slot.start_time, slot.end_time)}
                        </Badge>
                      </div>
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
                            onClick={() => handleEditSlot(slot)}
                          >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteSlot(slot)}
                            className="text-destructive"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
            <DialogDescription>
              Update the details of your availability slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-day" className="text-right">
                Day
              </Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) =>
                  setFormData({ ...formData, day_of_week: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start-time" className="text-right">
                Start Time
              </Label>
              <Select
                value={formData.start_time}
                onValueChange={(value) =>
                  setFormData({ ...formData, start_time: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end-time" className="text-right">
                End Time
              </Label>
              <Select
                value={formData.end_time}
                onValueChange={(value) =>
                  setFormData({ ...formData, end_time: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSlot}>Update Time Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common availability management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Copy from Monday
            </Button>
            <Button variant="outline" size="sm">
              Set Business Hours (9-5)
            </Button>
            <Button variant="outline" size="sm">
              Clear All
            </Button>
            <Button variant="outline" size="sm">
              Import Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
