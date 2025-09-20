"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { EventTypeWithParsedFields } from "@/types/event-types";
import type { EventTypeFormData } from "@/types/forms";

interface EventTypeAvailabilityFormProps {
  formData: EventTypeFormData;
  setFormData: (data: EventTypeFormData) => void;
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
