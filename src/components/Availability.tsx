"use client";

import {
  Calendar,
  ChevronLeft,
  Copy,
  Globe,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAvailability } from "@/hooks/use-dashboard-data";

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "AM" : "PM";
  const time12 = `${hour12}:${minute} ${ampm}`;
  return { value: time24, label: time12 };
});

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

type ApiAvailabilitySlot = {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
};

export function Availability() {
  const { data: availabilityData, loading, error } = useAvailability();
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewScheduleDialogOpen, setIsNewScheduleDialogOpen] = useState(false);
  const [timezone, setTimezone] = useState("America/New_York");
  const [selectedDate, setSelectedDate] = useState("");
  const [scheduleType, setScheduleType] = useState("default");
  const [scheduleLabel, setScheduleLabel] = useState("Working Hours");
  const [newScheduleName, setNewScheduleName] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<number, DaySchedule>
  >({
    0: { enabled: false, slots: [] }, // Sunday
    1: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Monday
    2: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Tuesday
    3: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Wednesday
    4: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Thursday
    5: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Friday
    6: { enabled: false, slots: [] }, // Saturday
  });
  const [overrides, setOverrides] = useState<
    { date: string; available: boolean }[]
  >([]);

  useEffect(() => {
    if (!availabilityData || availabilityData.length === 0) return;

    setWeeklySchedule((prev) => {
      const next: Record<number, DaySchedule> = { ...prev };

      (availabilityData as unknown as ApiAvailabilitySlot[]).forEach((slot) => {
        const day = slot.day_of_week as number;
        const cur = next[day] ?? { enabled: false, slots: [] };

        const exists = cur.slots.some(
          (s) => s.start === slot.start_time && s.end === slot.end_time
        );

        const updated: DaySchedule = {
          enabled: true,
          slots: exists
            ? cur.slots
            : [
                ...cur.slots,
                { start: String(slot.start_time), end: String(slot.end_time) },
              ],
        };

        next[day] = updated;
      });

      return next;
    });
  }, [availabilityData]);

  const toggleDay = (dayOfWeek: number) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      newSchedule[dayOfWeek].enabled = !newSchedule[dayOfWeek].enabled;

      // If enabling a day with no slots, add a default slot
      if (
        newSchedule[dayOfWeek].enabled &&
        newSchedule[dayOfWeek].slots.length === 0
      ) {
        newSchedule[dayOfWeek].slots = [{ start: "09:00", end: "17:00" }];
      }

      return newSchedule;
    });
  };

  const addTimeSlot = (dayOfWeek: number) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      const slots = [...newSchedule[dayOfWeek].slots];

      // Find a good default time slot that doesn't overlap
      let newStart = "09:00";
      let newEnd = "17:00";

      if (slots.length > 0) {
        const lastSlot = slots[slots.length - 1];
        const lastEndHour = parseInt(lastSlot.end.split(":")[0]);
        const lastEndMinute = parseInt(lastSlot.end.split(":")[1]);

        let newStartHour = lastEndHour;
        let newStartMinute = lastEndMinute + 30;

        if (newStartMinute >= 60) {
          newStartHour += 1;
          newStartMinute = 0;
        }

        let newEndHour = newStartHour + 1;

        if (newEndHour >= 24) {
          newEndHour = 23;
          newStartHour = 22;
        }

        newStart = `${String(newStartHour).padStart(2, "0")}:${String(
          newStartMinute
        ).padStart(2, "0")}`;
        newEnd = `${String(newEndHour).padStart(2, "0")}:${String(
          newStartMinute
        ).padStart(2, "0")}`;
      }

      newSchedule[dayOfWeek].slots.push({ start: newStart, end: newEnd });
      return newSchedule;
    });
  };

  const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      newSchedule[dayOfWeek].slots = newSchedule[dayOfWeek].slots.filter(
        (_, index) => index !== slotIndex
      );
      return newSchedule;
    });
  };

  const updateTimeSlot = (
    dayOfWeek: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      newSchedule[dayOfWeek].slots = newSchedule[dayOfWeek].slots.map(
        (slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
      );
      return newSchedule;
    });
  };

  const copyTimeSlots = (fromDay: number) => {
    const daysOfWeek = [
      { value: 0, label: "Sunday" },
      { value: 1, label: "Monday" },
      { value: 2, label: "Tuesday" },
      { value: 3, label: "Wednesday" },
      { value: 4, label: "Thursday" },
      { value: 5, label: "Friday" },
      { value: 6, label: "Saturday" },
    ];

    // Filter out the source day
    const targetDays = daysOfWeek.filter((day) => day.value !== fromDay);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Copy to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {targetDays.map((day) => (
            <DropdownMenuItem
              key={day.value}
              onClick={() => {
                setWeeklySchedule((prev) => {
                  const newSchedule = { ...prev };
                  newSchedule[day.value] = {
                    enabled: true,
                    slots: [...prev[fromDay].slots],
                  };
                  return newSchedule;
                });
                toast.success(`Copied to ${day.label}`);
              }}
            >
              {day.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setWeeklySchedule((prev) => {
                const newSchedule = { ...prev };
                // Copy to all other days
                targetDays.forEach((day) => {
                  newSchedule[day.value] = {
                    enabled: true,
                    slots: [...prev[fromDay].slots],
                  };
                });
                return newSchedule;
              });
              toast.success("Copied to all other days");
            }}
          >
            All other days
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const addOverride = () => {
    if (!selectedDate) return;

    // Check if override already exists
    if (overrides.some((o) => o.date === selectedDate)) {
      toast.error("An override for this date already exists");
      return;
    }

    setOverrides([...overrides, { date: selectedDate, available: false }]);
    setIsOverrideDialogOpen(false);
    setSelectedDate("");
    toast.success("Date override added");
  };

  const removeOverride = (date: string) => {
    setOverrides(overrides.filter((o) => o.date !== date));
    toast.success("Date override removed");
  };

  const saveSchedule = () => {
    // In a real implementation, this would save the schedule to Supabase
    toast.success("Schedule saved successfully");
    setIsEditMode(false);
  };

  const createNewSchedule = () => {
    if (!newScheduleName.trim()) return;

    // Create a new schedule with default Mon-Fri 9-5 hours
    const newSchedule = {
      0: { enabled: false, slots: [] }, // Sunday
      1: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Monday
      2: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Tuesday
      3: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Wednesday
      4: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Thursday
      5: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] }, // Friday
      6: { enabled: false, slots: [] }, // Saturday
    };

    setWeeklySchedule(newSchedule);
    setScheduleLabel(newScheduleName);
    setIsNewScheduleDialogOpen(false);
    setNewScheduleName("");
    setIsEditMode(true); // Enter edit mode to show the new schedule

    toast.success(`New schedule "${newScheduleName}" created successfully`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Loading your availability settings...
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditMode) {
    // Edit schedule view
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-xl font-semibold">{scheduleLabel}</h2>
            <Badge variant="outline">Default</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveSchedule}>Save</Button>
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Days of week */}
              {Object.keys(weeklySchedule).map((dayKey) => {
                const dayOfWeek = parseInt(dayKey);
                const dayNames = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                const dayName = dayNames[dayOfWeek];
                const schedule = weeklySchedule[dayOfWeek];

                return (
                  <div key={dayOfWeek} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => toggleDay(dayOfWeek)}
                        />
                        <div className="w-24 font-medium">{dayName}</div>
                      </div>

                      {schedule.enabled &&
                        schedule.slots.length > 0 &&
                        copyTimeSlots(dayOfWeek)}
                    </div>

                    {schedule.enabled && (
                      <div className="ml-12 space-y-3">
                        {schedule.slots.map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Select
                              value={slot.start}
                              onValueChange={(value) =>
                                updateTimeSlot(dayOfWeek, index, "start", value)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                  >
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <span className="text-muted-foreground">to</span>

                            <Select
                              value={slot.end}
                              onValueChange={(value) =>
                                updateTimeSlot(dayOfWeek, index, "end", value)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                  >
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {schedule.slots.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTimeSlot(dayOfWeek, index)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs ml-0"
                          onClick={() => addTimeSlot(dayOfWeek)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add time range
                        </Button>
                      </div>
                    )}

                    {dayOfWeek < 6 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Timezone</h3>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Date overrides</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            {overrides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-4" />
                <p>No date overrides set</p>
                <p className="text-sm mt-1">
                  Add a date override when your availability changes from your
                  usual hours
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {overrides.map((override) => (
                  <div
                    key={override.date}
                    className="flex items-center justify-between border p-4 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(override.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {override.available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOverride(override.date)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsOverrideDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add an override
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Configure times when you are available for bookings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsNewScheduleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center">
                <Badge className="mr-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-100">
                  Default
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Mon - Fri, 9:00 AM - 5:00 PM
                </span>
              </div>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <Globe className="h-4 w-4 mr-2" />
            <span>America/New_York</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center p-4 text-center">
        <div className="text-muted-foreground">
          Temporarily Out-Of-Office?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => setIsOverrideDialogOpen(true)}
          >
            Add a redirect
          </Button>
        </div>
      </div>

      {/* Date Override Dialog */}
      <Dialog
        open={isOverrideDialogOpen}
        onOpenChange={setIsOverrideDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Date Override</DialogTitle>
            <DialogDescription>
              Create a date override when your availability differs from your
              usual hours.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Availability</Label>
              <div className="flex items-center space-x-2">
                <Switch id="available" />
                <Label htmlFor="available">Available on this day</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOverrideDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addOverride}>Add Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog
        open={isNewScheduleDialogOpen}
        onOpenChange={setIsNewScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Create a new availability schedule with a custom name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                placeholder="e.g., Weekend Hours, Holiday Schedule"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newScheduleName.trim()) {
                    createNewSchedule();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewScheduleDialogOpen(false);
                setNewScheduleName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={createNewSchedule}
              disabled={!newScheduleName.trim()}
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
