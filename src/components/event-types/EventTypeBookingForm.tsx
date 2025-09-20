"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface EventTypeBookingFormProps {
  formData: EventTypeFormData;
  setFormData: (data: EventTypeFormData) => void;
}

export function EventTypeBookingForm({
  formData,
  setFormData,
}: EventTypeBookingFormProps) {
  const updateField = (
    field: keyof EventTypeWithParsedFields,
    value: unknown
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const addBookingField = () => {
    const newFields = [
      ...(formData.bookingFields || []),
      {
        name: "",
        type: "text",
        label: "",
        required: false,
        placeholder: "",
      },
    ];
    updateField("bookingFields", newFields);
  };

  const updateBookingField = (index: number, field: string, value: unknown) => {
    const newFields = [...(formData.bookingFields || [])];
    newFields[index] = {
      ...(newFields[index] as Record<string, unknown>),
      [field]: value,
    };
    updateField("bookingFields", newFields);
  };

  const removeBookingField = (index: number) => {
    const newFields = formData.bookingFields?.filter(
      (_, i: number) => i !== index
    );
    updateField("bookingFields", newFields);
  };

  const updateBookingLimit = (period: string, value: number) => {
    const limits = { ...formData.bookingLimits };
    if (value === 0 || !value) {
      delete limits[period];
    } else {
      (limits as Record<string, unknown>)[period] = value;
    }
    updateField("bookingLimits", limits);
  };

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" },
  ];

  return (
    <div className="space-y-6">
      {/* Confirmation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmation & Guests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Requires Confirmation</Label>
              <p className="text-sm text-muted-foreground">
                Bookings will need to be manually approved
              </p>
            </div>
            <Switch
              checked={formData.requiresConfirmation || false}
              onCheckedChange={(checked) =>
                updateField("requiresConfirmation", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Hide Calendar Notes</Label>
              <p className="text-sm text-muted-foreground">
                Don&apos;t show booking form responses in calendar event
                description
              </p>
            </div>
            <Switch
              checked={formData.hideCalendarNotes || false}
              onCheckedChange={(checked) =>
                updateField("hideCalendarNotes", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Success Redirect */}
      <Card>
        <CardHeader>
          <CardTitle>After Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="successRedirectUrl">Success Redirect URL</Label>
            <Input
              id="successRedirectUrl"
              type="url"
              value={formData.successRedirectUrl || ""}
              onChange={(e) =>
                updateField("successRedirectUrl", e.target.value)
              }
              placeholder="https://example.com/thank-you"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Redirect users to this URL after successful booking (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Booking Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Custom Booking Fields</CardTitle>
            <Button onClick={addBookingField} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.bookingFields?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No custom fields added. Add fields to collect additional
              information from bookers.
            </p>
          )}

          {formData.bookingFields?.map((field, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Field {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBookingField(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Field Type</Label>
                  <Select
                    value={(field as any)?.type || "text"}
                    onValueChange={(value) =>
                      updateBookingField(index, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Name (ID)</Label>
                  <Input
                    value={(field as any)?.name || ""}
                    onChange={(e) =>
                      updateBookingField(index, "name", e.target.value)
                    }
                    placeholder="field_name"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={(field as any)?.label || ""}
                  onChange={(e) =>
                    updateBookingField(index, "label", e.target.value)
                  }
                  placeholder="Field label shown to users"
                />
              </div>

              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={(field as any)?.placeholder || ""}
                  onChange={(e) =>
                    updateBookingField(index, "placeholder", e.target.value)
                  }
                  placeholder="Placeholder text"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${index}`}
                  checked={(field as any)?.required || false}
                  onCheckedChange={(checked) =>
                    updateBookingField(index, "required", checked)
                  }
                />
                <Label htmlFor={`required-${index}`} className="text-sm">
                  Required field
                </Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
