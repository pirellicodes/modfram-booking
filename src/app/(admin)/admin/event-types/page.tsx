"use client";

import {
  Clock,
  Copy,
  Edit,
  Eye,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect,useState } from "react";

import { EventTypeForm } from "@/components/event-types/EventTypeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { EventTypeWithParsedFields } from "@/types/event-types";
import type { LocationObject } from "@/types/location";

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
      const res = await fetch("/api/event-types");
      const data = await res.json();
      if (data.success) setEventTypes(data.data);
    } catch (error) {
      console.error("Error fetching event types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEventType = (eventType: EventTypeWithParsedFields) => {
    if (editingEventType) {
      setEventTypes((prev) =>
        prev.map((et) => (et.id === eventType.id ? eventType : et))
      );
    } else {
      setEventTypes((prev) => [eventType, ...prev]);
    }
    setIsCreateFormOpen(false);
    setIsEditFormOpen(false);
    setEditingEventType(null);
  };

  const handleEditEventType = (eventType: EventTypeWithParsedFields) => {
    setEditingEventType(eventType);
    setIsEditFormOpen(true);
  };

  const handleDeleteEventType = async (id: string) => {
    if (!confirm("Delete this event type?")) return;
    try {
      const res = await fetch(`/api/event-types/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success)
        setEventTypes((prev) => prev.filter((et) => et.id !== id));
      else alert(data.error || "Failed to delete event type");
    } catch (error) {
      console.error("Error deleting event type:", error);
      alert("Failed to delete event type");
    }
  };

  const handleToggleVisibility = async (
    eventType: EventTypeWithParsedFields
  ) => {
    try {
      const res = await fetch(`/api/event-types/${eventType.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !eventType.hidden }),
      });
      const data = await res.json();
      if (data.success) {
        setEventTypes((prev) =>
          prev.map((et) =>
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
    alert("Event type link copied to clipboard");
  };

  const filteredEventTypes = eventTypes.filter(
    (et) =>
      et.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      et.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const getLocationLabel = (locations: LocationObject[] = []) => {
    if (!locations.length) return "No location";
    const loc = locations[0];

    switch (loc.type) {
      case "zoom":
        return "Zoom";
      case "in_person":
        return loc.address || "In person";
      case "phone":
        return loc.phone || "Phone";
      case "video":
      case "link":
        return loc.link || "Video";
      case "custom":
      default:
        return "Custom location";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading event types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Types</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your event types
          </p>
        </div>

        <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event Type
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search event types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
          {filteredEventTypes.map((et) => {
            const price =
              typeof et.price === "string"
                ? parseFloat(et.price)
                : et.price ?? 0;
            return (
              <Card key={et.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {et.title}
                      </CardTitle>
                      {et.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {et.description}
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
                          onClick={() => copyEventTypeLink(et.slug)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`/${et.slug}`, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditEventType(et)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleVisibility(et)}
                        >
                          {et.hidden ? "Show" : "Hide"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteEventType(et.id)}
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
                        {formatDuration(et.length)}
                      </div>
                      <Badge
                        variant={et.hidden ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {et.hidden ? "Hidden" : "Active"}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      📍 {getLocationLabel(et.locations)}
                    </div>

                    {price > 0 && (
                      <div className="text-sm font-medium">
                        {(et.currency || "usd").toUpperCase()}{" "}
                        {price.toFixed(2)}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      /{et.slug}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EventTypeForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSave={handleSaveEventType}
      />

      <EventTypeForm
        eventType={
          editingEventType
            ? { ...editingEventType, metadata: editingEventType.metadata ?? {} }
            : undefined
        }
        open={isEditFormOpen}
        onOpenChange={(open) => {
          setIsEditFormOpen(open);
          if (!open) setEditingEventType(null);
        }}
        onSave={handleSaveEventType}
      />
    </div>
  );
}
