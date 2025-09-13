"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Users,
  Settings,
  Trash2,
  Edit,
  Eye,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EventTypeForm } from "@/components/event-types/EventTypeForm";
import { EventType } from "@/db/schema";

interface LocationObject {
  type: string;
  address?: string;
  link?: string;
  phone?: string;
}

interface BookingField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface BookingLimits {
  day?: number;
  week?: number;
  month?: number;
  year?: number;
}

interface DurationLimits {
  min?: number;
  max?: number;
}

interface RecurringEvent {
  freq?: string;
  interval?: number;
  count?: number;
  until?: string;
}

interface EventTypeWithParsedFields
  extends Omit<
    EventType,
    | "locations"
    | "metadata"
    | "bookingFields"
    | "bookingLimits"
    | "durationLimits"
    | "recurringEvent"
  > {
  locations?: LocationObject[];
  metadata?: Record<string, unknown>;
  bookingFields?: BookingField[];
  bookingLimits?: BookingLimits;
  durationLimits?: DurationLimits;
  recurringEvent?: RecurringEvent;
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventTypeWithParsedFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingEventType, setEditingEventType] =
    useState<EventTypeWithParsedFields | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await fetch("/api/event-types");
      const data = await response.json();

      if (data.success) {
        setEventTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching event types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEventType = (eventType: EventTypeWithParsedFields) => {
    if (editingEventType) {
      // Update existing
      setEventTypes(
        eventTypes.map((et) => (et.id === eventType.id ? eventType : et))
      );
    } else {
      // Add new
      setEventTypes([eventType, ...eventTypes]);
    }

    // Close forms
    setIsCreateFormOpen(false);
    setIsEditFormOpen(false);
    setEditingEventType(null);
  };

  const handleEditEventType = (eventType: EventTypeWithParsedFields) => {
    setEditingEventType(eventType);
    setIsEditFormOpen(true);
  };

  const handleDeleteEventType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event type?")) {
      return;
    }

    try {
      const response = await fetch(`/api/event-types/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setEventTypes(eventTypes.filter((et) => et.id !== id));
      } else {
        alert(data.error || "Failed to delete event type");
      }
    } catch (error) {
      console.error("Error deleting event type:", error);
      alert("Failed to delete event type");
    }
  };

  const handleToggleVisibility = async (
    eventType: EventTypeWithParsedFields
  ) => {
    try {
      const response = await fetch(`/api/event-types/${eventType.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: !eventType.hidden }),
      });

      const data = await response.json();

      if (data.success) {
        setEventTypes(
          eventTypes.map((et) =>
            et.id === eventType.id ? { ...et, hidden: !et.hidden } : et
          )
        );
      } else {
        alert(data.error || "Failed to update event type");
      }
    } catch (error) {
      console.error("Error updating event type:", error);
      alert("Failed to update event type");
    }
  };

  const copyEventTypeLink = (slug: string) => {
    const link = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(link);
    alert("Event type link copied to clipboard!");
  };

  const filteredEventTypes = eventTypes.filter(
    (eventType) =>
      eventType.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventType.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getLocationLabel = (
    locations: Array<{
      type: string;
      address?: string;
      text?: string;
    }> = []
  ) => {
    if (!locations.length) return "No location";

    const location = locations[0];
    switch (location.type) {
      case "zoom":
        return "Zoom";
      case "inPerson":
        return location.address || "In person";
      case "custom":
        return location.text || "Custom location";
      default:
        return "Custom location";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading event types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Types</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your event types exactly like Cal.com
          </p>
        </div>

        <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event Type
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search event types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Event Types Grid */}
      {filteredEventTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No event types found" : "No event types yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first event type to start accepting bookings"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event Type
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventTypes.map((eventType) => (
            <Card
              key={eventType.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {eventType.title}
                    </CardTitle>
                    {eventType.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {eventType.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => copyEventTypeLink(eventType.slug)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(`/${eventType.slug}`, "_blank")
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditEventType(eventType)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleVisibility(eventType)}
                      >
                        {eventType.hidden ? "Show" : "Hide"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteEventType(eventType.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(eventType.length)}
                    </div>
                    <Badge
                      variant={eventType.hidden ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {eventType.hidden ? "Hidden" : "Active"}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    📍 {getLocationLabel(eventType.locations)}
                  </div>

                  {eventType.price &&
                    parseFloat(eventType.price.toString()) > 0 && (
                      <div className="text-sm font-medium">
                        {eventType.currency} {eventType.price}
                      </div>
                    )}

                  {eventType.seatsPerTimeSlot &&
                    eventType.seatsPerTimeSlot > 1 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {eventType.seatsPerTimeSlot} seats
                      </div>
                    )}

                  <div className="text-xs text-muted-foreground">
                    /{eventType.slug}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form */}
      <EventTypeForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSave={handleSaveEventType}
      />

      {/* Edit Form */}
      <EventTypeForm
        eventType={editingEventType || undefined}
        open={isEditFormOpen}
        onOpenChange={(open) => {
          setIsEditFormOpen(open);
          if (!open) {
            setEditingEventType(null);
          }
        }}
        onSave={handleSaveEventType}
      />
    </div>
  );
}
