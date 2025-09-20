"use client";

import { useRef, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { ColorOptionItem } from "@/components/event-calendar/ui/color-option-item";
import { slugify, isValidSlug } from "@/lib/slug";
import type { EventTypeFormData } from "@/types/forms";

interface EventTypeBasicFormProps {
  formData: EventTypeFormData;
  setFormData: (data: EventTypeFormData) => void;
}

export function EventTypeBasicForm({
  formData,
  setFormData,
}: EventTypeBasicFormProps) {
  // Track if user has manually edited slug (Cal.com-style)
  const manualSlug = useRef(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const updateField = (field: keyof EventTypeFormData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTitleChange = (title: string) => {
    updateField("title", title);
    // Auto-derive slug from title in real time until user manually edits slug
    if (!manualSlug.current) {
      updateField("slug", slugify(title));
    }
  };

  const handleSlugChange = (slug: string) => {
    // Allow free typing, don't auto-slugify during typing
    updateField("slug", slug);
    manualSlug.current = true; // Mark as manually edited

    // Show inline error if invalid, but don't block typing
    if (slug && !isValidSlug(slug)) {
      setSlugError(
        "Slug must be 2-60 characters, lowercase letters, numbers, and hyphens only"
      );
    } else {
      setSlugError(null);
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
            <Label htmlFor="title">Session Title *</Label>
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
                className={slugError ? "border-red-500" : ""}
              />
            </div>
            {slugError && (
              <p className="text-sm text-red-500 mt-1">{slugError}</p>
            )}
            {!slugError && (
              <p className="text-sm text-muted-foreground mt-1">
                This is the link people will use to book with you
              </p>
            )}
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
            <Label htmlFor="color">Color Theme</Label>
            <Select
              value={formData.color || "indigo"}
              onValueChange={(value) => updateField("color", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <ColorOptionItem
                  value="indigo"
                  label="Indigo"
                  className="bg-indigo-500"
                />
                <ColorOptionItem
                  value="blue"
                  label="Blue"
                  className="bg-blue-500"
                />
                <ColorOptionItem
                  value="green"
                  label="Green"
                  className="bg-green-500"
                />
                <ColorOptionItem
                  value="red"
                  label="Red"
                  className="bg-red-500"
                />
                <ColorOptionItem
                  value="orange"
                  label="Orange"
                  className="bg-orange-500"
                />
                <ColorOptionItem
                  value="purple"
                  label="Purple"
                  className="bg-purple-500"
                />
                <ColorOptionItem
                  value="pink"
                  label="Pink"
                  className="bg-pink-500"
                />
                <ColorOptionItem
                  value="yellow"
                  label="Yellow"
                  className="bg-yellow-500"
                />
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a color theme for this session type in the calendar
            </p>
          </div>

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
              <Label htmlFor="deposit">Deposit</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={
                  formData.deposit_cents
                    ? (formData.deposit_cents / 100).toFixed(2)
                    : "0.00"
                }
                onChange={(e) => {
                  const deposit = parseFloat(e.target.value) || 0;
                  updateField("deposit_cents", Math.round(deposit * 100));
                }}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="locationType">Location Type</Label>
            <Select
              value={formData.locations?.[0]?.type || "zoom"}
              onValueChange={(value) => {
                const newLocation = { type: value };
                updateField("locations", [newLocation]);
              }}
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
          </div>

          {formData.locations?.[0]?.type === "inPerson" && (
            <div>
              <Label htmlFor="locationAddress">Address</Label>
              <Input
                id="locationAddress"
                value={formData.locations[0].address || ""}
                onChange={(e) => {
                  const newLocation = {
                    ...formData.locations[0],
                    address: e.target.value,
                  };
                  updateField("locations", [newLocation]);
                }}
                placeholder="Address or venue"
              />
            </div>
          )}

          {formData.locations?.[0]?.type === "custom" && (
            <div>
              <Label htmlFor="locationText">Location Details</Label>
              <Input
                id="locationText"
                value={formData.locations[0].text || ""}
                onChange={(e) => {
                  const newLocation = {
                    ...formData.locations[0],
                    text: e.target.value,
                  };
                  updateField("locations", [newLocation]);
                }}
                placeholder="Custom location details"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
