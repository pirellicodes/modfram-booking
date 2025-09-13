"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, MapPin, Video, Users } from "lucide-react";
import type { EventTypeFormData } from "@/types/forms";

interface EventTypeBasicFormProps {
  formData: EventTypeFormData;
  setFormData: (data: EventTypeFormData) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EventTypeBasicForm({
  formData,
  setFormData,
}: EventTypeBasicFormProps) {
  const updateField = (field: keyof EventTypeFormData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTitleChange = (title: string) => {
    updateField("title", title);
    // Auto-generate slug if it hasn't been manually set
    if (!formData.slugManuallySet) {
      updateField("slug", slugify(title));
    }
  };

  const handleSlugChange = (slug: string) => {
    updateField("slug", slugify(slug));
    updateField("slugManuallySet", true);
  };

  const addLocation = () => {
    const newLocations = [...(formData.locations || []), { type: "zoom" }];
    updateField("locations", newLocations);
  };

  const updateLocation = (index: number, field: string, value: string) => {
    const newLocations = [...(formData.locations || [])];
    newLocations[index] = { ...newLocations[index], [field]: value };
    updateField("locations", newLocations);
  };

  const removeLocation = (index: number) => {
    const newLocations = formData.locations?.filter(
      (_, i: number) => i !== index
    );
    updateField("locations", newLocations);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "zoom":
        return <Video className="h-4 w-4" />;
      case "inPerson":
        return <MapPin className="h-4 w-4" />;
      case "custom":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getLocationPlaceholder = (type: string) => {
    switch (type) {
      case "zoom":
        return "Zoom meeting (automatically generated)";
      case "inPerson":
        return "Address or venue";
      case "custom":
        return "Custom location details";
      default:
        return "Location details";
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="30 Minute Meeting"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {window.location.origin}/
              </span>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="30min"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This is the link people will use to book with you
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="A quick catch up to discuss..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Duration (minutes) *</Label>
              <Input
                id="length"
                type="number"
                value={formData.length || 30}
                onChange={(e) =>
                  updateField("length", parseInt(e.target.value) || 30)
                }
                min="5"
                max="1440"
              />
            </div>

            <div>
              <Label htmlFor="eventName">Event Name Template</Label>
              <Input
                id="eventName"
                value={formData.eventName || ""}
                onChange={(e) => updateField("eventName", e.target.value)}
                placeholder="{TITLE} between {ORGANIZER} and {ATTENDEE}"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional custom name for calendar events
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Hidden Event Type</Label>
              <p className="text-sm text-muted-foreground">
                Hide this event type from your public page
              </p>
            </div>
            <Switch
              checked={formData.hidden || false}
              onCheckedChange={(checked) => updateField("hidden", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Locations</CardTitle>
            <Button onClick={addLocation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.locations?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No locations added. Add at least one location option.
            </p>
          )}

          {formData.locations?.map((location, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 border rounded-lg bg-card"
            >
              <div className="mt-2">{getLocationIcon(location.type)}</div>

              <div className="flex-1 space-y-3">
                <Select
                  value={location.type}
                  onValueChange={(value) =>
                    updateLocation(index, "type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="inPerson">In Person</SelectItem>
                    <SelectItem value="custom">Custom Text</SelectItem>
                  </SelectContent>
                </Select>

                {(location.type === "inPerson" ||
                  location.type === "custom") && (
                  <Input
                    value={
                      location.type === "inPerson"
                        ? location.address || ""
                        : location.type === "custom"
                        ? location.text || ""
                        : ""
                    }
                    onChange={(e) => {
                      const field =
                        location.type === "inPerson" ? "address" : "text";
                      updateLocation(index, field, e.target.value);
                    }}
                    placeholder={getLocationPlaceholder(location.type)}
                  />
                )}
              </div>

              {formData.locations && formData.locations.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLocation(index)}
                  className="mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || "0.00"}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  updateField("price", price.toFixed(2));
                  updateField("is_paid", price > 0);
                }}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                value={formData.currency || "USD"}
                onValueChange={(value) => updateField("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {parseFloat(formData.price || "0") > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <div>
                <Label htmlFor="deposit_cents">Deposit Required (cents)</Label>
                <Input
                  id="deposit_cents"
                  type="number"
                  value={formData.deposit_cents || ""}
                  onChange={(e) =>
                    updateField(
                      "deposit_cents",
                      parseInt(e.target.value) || null
                    )
                  }
                  placeholder="0 (no deposit required)"
                  min="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Amount in cents to collect as deposit (e.g., 5000 for $50.00)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Agreement</Label>
                  <p className="text-sm text-muted-foreground">
                    Require bookers to accept terms before payment
                  </p>
                </div>
                <Switch
                  checked={formData.require_agreement || false}
                  onCheckedChange={(checked) =>
                    updateField("require_agreement", checked)
                  }
                />
              </div>

              {formData.require_agreement && (
                <div>
                  <Label htmlFor="agreement_text">Agreement Text</Label>
                  <Textarea
                    id="agreement_text"
                    value={formData.agreement_text || ""}
                    onChange={(e) =>
                      updateField("agreement_text", e.target.value)
                    }
                    placeholder="I agree to the terms and conditions..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Text that users must agree to before booking
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Booking Type</Label>
            <Select
              value={formData.schedulingType || "PERSONAL"}
              onValueChange={(value) => updateField("schedulingType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">Personal Booking</SelectItem>
                <SelectItem value="GROUP">Group Session</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the type of booking for this event
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slotInterval">Slot Interval (minutes)</Label>
              <Input
                id="slotInterval"
                type="number"
                value={formData.slotInterval || ""}
                onChange={(e) =>
                  updateField("slotInterval", parseInt(e.target.value) || null)
                }
                placeholder="Auto (based on duration)"
                min="5"
                max="1440"
              />
            </div>

            <div>
              <Label>Time Zone</Label>
              <Select
                value={formData.timeZone || ""}
                onValueChange={(value) => updateField("timeZone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
