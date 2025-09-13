"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EventTypeWithParsedFields } from "@/lib/types";
import { FormData } from "@/types/event-types";

interface EventTypeAvailabilityFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function EventTypeAvailabilityForm({
  formData,
  setFormData,
}: EventTypeAvailabilityFormProps) {
  const updateField = (
    field: keyof EventTypeWithParsedFields,
    value: unknown
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  return (
    <div className="space-y-6">
      {/* Booking Window */}
      <Card>
        <CardHeader>
          <CardTitle>When can people book this event?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={formData.periodType || "UNLIMITED"}
            onValueChange={(value) => updateField("periodType", value)}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UNLIMITED" id="unlimited" />
                <div className="flex-1">
                  <Label htmlFor="unlimited" className="text-base font-medium">
                    Indefinitely into the future
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    No booking restrictions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ROLLING" id="rolling" />
                <div className="flex-1">
                  <Label htmlFor="rolling" className="text-base font-medium">
                    Accept bookings for a rolling period
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bookings accepted for a specific number of days into the
                    future
                  </p>
                  {formData.periodType === "ROLLING" && (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.periodDays || 30}
                        onChange={(e) =>
                          updateField(
                            "periodDays",
                            parseInt(e.target.value) || 30
                          )
                        }
                        className="w-20"
                        min="1"
                        max="365"
                      />
                      <span className="text-sm text-muted-foreground">
                        days into the future
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RANGE" id="range" />
                <div className="flex-1">
                  <Label htmlFor="range" className="text-base font-medium">
                    Accept bookings within a date range
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bookings accepted between specific start and end dates
                  </p>
                  {formData.periodType === "RANGE" && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          type="date"
                          value={
                            formData.periodStartDate
                              ? formData.periodStartDate instanceof Date
                                ? formData.periodStartDate
                                    .toISOString()
                                    .split("T")[0]
                                : String(formData.periodStartDate).split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateField(
                              "periodStartDate",
                              e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Date</Label>
                        <Input
                          type="date"
                          value={
                            formData.periodEndDate
                              ? formData.periodEndDate instanceof Date
                                ? formData.periodEndDate
                                    .toISOString()
                                    .split("T")[0]
                                : String(formData.periodEndDate).split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateField(
                              "periodEndDate",
                              e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>

          {formData.periodType === "ROLLING" && (
            <div className="flex items-center justify-between">
              <div>
                <Label>Count only business days</Label>
                <p className="text-sm text-muted-foreground">
                  Exclude weekends from the rolling period calculation
                </p>
              </div>
              <Switch
                checked={!formData.periodCountCalendarDays}
                onCheckedChange={(checked) =>
                  updateField("periodCountCalendarDays", !checked)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minimum Booking Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Minimum Booking Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How much notice do you need?</Label>
            <Select
              value={formData.minimumBookingNotice?.toString() || "120"}
              onValueChange={(value) =>
                updateField("minimumBookingNotice", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No minimum</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="720">12 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
                <SelectItem value="2880">2 days</SelectItem>
                <SelectItem value="4320">3 days</SelectItem>
                <SelectItem value="10080">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Currently: {formatMinutes(formData.minimumBookingNotice || 120)}{" "}
              in advance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Buffer Times */}
      <Card>
        <CardHeader>
          <CardTitle>Buffer Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add buffer time before or after your events to prevent back-to-back
            bookings
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Before Event</Label>
              <Select
                value={formData.beforeEventBuffer?.toString() || "0"}
                onValueChange={(value) =>
                  updateField("beforeEventBuffer", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>After Event</Label>
              <Select
                value={formData.afterEventBuffer?.toString() || "0"}
                onValueChange={(value) =>
                  updateField("afterEventBuffer", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slot Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show only the first available slot</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, only the next available time slot is displayed
              </p>
            </div>
            <Switch
              checked={formData.onlyShowFirstAvailableSlot || false}
              onCheckedChange={(checked) =>
                updateField("onlyShowFirstAvailableSlot", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
