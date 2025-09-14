"use client";

import {
  Camera,
  ChevronRightIcon,
  ClockIcon,
  Copy,
  EditIcon,
  Settings,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEventTypes } from "@/hooks/use-dashboard-data";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { EventType } from "@/types";

export function EventTypes() {
  const { data: eventTypes, loading, error, refetch } = useEventTypes();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: "",
    length: 30,
    description: "",
    price: 0,
  });

  const supabase = supabaseBrowser();

  const handleEditEventType = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setEditForm({
      title: eventType.title,
      length: eventType.length || 30,
      description: eventType.description || "",
      price:
        typeof eventType.price === "string"
          ? parseFloat(eventType.price)
          : eventType.price || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEventType = async () => {
    if (!selectedEventType) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("event_types")
        .update({
          title: editForm.title,
          length: editForm.length,
          description: editForm.description || null,
          price: editForm.price || null,
        })
        .eq("id", selectedEventType.id);

      if (error) throw error;

      toast.success("Event type updated successfully");
      setIsEditDialogOpen(false);
      setSelectedEventType(null);
      refetch();
    } catch (error) {
      console.error("Error updating event type:", error);
      toast.error("Failed to update event type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEventType = async (eventType: EventType) => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventType.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("event_types")
        .delete()
        .eq("id", eventType.id);

      if (error) throw error;

      toast.success("Event type deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting event type:", error);
      toast.error("Failed to delete event type");
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const copyEventTypeUrl = (eventType: EventType) => {
    const url = `modfram.com/${eventType.title
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Error loading event types: {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Event Types
          </h1>
          <p className="text-muted-foreground">
            Create events to share for people to book on your calendar.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="mb-4">
          <Input placeholder="Search..." className="max-w-sm" />
        </div>

        {eventTypes.length === 0 ? (
          <Card className="shadow-sm border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <ClockIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No event types</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You don&apos;t have any event types yet. Contact your
                administrator to create event types.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {eventTypes.map((eventType) => (
              <Card
                key={eventType.id}
                className="shadow-sm border hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="mr-4 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 p-3">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {eventType.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {formatDuration(
                                eventType.duration_minutes ||
                                  eventType.length ||
                                  30
                              )}
                            </div>
                            {eventType.price_cents &&
                              eventType.price_cents > 0 && (
                                <Badge variant="secondary">
                                  {formatCurrency(eventType.price_cents)}
                                </Badge>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyEventTypeUrl({
                            ...eventType,
                            locations: eventType.locations || [],
                            metadata: eventType.metadata || {},
                            bookingFields: eventType.bookingFields || [],
                            bookingLimits: eventType.bookingLimits || {},
                            durationLimits: eventType.durationLimits || {},
                            recurringEvent:
                              eventType.recurringEvent || undefined,
                          })
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy link
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleEditEventType({
                                ...eventType,
                                locations: eventType.locations || [],
                                metadata: eventType.metadata || {},
                                bookingFields: eventType.bookingFields || [],
                                bookingLimits: eventType.bookingLimits || {},
                                durationLimits: eventType.durationLimits || {},
                                recurringEvent:
                                  eventType.recurringEvent || undefined,
                              })
                            }
                          >
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              copyEventTypeUrl({
                                ...eventType,
                                locations: eventType.locations || [],
                                metadata: eventType.metadata || {},
                                bookingFields: eventType.bookingFields || [],
                                bookingLimits: eventType.bookingLimits || {},
                                durationLimits: eventType.durationLimits || {},
                                recurringEvent:
                                  eventType.recurringEvent || undefined,
                              })
                            }
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleDeleteEventType({
                                ...eventType,
                                locations: eventType.locations || [],
                                metadata: eventType.metadata || {},
                                bookingFields: eventType.bookingFields || [],
                                bookingLimits: eventType.bookingLimits || {},
                                durationLimits: eventType.durationLimits || {},
                                recurringEvent:
                                  eventType.recurringEvent || undefined,
                              })
                            }
                          >
                            <Trash2Icon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Event Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Event Type</DialogTitle>
            <DialogDescription>
              Update the details of your event type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Meeting"
              />
            </div>

            <div>
              <Label>URL</Label>
              <div className="flex items-center border rounded-md px-3 py-2">
                <span className="text-muted-foreground">
                  modfram.com/
                  {editForm.title.toLowerCase().replace(/\s+/g, "-")}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={editForm.length}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    length: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="A brief description of your event type"
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedEventType(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEventType} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
