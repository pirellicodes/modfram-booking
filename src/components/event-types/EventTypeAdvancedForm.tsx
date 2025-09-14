"use client";

import { Clock,Repeat, Settings, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { RecurringEvent } from "@/types/event-types";
import type { EventTypeFormData } from "@/types/forms";

interface EventTypeAdvancedFormProps {
  formData: EventTypeFormData;
  setFormData: (
    data: EventTypeFormData | ((prev: EventTypeFormData) => EventTypeFormData)
  ) => void;
}

export function EventTypeAdvancedForm({
  formData,
  setFormData,
}: EventTypeAdvancedFormProps) {
  const updateField = (field: keyof EventTypeFormData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateRecurringEvent = (
    field: keyof RecurringEvent,
    value: unknown
  ) => {
    type RecurringField = keyof RecurringEvent;
    const prev = (formData.recurringEvent ?? {}) as RecurringEvent;

    let recurring: RecurringEvent;
    if (value === null || value === "" || value === false) {
      const { [field as RecurringField]: _omit, ...rest } = prev as Record<
        string,
        unknown
      >;
      recurring = rest as RecurringEvent;
    } else {
      recurring = {
        ...prev,
        [field as RecurringField]: value,
      } as RecurringEvent;
    }

    setFormData((f) => ({ ...f, recurringEvent: recurring }));
  };

  const updateDurationLimit = (type: "min" | "max", value: number) => {
    const prev = formData.durationLimits || {};
    let limits: Record<string, unknown>;

    if (value === 0 || !value) {
      const { [type]: _omit, ...rest } = prev;
      limits = rest;
    } else {
      limits = { ...prev, [type]: value };
    }

    updateField("durationLimits", limits);
  };

  const isRecurringEnabled =
    formData.recurringEvent && Object.keys(formData.recurringEvent).length > 0;

  return (
    <div className="space-y-6">
      {/* Seats Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seats & Multi-Person Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seatsPerTimeSlot">Number of Seats</Label>
            <Input
              id="seatsPerTimeSlot"
              type="number"
              min="1"
              max="100"
              value={formData.seatsPerTimeSlot || ""}
              onChange={(e) =>
                updateField(
                  "seatsPerTimeSlot",
                  parseInt(e.target.value) || null
                )
              }
              placeholder="Leave empty for 1-on-1 meetings"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Allow multiple people to book the same time slot
            </p>
          </div>

          {formData.seatsPerTimeSlot && formData.seatsPerTimeSlot > 1 && (
            <div className="space-y-4">
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Attendees</Label>
                  <p className="text-sm text-muted-foreground">
                    Display other attendees&apos; names to bookers
                  </p>
                </div>
                <Switch
                  checked={formData.seatsShowAttendees || false}
                  onCheckedChange={(checked) =>
                    updateField("seatsShowAttendees", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Availability Count</Label>
                  <p className="text-sm text-muted-foreground">
                    Display remaining seats available
                  </p>
                </div>
                <Switch
                  checked={formData.seatsShowAvailabilityCount !== false}
                  onCheckedChange={(checked) =>
                    updateField("seatsShowAvailabilityCount", checked)
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurring Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Recurring Events</Label>
              <p className="text-sm text-muted-foreground">
                Allow bookers to schedule recurring sessions
              </p>
            </div>
            <Switch
              checked={isRecurringEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField("recurringEvent", {
                    freq: "WEEKLY",
                    interval: 1,
                    count: 4,
                  });
                } else {
                  updateField("recurringEvent", null);
                }
              }}
            />
          </div>

          {isRecurringEnabled && (
            <div className="space-y-4">
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={formData.recurringEvent?.freq || "WEEKLY"}
                    onValueChange={(value) =>
                      updateRecurringEvent("freq", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Interval</Label>
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.recurringEvent?.interval || 1}
                    onChange={(e) =>
                      updateRecurringEvent(
                        "interval",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Every X{" "}
                    {formData.recurringEvent?.freq?.toLowerCase() || "weeks"}
                  </p>
                </div>
              </div>

              <RadioGroup
                value={formData.recurringEvent?.count ? "count" : "until"}
                onValueChange={(value) => {
                  if (value === "count") {
                    updateRecurringEvent("count", 4);
                    updateRecurringEvent("until", null);
                  } else {
                    updateRecurringEvent("count", null);
                    updateRecurringEvent(
                      "until",
                      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    );
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="count" id="count" />
                    <div className="flex-1 flex items-center gap-2">
                      <Label htmlFor="count">Repeat for</Label>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        className="w-20"
                        value={formData.recurringEvent?.count || 4}
                        onChange={(e) =>
                          updateRecurringEvent(
                            "count",
                            parseInt(e.target.value) || 4
                          )
                        }
                        disabled={!formData.recurringEvent?.count}
                      />
                      <span className="text-sm">occurrences</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="until" id="until" />
                    <div className="flex-1 flex items-center gap-2">
                      <Label htmlFor="until">Repeat until</Label>
                      <Input
                        type="date"
                        className="w-40"
                        value={formData.recurringEvent?.until || ""}
                        onChange={(e) =>
                          updateRecurringEvent("until", e.target.value)
                        }
                        disabled={!formData.recurringEvent?.until}
                      />
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duration Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set minimum and maximum duration limits for variable-length bookings
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Duration (minutes)</Label>
              <Input
                type="number"
                min="5"
                max="1440"
                value={(formData.durationLimits?.min as number) || ""}
                onChange={(e) =>
                  updateDurationLimit("min", parseInt(e.target.value) || 0)
                }
                placeholder="No minimum"
              />
            </div>

            <div>
              <Label>Maximum Duration (minutes)</Label>
              <Input
                type="number"
                min="5"
                max="1440"
                value={(formData.durationLimits?.max as number) || ""}
                onChange={(e) =>
                  updateDurationLimit("max", parseInt(e.target.value) || 0)
                }
                placeholder="No maximum"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Event Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Cancellation</Label>
              <p className="text-sm text-muted-foreground">
                Allow bookers to cancel their appointments
              </p>
            </div>
            <Switch
              checked={formData.allow_cancellation !== false}
              onCheckedChange={(checked) =>
                updateField("allow_cancellation", checked)
              }
            />
          </div>

          <div>
            <Label htmlFor="userId">Event Owner (User ID)</Label>
            <Input
              id="userId"
              value={formData.userId || ""}
              onChange={(e) => updateField("userId", e.target.value)}
              placeholder="User ID who owns this event type"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The user who owns and manages this event type
            </p>
          </div>

          <div>
            <Label htmlFor="scheduleId">Default Schedule ID</Label>
            <Input
              id="scheduleId"
              value={formData.scheduleId || ""}
              onChange={(e) => updateField("scheduleId", e.target.value)}
              placeholder="Schedule ID for availability"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The default schedule to use for this event type
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add custom metadata as JSON for advanced integrations and
            customizations
          </p>

          <div>
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <textarea
              id="metadata"
              className="w-full min-h-[120px] p-3 border rounded-md font-mono text-sm"
              value={
                formData.metadata
                  ? JSON.stringify(formData.metadata, null, 2)
                  : "{}"
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateField("metadata", parsed);
                } catch {
                  // Invalid JSON - don&apos;t update
                }
              }}
              placeholder='{\n  "customField": "value",\n  "integrations": {\n    "zoom": true\n  }\n}'
            />
            <p className="text-sm text-muted-foreground mt-1">
              Must be valid JSON format
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
